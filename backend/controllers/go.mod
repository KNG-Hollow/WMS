module github.com/KNG-Hollow/WMS/controllers

go 1.25.6

replace github.com/WMS/models => ../models

replace github.com/WMS/services => ../services

require (
	github.com/WMS/models v0.0.0-00010101000000-000000000000
	github.com/WMS/services v0.0.0-00010101000000-000000000000
	github.com/joho/godotenv v1.5.1
	github.com/labstack/echo/v5 v5.0.2
	github.com/stretchr/testify v1.11.1
)

require (
	github.com/davecgh/go-spew v1.1.1 // indirect
	github.com/golang-jwt/jwt/v5 v5.3.1 // indirect
	github.com/jackc/pgpassfile v1.0.0 // indirect
	github.com/jackc/pgservicefile v0.0.0-20240606120523-5a60cdf6a761 // indirect
	github.com/jackc/pgx/v5 v5.8.0 // indirect
	github.com/pmezard/go-difflib v1.0.0 // indirect
	golang.org/x/crypto v0.47.0 // indirect
	golang.org/x/sys v0.40.0 // indirect
	golang.org/x/text v0.33.0 // indirect
	gopkg.in/yaml.v3 v3.0.1 // indirect
)
