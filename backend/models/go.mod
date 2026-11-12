module github.com/KNG-Hollow/WMS/backend/models

go 1.27.0

replace github.com/KNG-Hollow/WMS/backend/services => ../services

replace github.com/KNG-Hollow/WMS/backend/models => .

require github.com/golang-jwt/jwt/v5 v5.3.1
