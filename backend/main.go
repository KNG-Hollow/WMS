// SPDX-License-Identifier: GPL-3.0

package main

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/KNG-Hollow/WMS/backend/models"
	"github.com/KNG-Hollow/WMS/backend/routers"
	"github.com/KNG-Hollow/WMS/backend/services"
	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
	echojwt "github.com/labstack/echo-jwt/v5"
	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
)

func main() {
	var tlscrt []byte
	var tlskey []byte
	err := godotenv.Load()
	if err != nil {
		fmt.Println("Error loading .env file")
	}

	Rdb := services.InitRedisClient()
	defer Rdb.Close()

	jwtKey, err := services.LoadRSAPublicKey(os.Getenv("JWTPUBKEY"))
	if err != nil {
		fmt.Println("Failed to open JWT Key at:", os.Getenv("JWTPUBKEY"))
		jwtKey, err = services.LoadRSAPublicKey("../jwt-pub.pem")
		if err != nil {
			fmt.Println("Failed to open JWT Key")
			os.Exit(1)
		}
	}

	tlscrt, err = os.ReadFile(os.Getenv("TLSCRT"))
	if err != nil {
		tlscrt, err = os.ReadFile("../cert.pem")
		if err != nil {
			fmt.Println("Failed to open TLS Certificate")
			os.Exit(1)
		}
	}
	tlskey, err = os.ReadFile(os.Getenv("TLSKEY"))
	if err != nil {
		tlskey, err = os.ReadFile("../key.pem")
		if err != nil {
			fmt.Println("Failed to open TLS Key")
			os.Exit(1)
		}
	}

	e := echo.New()
	e.Logger = slog.New(slog.NewJSONHandler(os.Stdout, nil))

	e.Pre(middleware.HTTPSRedirect())

	jwtConfig := echojwt.WithConfig(echojwt.Config{
		NewClaimsFunc: func(c *echo.Context) jwt.Claims {
			return new(models.JwtCustomClaims)
		},
		SigningKey:    jwtKey,
		SigningMethod: "RS256",
	})

	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"*"},
		AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderXRequestedWith, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAccessControlAllowHeaders, echo.HeaderAuthorization},
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
	}))
	e.Use(middleware.RateLimiter(middleware.NewRateLimiterMemoryStore(20.0)))
	e.Use(middleware.Recover())
	e.Use(middleware.RequestLogger())

	e.Static("/", "./public")
	routers.InitRouter(e, jwtConfig)

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	/*
		// NO TLS
		sc := echo.StartConfig{
			Address:         ":1323",
			GracefulTimeout: 5 * time.Second,
		}
		if err := sc.Start(ctx, e); err != nil {
			e.Logger.Error("failed to start server", "error", err)
		}
	*/

	// SELF-SIGNED TLS CREDENTIALS
	sc := echo.StartConfig{Address: ":1323", GracefulTimeout: 5 * time.Second}
	if err := sc.StartTLS(
		ctx,
		e,
		tlscrt,
		tlskey,
	); err != nil {
		e.Logger.Error("failed to start https server", "error", err)
	}
}

/*
	// AUTO-TLS
	autoTLSManager := autocert.Manager{
		Prompt:     autocert.AcceptTOS,
		HostPolicy: autocert.HostWhitelist("wms.com", "www.wms.com", "localhost"),
		Cache:      autocert.DirCache("/var/www/.cache"),
		Email:      os.Getenv("EMAIL"),
	}
	s := http.Server{
		Addr:    ":1323",
		Handler: e,
		TLSConfig: &tls.Config{
			//certificates: nil,
			GetCertificate: autoTLSManager.GetCertificate,
			NextProtos:     []string{acme.ALPNProto},
		},
		ReadTimeout: 60 * time.Second,
	}
	if err := s.ListenAndServeTLS("", ""); err != nil && !errors.Is(err, http.ErrServerClosed) {
		e.Logger.Error("failed to start server", "error", err)
	}
*/
