module github.com/KNG-Hollow/WMS/backend/routers

go 1.27.0

replace github.com/KNG-Hollow/WMS/backend/controllers => ../controllers

replace github.com/KNG-Hollow/WMS/backend/services => ../services

replace github.com/KNG-Hollow/WMS/backend/models => ../models

require (
	github.com/KNG-Hollow/WMS/backend/controllers v0.0.0-20260302175617-c4912644e0ac
	github.com/labstack/echo/v5 v5.3.1
)

require (
	github.com/KNG-Hollow/WMS/backend/models v0.0.0-20260302175617-c4912644e0ac // indirect
	github.com/KNG-Hollow/WMS/backend/services v0.0.0-20260302175617-c4912644e0ac // indirect
	github.com/golang-jwt/jwt/v5 v5.3.1 // indirect
	github.com/jackc/pgpassfile v1.0.0 // indirect
	github.com/jackc/pgservicefile v0.0.0-20240606120523-5a60cdf6a761 // indirect
	github.com/jackc/pgx/v5 v5.10.0 // indirect
	golang.org/x/crypto v0.55.0 // indirect
	golang.org/x/sys v0.47.0 // indirect
	golang.org/x/text v0.41.0 // indirect
)
