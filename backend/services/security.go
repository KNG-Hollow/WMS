// SPDX-License-Identifier: GPL-3.0

package services

import (
	"context"
	"crypto/rand"
	"crypto/rsa"
	"crypto/subtle"
	"crypto/x509"
	"encoding/base64"
	"encoding/pem"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/WMS/models"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5"
	"github.com/labstack/echo/v5"
	"golang.org/x/crypto/argon2"
)

type Argon2Config struct {
	HashRaw    []byte
	Salt       []byte
	TimeCost   uint32
	MemoryCost uint32
	Threads    uint8
	KeyLength  uint32
}

func generateCryptographicSalt(saltSize uint32) ([]byte, error) {
	salt := make([]byte, saltSize)
	_, err := rand.Read(salt)
	if err != err {
		return nil, fmt.Errorf("salt generation failed: %w", err)
	}
	return salt, nil
}

func hashPassword(password string) (string, error) {
	config := &Argon2Config{
		TimeCost:   2,
		MemoryCost: 64 * 1024,
		Threads:    4,
		KeyLength:  32,
	}

	salt, err := generateCryptographicSalt(16)
	if err != nil {
		return "", fmt.Errorf("password hashing failed: %w", err)
	}
	config.Salt = salt

	config.HashRaw = argon2.IDKey(
		[]byte(password),
		config.Salt,
		config.TimeCost,
		config.MemoryCost,
		config.Threads,
		config.KeyLength,
	)

	encodedHash := fmt.Sprintf(
		"$argon2id$v=%d$m=%d,t=%d,p=%d$%s$%s",
		argon2.Version,
		config.MemoryCost,
		config.TimeCost,
		config.Threads,
		base64.RawStdEncoding.EncodeToString(config.Salt),
		base64.RawStdEncoding.EncodeToString(config.HashRaw),
	)

	return encodedHash, nil
}

func parseArgon2Hash(encodedHash string) (*Argon2Config, error) {
	log.Printf("received hash %s\n", encodedHash)
	components := strings.Split(encodedHash, "$")
	if len(components) != 6 {
		return nil, errors.New("invalid hash format structure")
	}

	if !strings.HasPrefix(components[1], "argon2id") {
		return nil, errors.New("unsupported algorithm variant")
	}

	var version int
	fmt.Sscanf(components[2], "v=%d", &version)

	config := &Argon2Config{}
	fmt.Sscanf(components[3], "m=%d,t=%d,p=%d", &config.MemoryCost, &config.TimeCost, &config.Threads)

	salt, err := base64.RawStdEncoding.DecodeString(components[4])
	if err != nil {
		return nil, fmt.Errorf("salt decoding failed: %w", err)
	}
	config.Salt = salt

	hash, err := base64.RawStdEncoding.DecodeString(components[5])
	if err != nil {
		return nil, fmt.Errorf("hash decoding failed: %w", err)
	}
	config.HashRaw = hash
	config.KeyLength = uint32(len(hash))

	return config, nil
}

func verifyPassword(storedHash, providedPassword string) (bool, error) {
	config, err := parseArgon2Hash(storedHash)
	if err != nil {
		return false, fmt.Errorf("hash parsing failed: %w", err)
	}

	computedHash := argon2.IDKey(
		[]byte(providedPassword),
		config.Salt,
		config.TimeCost,
		config.MemoryCost,
		config.Threads,
		config.KeyLength,
	)

	match := subtle.ConstantTimeCompare(config.HashRaw, computedHash)

	if match == 0 {
		return false, fmt.Errorf("verification failed: match returned false")
	}
	return true, nil
}

func ValidateLogin(username string, password string) (*models.Account, error) {
	conn := Connect()
	defer conn.Close(context.Background())

	fmt.Println("Attempting To [Authorize] Account:", username)
	rows, _ := conn.Query(context.Background(), "select id, username, password, role, active from account where username=$1", username)
	accounts, err := pgx.CollectRows(rows, func(row pgx.CollectableRow) (models.Account, error) {
		var n models.Account
		err := row.Scan(
			&n.ID,
			&n.Username,
			&n.Password,
			&n.Role,
			&n.Active,
		)
		if err != nil {
			return models.Account{}, err
		}
		return n, nil
	})
	if err != nil {
		fmt.Printf("CollectRows error: %v", err)
		return nil, err
	}
	if len(accounts) > 1 {
		var n []int
		for _, v := range accounts {
			n = append(n, int(v.ID))
		}
		return nil, fmt.Errorf(
			"duplicate account entries with username: %s :: %v",
			username,
			n,
		)
	}

	acc := accounts[0]
	if acc.Active != true {
		return nil, errors.New("account is not active")
	}
	isValid, err := verifyPassword(acc.Password, password)
	if err != nil {
		return nil, fmt.Errorf("authentication process failed: %w\n", err)
	}
	if !isValid {
		return nil, fmt.Errorf("authentication credentials invalid\n")
	}

	fmt.Println("Successfully [Authenticated] Account:", username)
	return &acc, nil
}

