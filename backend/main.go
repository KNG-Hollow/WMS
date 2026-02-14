// SPDX-License-Identifier: GPL-3.0

package main

import (
	"context"
	"fmt"
	"os"

	"github.com/WMS/models"
	"github.com/WMS/routers"
	"github.com/WMS/services"
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

	jwtKey, err := services.LoadRSAPublicKey(os.Getenv("JWTPUBKEY"))
	if err != nil {
		fmt.Println("Failed to open JWT Key at:", os.Getenv("JWTKEY"))
		jwtKey, err = services.LoadRSAPublicKey("../wms-jwt-pub.pem")
		if err != nil {
			fmt.Println("Failed to open JWT Key")
			os.Exit(1)
		}
	}

	tlscrt, err = os.ReadFile(os.Getenv("TLSCRT"))
	if err != nil {
		tlscrt, err = os.ReadFile("../wms-tls.crt")
		if err != nil {
			fmt.Println("Failed to open TLS Certificate")
			os.Exit(1)
		}
	}
	tlskey, err = os.ReadFile(os.Getenv("TLSKEY"))
	if err != nil {
		tlskey, err = os.ReadFile("../wms-tls.key")
		if err != nil {
			fmt.Println("Failed to open TLS Key")
			os.Exit(1)
		}
	}

	e := echo.New()

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
		AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept},
	}))
	e.Use(middleware.RateLimiter(middleware.NewRateLimiterMemoryStore(20.0)))
	e.Use(middleware.RequestLogger())
	e.Use(middleware.Recover())

	e.Static("/", "./public")
	routers.InitRouter(e, jwtConfig)

	sc := echo.StartConfig{Address: ":1323"}
	if err := sc.StartTLS(
		context.Background(),
		e,
		tlscrt,
		tlskey,
	); err != nil {
		e.Logger.Error("failed to start https server", "error", err)
	}
	/*
		if err := e.Start(":1323"); err != nil {
			e.Logger.Error("failed to start server", "error", err)
		}
	*/
}
