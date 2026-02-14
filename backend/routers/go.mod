module github.com/KNG-Hollow/WMS/routers

go 1.25.6

replace github.com/WMS/controllers => ../controllers

replace github.com/WMS/services => ../services

replace github.com/WMS/models => ../models

require (
	github.com/WMS/controllers v0.0.0-00010101000000-000000000000
	github.com/labstack/echo/v5 v5.0.2
)

require (
	github.com/WMS/models v0.0.0-00010101000000-000000000000 // indirect
	github.com/WMS/services v0.0.0-00010101000000-000000000000 // indirect
	github.com/golang-jwt/jwt/v5 v5.3.1 // indirect
	github.com/jackc/pgpassfile v1.0.0 // indirect
	github.com/jackc/pgservicefile v0.0.0-20240606120523-5a60cdf6a761 // indirect
	github.com/jackc/pgx/v5 v5.8.0 // indirect
	golang.org/x/crypto v0.47.0 // indirect
	golang.org/x/sys v0.40.0 // indirect
	golang.org/x/text v0.33.0 // indirect
)
