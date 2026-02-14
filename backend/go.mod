module github.com/KNG-Hollow/WMS

go 1.25.6

require (
	github.com/WMS/models v0.0.0-00010101000000-000000000000
	github.com/WMS/routers v0.0.0-00010101000000-000000000000
	github.com/WMS/services v0.0.0-00010101000000-000000000000
	github.com/golang-jwt/jwt/v5 v5.3.1
	github.com/joho/godotenv v1.5.1
	github.com/labstack/echo-jwt/v5 v5.0.0
	github.com/labstack/echo/v5 v5.0.2
)

require (
	github.com/WMS/controllers v0.0.0-00010101000000-000000000000 // indirect
	github.com/jackc/pgpassfile v1.0.0 // indirect
	github.com/jackc/pgservicefile v0.0.0-20240606120523-5a60cdf6a761 // indirect
	github.com/jackc/pgx/v5 v5.8.0 // indirect
	golang.org/x/crypto v0.47.0 // indirect
	golang.org/x/sys v0.40.0 // indirect
	golang.org/x/text v0.33.0 // indirect
	golang.org/x/time v0.14.0 // indirect
)

replace github.com/WMS/models => ./models

replace github.com/WMS/services => ./services

replace github.com/WMS/routers => ./routers

replace github.com/WMS/controllers => ./controllers
