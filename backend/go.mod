module github.com/KNG-Hollow/WMS/backend

go 1.27.0

require (
	github.com/KNG-Hollow/WMS/backend/models v0.0.0-20260302175617-c4912644e0ac
	github.com/KNG-Hollow/WMS/backend/routers v0.0.0-20260302175617-c4912644e0ac
	github.com/KNG-Hollow/WMS/backend/services v0.0.0-20260302175617-c4912644e0ac
	github.com/golang-jwt/jwt/v5 v5.3.1
	github.com/joho/godotenv v1.5.1
	github.com/labstack/echo-jwt/v5 v5.0.2
	github.com/labstack/echo/v5 v5.4.4
)

require (
	github.com/KNG-Hollow/WMS/backend/controllers v0.0.0-20260302175617-c4912644e0ac // indirect
	github.com/cespare/xxhash/v2 v2.3.0 // indirect
	github.com/jackc/pgpassfile v1.0.0 // indirect
	github.com/jackc/pgservicefile v0.0.0-20240606120523-5a60cdf6a761 // indirect
	github.com/jackc/pgx/v5 v5.12.0 // indirect
	github.com/redis/go-redis/v9 v9.23.0 // indirect
	go.uber.org/atomic v1.12.0 // indirect
	golang.org/x/crypto v0.58.0 // indirect
	golang.org/x/sys v0.50.0 // indirect
	golang.org/x/text v0.44.0 // indirect
	golang.org/x/time v0.16.0 // indirect
)

replace github.com/KNG-Hollow/WMS/backend/models => ./models

replace github.com/KNG-Hollow/WMS/backend/services => ./services

replace github.com/KNG-Hollow/WMS/backend/routers => ./routers

replace github.com/KNG-Hollow/WMS/backend/controllers => ./controllers
