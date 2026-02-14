// SPDX-License-Identifier: GPL-3.0

package services

import (
	"context"
	"fmt"
	"image/png"
	"os"
	"testing"
	"time"

	"github.com/WMS/models"
	"github.com/joho/godotenv"
	"github.com/stretchr/testify/assert"
)

var (
	testAccount   models.Account
	testItem      models.Item
	testShipment  models.Shipment
	testBox       models.Box
	testInventory models.Inventory
)

func TestConnection(t *testing.T) {
	err := godotenv.Load("../.env")
	if err != nil {
		fmt.Println("failed to load .env file")
	}
	db := Connect()
	assert.NotNil(t, db, "Check Database Connection!")
	assert.Nil(t, db.Ping(context.Background()), "Check Active Connection!")
}

func TestAccountService(t *testing.T) {
	// AddAccount
	testAccount = models.Account{
		ID:        66,
		Firstname: "test",
		Lastname:  "account",
		Email:     "demo@account.net",
		Phone:     "123-456-7890",
		Username:  "demo",
		Password:  "demo",
		Role:      models.Role{Value: "CUSTOMER"},
		Active:    true,
		Created:   time.Now(),
	}
	stat := AddAccount(testAccount)
	assert.Nil(t, stat, "Account not empty")

	// GetAccounts
	accounts, err := GetAccounts()
	assert.Nil(t, err)
	assert.True(t, len(accounts) > 0, "Accounts greater than zero")

	// GetAccount
	account, err := GetAccount(66)
	assert.Nil(t, err)
	assert.NotNil(t, account)

	// UpdateAccount
	updateAccount := models.Account{
		ID:        66,
		Firstname: "demo1",
		Lastname:  "account1",
		Email:     "demo1@account.net",
		Phone:     "234-567-8901",
		Username:  "demo1",
		Password:  "demo1",
		Role:      models.Role{Value: "CUSTOMER"},
		Active:    true,
	}
	stat = UpdateAccount(int(updateAccount.ID), updateAccount)
	assert.Nil(t, stat)

	// DeleteAccount
	stat = DeleteAccount(int(updateAccount.ID))
	assert.Nil(t, stat)
}

func TestItemService(t *testing.T) {
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

	// AddItem
	testItem = models.Item{
		ID:          66,
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
	stat := AddItem(testItem)
	assert.Nil(t, stat)

	// GetItems
	items, err := GetItems()
	assert.Nil(t, err)
	assert.True(t, len(items) > 0)

	// GetItem
	item, err := GetItem(int(testItem.ID))
	assert.Nil(t, err)
	assert.NotNil(t, item)

	// UpdateItem
	updateItem := models.Item{
		ID:          66,
		UPC:         "234567",
		Name:        "demo item1",
		Description: "demo item demo item1",
		Weight:      2.0,
		Image: models.ImageData{
			Name:  "sample.png",
			Data:  imgBytes,
			Valid: true,
		},
	}
	stat = UpdateItem(int(updateItem.ID), updateItem)
	assert.Nil(t, stat)

	// DeleteItem
	stat = DeleteItem(int(updateItem.ID))
	assert.Nil(t, stat)
}

func TestShipmentService(t *testing.T) {
	// AddShipment
	testShipment = models.Shipment{
		ID:          66,
		Customer:    testAccount,
		Address:     "12345 N. test Ln.",
		TimeOrdered: time.Now(),
		Payload: []models.ItemGroup{
			{Item: testItem, Count: 123},
		},
	}
	stat := AddShipment(testShipment)
	assert.Nil(t, stat)

	// GetShipments
	shipments, err := GetShipments()
	assert.Nil(t, err)
	assert.True(t, len(shipments) > 0)

	// GetShipment
	shipment, err := GetShipment(int(testShipment.ID))
	assert.Nil(t, err)
	assert.NotNil(t, shipment)

	// UpdateShipment
	updateShipment := models.Shipment{
		ID: 66,
		Customer: models.Account{
			ID:        66,
			Firstname: "test",
			Lastname:  "test",
			Email:     "test@email.com",
			Phone:     "123-456-7890",
			Username:  "test",
			Password:  "test",
			Role:      models.Role{Value: "CUSTOMER"},
			Active:    true,
			Created:   time.Now(),
		},
		Address: "23456 S. test St.",
		Payload: []models.ItemGroup{
			{Item: testItem, Count: 234},
		},
	}

	stat = UpdateShipment(int(updateShipment.ID), updateShipment)
	assert.Nil(t, stat)

	// DeleteShipment
	stat = DeleteShipment(int(updateShipment.ID))
	assert.Nil(t, stat)
}

func TestBoxService(t *testing.T) {
	// AddBox
	testBox = models.Box{
		ID:    66,
		UPC:   "123456",
		Item:  testItem,
		Count: 123,
	}

	stat := AddBox(testBox)
	assert.Nil(t, stat)

	// GetBoxes
	boxes, err := GetBoxes()
	assert.Nil(t, err)
	assert.NotNil(t, boxes)

	// GetBox
	box, err := GetBox(int(testBox.ID))
	assert.Nil(t, err)
	assert.NotNil(t, box)

	// UpdateBox
	updatebox := models.Box{
		ID:    66,
		UPC:   "23456",
		Item:  testItem,
		Count: 234,
	}

	stat = UpdateBox(int(updatebox.ID), updatebox)
	assert.Nil(t, stat)

	// DeleteBox
	stat = DeleteBox(int(updatebox.ID))
	assert.Nil(t, stat)
}

func TestInventoryService(t *testing.T) {
	// AddInventory
	testInventory = models.Inventory{
		ID:         66,
		Item:       testItem,
		TotalCount: 2345,
		Locations: []models.LocationData{
			{
				Area:  "A12",
				Count: 1234,
			},
			{
				Area:  "B23",
				Count: 1111,
			},
		},
	}

	stat := AddInventory(testInventory)
	assert.Nil(t, stat)

	// GetAllInventory
	allInv, err := GetAllInventory()
	assert.Nil(t, err)
	assert.NotNil(t, allInv)

	// GetInventory
	inv, err := GetInventory(int(testInventory.ID))
	assert.Nil(t, err)
	assert.NotNil(t, inv)

	// UpdateInventory
	updateInventory := models.Inventory{
		ID:         66,
		Item:       testItem,
		TotalCount: 3333,
		Locations: []models.LocationData{
			{
				Area:  "C3",
				Count: 3333,
			},
		},
	}

	stat = UpdateInventory(int(updateInventory.ID), updateInventory)
	assert.Nil(t, stat)

	// DeleteInventory
	stat = DeleteInventory(int(updateInventory.ID))
	assert.Nil(t, stat)
}
