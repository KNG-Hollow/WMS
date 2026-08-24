module github.com/KNG-Hollow/WMS/backend/routers

go 1.27.0

replace github.com/KNG-Hollow/WMS/backend/controllers => ../controllers

replace github.com/KNG-Hollow/WMS/backend/services => ../services

replace github.com/KNG-Hollow/WMS/backend/models => ../models

require (
	github.com/KNG-Hollow/WMS/backend/controllers v0.0.0-00010101000000-000000000000
	github.com/labstack/echo/v5 v5.3.1
)

require (
	github.com/KNG-Hollow/WMS/backend/models v0.0.0-00010101000000-000000000000 // indirect
	github.com/KNG-Hollow/WMS/backend/services v0.0.0-00010101000000-000000000000 // indirect
	github.com/golang-jwt/jwt/v5 v5.3.1 // indirect
	github.com/jackc/pgpassfile v1.0.0 // indirect
	github.com/jackc/pgservicefile v0.0.0-20240606120523-5a60cdf6a761 // indirect
	github.com/jackc/pgx/v5 v5.10.0 // indirect
	github.com/labstack/echo-jwt/v5 v5.0.2 // indirect
	golang.org/x/crypto v0.55.0 // indirect
	golang.org/x/sys v0.47.0 // indirect
	golang.org/x/text v0.41.0 // indirect
)
