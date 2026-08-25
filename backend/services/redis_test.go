// SPDX-License-Identifier: GPL-3.0

package services

import (
	"fmt"
	"image/png"
	"os"
	"testing"
	"time"

	"github.com/KNG-Hollow/WMS/backend/models"
	"github.com/joho/godotenv"
	"github.com/stretchr/testify/assert"
)

var (
	testRedisAccount models.Account
	testRedisItem    models.Item
	_                = godotenv.Load("../.env")
)

func TestAccountCaching(t *testing.T) {
	testRedisAccount = models.Account{
		ID:        67,
		Firstname: "testR",
		Lastname:  "accountR",
		Email:     "demo@accountR.net",
		Phone:     "123-456-7890",
		Username:  "demoR",
		Password:  "demoR",
		Role:      models.Role{Value: "CUSTOMER"},
		Active:    true,
		Created:   time.Now(),
	}

	_ = InitRedisClient()

	res := CheckCache("account", "*")
	assert.False(t, res, "cache should be empty")
	err := AddAccountToCache(testRedisAccount)
	assert.Nil(t, err, "cache did not populate")
	res = CheckCache("account", "*")
	assert.True(t, res, "cache should have data")
	acc, err := GetAccountFromCache(testRedisAccount.ID)
	assert.Nil(t, err, "cache did not return the value")
	assert.Equal(t, int64(67), acc.ID, "ID fields are not equal")
	err = DeleteAccountFromCache(testRedisAccount.ID)
	assert.Nil(t, err, "cache did not delete account")
}

func TestProductCaching(t *testing.T) {
	testPng, err := os.Open("./sample.png")
	if err != nil {
		fmt.Println("Failed to open sample.png")
	}
	defer testPng.Close()

	img, err := png.Decode(testPng)
	if err != nil {
		fmt.Printf("Error decoding PNG: %v", err)
	}
	imgBytes, err := ConvertImageToByte(img)

	testRedisItem = models.Item{
		ID:          68,
		UPC:         "123456",
		Name:        "demo item",
		Description: "demo item demo item",
		Weight:      1.0,
		Image: models.ImageData{
			Name:  "image.png",
			Data:  imgBytes,
			Valid: true,
		},
	}

	_ = InitRedisClient()

	res := CheckCache("product", "*")
	assert.False(t, res, "cache should be empty")
	err = AddProductToCache(testRedisItem)
	assert.Nil(t, err, "cache did not populate")
	res = CheckCache("product", "*")
	assert.True(t, res, "cache should have data")
	item, err := GetProductFromCache(testRedisItem.ID)
	assert.Nil(t, err, "cache did not return the value")
	assert.Equal(t, int64(68), item.ID, "ID fields are not equal")
	err = DeleteProductFromCache(testRedisItem.ID)
	assert.Nil(t, err, "cache did not delete account")
}
