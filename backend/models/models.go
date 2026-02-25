// SPDX-License-Identifier: GPL-3.0

package models

import (
	"database/sql/driver"
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type Account struct {
	ID        int64     `json:"id" db:"id"`
	Firstname string    `json:"firstname" db:"firstname"`
	Lastname  string    `json:"lastname" db:"lastname"`
	Email     string    `json:"email" db:"email"`
	Phone     string    `json:"phone" db:"phone"`
	Username  string    `json:"username" db:"username"`
	Password  string    `json:"password" db:"password"`
	Role      Role      `json:"role" db:"role"`
	Active    bool      `json:"active" db:"active"`
	Created   time.Time `json:"created" db:"created"`
}

type Role struct {
	ADMIN    string
	MANAGER  string
	EMPLOYEE string
	SUPPLIER string
	CUSTOMER string
	Value    string
}

func (r *Role) Scan(value any) error {
	v, ok := value.(string)
	if !ok {
		return fmt.Errorf("cannot scan value into Role: %v", value)
	}
	r.Value = v
	return nil
}

type Item struct {
	ID          int64     `json:"id" db:"id"`
	UPC         string    `json:"upc" db:"upc"`
	Name        string    `json:"name" db:"name"`
	Description string    `json:"description" db:"description"`
	Weight      float64   `json:"weight" db:"weight"`
	Image       ImageData `json:"image" db:"image"`
}

type ItemInfo struct {
	ID   int64  `json:"id" db:"id"`
	Name string `json:"name" db:"name"`
}

type ImageData struct {
	Name  string `json:"name" db:"name"`
	Data  []byte `json:"data" db:"data"`
	Valid bool   `json:"valid" db:"valid"`
}

func (i *ImageData) Scan(value any) error {
	/*
		if value == nil {
			i.Valid = false
			return errors.New("Invalid image data")
		}
	*/
	if value == nil {
		i.Data = nil
		i.Name = ""
		i.Valid = true

		return nil
	}
	byteData, ok := value.([]byte)
	if !ok {
		return errors.New("Cannot scan value into ImageData")
	}
	i.Data = byteData
	i.Name = "image.png"
	i.Valid = true

	return nil
}

func (i *ImageData) Value() (driver.Value, error) {
	if !i.Valid {
		return nil, errors.New("Image is invalid")
	}
	return i.Data, nil
}

type Box struct {
	ID         int64  `json:"id" db:"id"`
	UPC        string `json:"upc" db:"upc"`
	Item       Item   `json:"item" db:"item"`
	Dimensions string `json:"dimensions" db:"dimensions"`
	Count      int64  `json:"count" db:"count"`
}

type Inventory struct {
	ID         int64          `json:"id" db:"id"`
	Item       Item           `json:"item" db:"item"`
	TotalCount int64          `json:"total" db:"total"`
	Locations  []LocationData `json:"locations" db:"locations"`
}

type LocationData struct {
	Area  string `json:"area" db:"area"`
	Count int64  `json:"count" db:"count"`
}

type Order struct {
	ID          int64       `json:"id" db:"id"`
	Customer    Account     `json:"customer" db:"customer"`
	Address     string      `json:"address" db:"address"`
	TimeOrdered time.Time   `json:"timeOrdered" db:"timeOrdered"`
	Payload     []ItemGroup `json:"payload" db:"payload"`
}

type Shipment struct {
	ID          int64       `json:"id" db:"id"`
	Supplier    Account     `json:"supplier" db:"supplier"`
	Distributor string      `json:"distributor" db:"distributor"`
	ETA         time.Time   `json:"eta" db:"eta"`
	Payload     []ItemGroup `json:"payload" db:"payload"`
}

type ItemGroup struct {
	Item  Item  `json:"item"`
	Count int64 `json:"count"`
}

type LoginDetails struct {
	Username string `form:"username" json:"username" binding:"required"`
	Password string `form:"password" json:"password" binding:"required"`
}

type JwtCustomClaims struct {
	ID       int64  `json:"id"`
	Username string `json:"username"`
	Password string `json:"password"`
	Role     Role   `json:"role"`
	jwt.RegisteredClaims
}