func InitJWT(acc *models.Account) (map[string]string, error) {
	claims := &models.JwtCustomClaims{
		ID:       acc.ID,
		Username: acc.Username,
		Role:     acc.Role,
	}
	token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)

	var jwtKey *rsa.PrivateKey

	jwtKey, err := LoadRSAPrivateKey(os.Getenv("JWTKEY"))
	if err != nil {
		jwtKey, err = LoadRSAPrivateKey("../wms-jwt.pem")
		if err != nil {
			return nil, fmt.Errorf("Failed to open JWT Key: %w", err)
		}
	}

	t, err := token.SignedString(jwtKey)
	if err != nil {
		return nil, err
	}

	return map[string]string{
		"token": t,
	}, nil
}

func DecodeJWT(c *echo.Context) (jwt.MapClaims, error) {
	token, err := echo.ContextGet[*jwt.Token](c, "user")
	if err != nil {
		return nil, echo.ErrUnauthorized.Wrap(err)
	}
	claims, ok := token.Claims.(jwt.MapClaims) // by default claims is of type `jwt.MapClaims`
	if !ok {
		return nil, errors.New("failed to cast claims as jwt.MapClaims")
	}
	return claims, nil
}

func AuthorizeRequest(c *echo.Context) error {
	fmt.Println("Authorizing HTTP request...")
	user, err := echo.ContextGet[*jwt.Token](c, "user")
	if err != nil {
		return echo.ErrUnauthorized.Wrap(err)
	}
	claims, ok := user.Claims.(*models.JwtCustomClaims)
	if !ok {
		return errors.New("failed to cast claims as jwt.MapClaims")
	}
	log.Println(claims)

	// TODO Add role based JWT authorization
	idParam := c.Param("id")
	id, _ := strconv.Atoi(idParam)
	path := c.Request().URL.Path

	if (strings.Contains(path, "accounts") && claims.ID != int64(id)) && claims.Role.Value != "ADMIN" {
		return echo.ErrUnauthorized
	}

	fmt.Println("User Authorized!")
	return nil
}

func Accessible(c *echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"status": "Accessible"})
}

func Restricted(c *echo.Context) error {
	user, err := echo.ContextGet[*jwt.Token](c, "user")
	if err != nil {
		return echo.ErrUnauthorized.Wrap(err)
	}
	claims, ok := user.Claims.(jwt.MapClaims)
	if !ok {
		return errors.New("failed to cast claims as jwt.MapClaims")
	}
	return c.JSON(http.StatusOK, claims)

}

func LoadRSAPrivateKey(path string) (*rsa.PrivateKey, error) {
	keyData, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("error reading JWT key file at %s: %w", path, err)
	}

	block, _ := pem.Decode(keyData)

	var privKey any
	switch block.Type {
	case "PRIVATE KEY":
		// PKCS#8
		privKey, err = x509.ParsePKCS8PrivateKey(block.Bytes)
		if err != nil {
			return nil, fmt.Errorf("error parsing PKCS#8 private key: %w", err)
		}
	case "RSA PRIVATE KEY":
		// PKCS#1
		privKey, err = x509.ParsePKCS1PrivateKey(block.Bytes)
		if err != nil {
			return nil, fmt.Errorf("error parsing PKCS#1 private key: %w", err)
		}
	default:
		return nil, errors.New("unsupported key type")
	}

	rsaPrivateKey, ok := privKey.(*rsa.PrivateKey)
	if !ok {
		return nil, errors.New("not an RSA private key")
	}

	return rsaPrivateKey, nil
}

func LoadRSAPublicKey(path string) (*rsa.PublicKey, error) {
	keyData, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("error reading public JWT key file at %s: %w", path, err)
	}

	block, _ := pem.Decode(keyData)
	if block == nil || block.Type != "PUBLIC KEY" {
		return nil, errors.New("failed to decode public key")
	}

	pubKey, err := x509.ParsePKIXPublicKey(block.Bytes)
	if err != nil {
		return nil, fmt.Errorf("failed to parse public key: %w", err)
	}

	rsaPublicKey, ok := pubKey.(*rsa.PublicKey)
	if !ok {
		return nil, errors.New("not an RSA public key")
	}

	return rsaPublicKey, nil
}
