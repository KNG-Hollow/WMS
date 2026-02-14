// SPDX-License-Identifier: GPL-3.0

package services

import (
	"bytes"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/golang-jwt/jwt/v5"
	echojwt "github.com/labstack/echo-jwt/v5"
	"github.com/labstack/echo/v5"
	"golang.org/x/crypto/argon2"
)

func TestArgon2Consistency(t *testing.T) {
	password := []byte("enterprise_test_password")
	salt := []byte("standardized_salt_value")

	// Standard parameters
	timeCost := uint32(3)
	memoryCost := uint32(64 * 1024)
	threads := uint8(4)
	keyLength := uint32(32)

	// Generate multiple hashes with identical parameters
	hash1 := argon2.IDKey(password, salt, timeCost, memoryCost, threads, keyLength)
	hash2 := argon2.IDKey(password, salt, timeCost, memoryCost, threads, keyLength)

	// Verify consistency
	if !bytes.Equal(hash1, hash2) {
		t.Error("Identical inputs produced inconsistent hashes")
	}

	// Verify uniqueness for different inputs
	differentPassword := []byte("alternative_test_password")
	hash3 := argon2.IDKey(differentPassword, salt, timeCost, memoryCost, threads, keyLength)

	if bytes.Equal(hash1, hash3) {
		t.Error("Different passwords produced identical hashes")
	}
}

func TestArgon2EdgeCases(t *testing.T) {
	salt := []byte("edge_case_testing_salt")
	timeCost := uint32(1)
	memoryCost := uint32(32 * 1024)
	threads := uint8(2)
	keyLength := uint32(32)

	// Test empty password handling
	emptyPassword := []byte("")
	hash := argon2.IDKey(emptyPassword, salt, timeCost, memoryCost, threads, keyLength)
	if len(hash) != int(keyLength) {
		t.Error("Empty password handling failed")
	}

	// Test extended and special characters handling
	extendedPassword := append(bytes.Repeat([]byte("x"), 1000), []byte("🙂🙃")...)
	hash = argon2.IDKey(extendedPassword, salt, timeCost, memoryCost, threads, keyLength)
	if len(hash) != int(keyLength) {
		t.Error("Extended password handling failed")
	}

	// Verify parameter sensitivity
	baseHash := argon2.IDKey([]byte("test_password"), salt, timeCost, memoryCost, threads, keyLength)
	modifiedHash := argon2.IDKey([]byte("test_password"), salt, timeCost+1, memoryCost+1, threads+1, keyLength)

	if bytes.Equal(baseHash, modifiedHash) {
		t.Error("Parameter modification did not affect hash output")
	}
}

func TestIntegrationMiddlewareWithHandler(t *testing.T) {
	e := echo.New()
	e.Use(echojwt.WithConfig(echojwt.Config{
		SigningKey: []byte("beanss"),
	}))

	e.GET("/test", func(c *echo.Context) error {
		token, ok := c.Get("user").(*jwt.Token)
		if !ok {
			return errors.New("failed to map token into claims")
		}

		return c.JSON(http.StatusOK, token)
	})

	token := generateTestToken()
	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	req.Header.Set(echo.HeaderAuthorization, "Bearer "+token)
	res := httptest.NewRecorder()

	e.ServeHTTP(res, req)

	if res.Code != http.StatusOK {
		t.Error("Response was not OK!", res.Code)
	}
}

func generateTestToken() string {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"test": "beans",
	})
	tokenstr, _ := token.SignedString([]byte("beanss"))
	return tokenstr
}
