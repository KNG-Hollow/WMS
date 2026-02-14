// SPDX-License-Identifier: GPL-3.0

package controllers

import (
	"encoding/json"
	"fmt"
	"image/png"
	"net/http"
	"os"
	"testing"
	"time"

	"github.com/WMS/models"
	"github.com/WMS/services"
	"github.com/joho/godotenv"
	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/echotest"
	"github.com/stretchr/testify/assert"
)

var (
	mockAccount models.Account = models.Account{
		ID:        66,
		Firstname: "test",
		Lastname:  "test",
		Email:     "test@test.com",
		Phone:     "123-456-7890",
		Username:  "test",
		Password:  "test",
		Role:      models.Role{Value: "CUSTOMER"},
		Active:    true,
		Created:   time.Now(),
	}
	mockItem models.Item = models.Item{
		ID:          66,
		UPC:         "123456",
		Name:        "test",
		Description: "test item",
		Weight:      1.0,
		Image:       models.ImageData{Name: "test.png", Data: nil, Valid: true},
	}
	mockShipment models.Shipment = models.Shipment{ID: 66, Customer: models.Account{ID: 66, Firstname: "test", Lastname: "test", Email: "test@test.com", Phone: "123-456-7890", Username: "test", Password: "test", Role: models.Role{Value: "CUSTOMER"}, Active: true, Created: time.Now()}, Address: "12345 N. test ln.", TimeOrdered: time.Now(), Payload: []models.ItemGroup{models.ItemGroup{Item: models.Item{
		ID:          66,
		UPC:         "123456",
		Name:        "test",
		Description: "test item",
		Weight:      1.0,
		Image:       models.ImageData{Name: "test.png", Data: nil, Valid: true}}, Count: 55}},
	}
	mockBox models.Box = models.Box{
		ID:    66,
		UPC:   "123456",
		Item:  mockItem,
		Count: 66,
	}
	mockInv models.Inventory = models.Inventory{
		ID:         66,
		Item:       mockItem,
		TotalCount: 2345,
		Locations: []models.LocationData{
			{
				Area:  "A12",
				Count: 2345,
			},
		},
	}
	mockAccount1 models.Account = models.Account{
		ID:        66,
		Firstname: "test1",
		Lastname:  "test1",
		Email:     "test1@test.com",
		Phone:     "123-456-7890",
		Username:  "test1",
		Password:  "test1",
		Role:      models.Role{Value: "CUSTOMER"},
		Active:    true,
		Created:   time.Now(),
	}
	mockItem1 models.Item = models.Item{
		ID:          66,
		UPC:         "234567",
		Name:        "test1",
		Description: "test item1",
		Weight:      2.0,
		Image:       models.ImageData{Name: "test.png", Data: nil, Valid: true},
	}
	mockShipment1 models.Shipment = models.Shipment{
		ID: 66,
		Customer: models.Account{
			ID:        66,
			Firstname: "test",
			Lastname:  "test",
			Email:     "test@test.com",
			Phone:     "123-456-7890",
			Username:  "test",
			Password:  "test",
			Role: models.Role{
				Value: "CUSTOMER",
			},
			Active:  true,
			Created: time.Now(),
		},
		Address:     "12345 N. test ln.",
		TimeOrdered: time.Now(),
		Payload: []models.ItemGroup{
			{
				Item: models.Item{
					ID:          66,
					UPC:         "234567",
					Name:        "test1",
					Description: "test item1",
					Weight:      1.0,
					Image:       models.ImageData{Name: "test.png", Data: nil, Valid: true},
				},
				Count: 55,
			},
		},
	}
	mockBox1 models.Box = models.Box{
		ID:    66,
		UPC:   "234567",
		Item:  mockItem1,
		Count: 667,
	}
	mockInv1 models.Inventory = models.Inventory{
		ID:         66,
		Item:       mockItem1,
		TotalCount: 1234,
		Locations: []models.LocationData{
			{
				Area:  "C4",
				Count: 1234,
			},
		},
	}
)

func TestAccountController(t *testing.T) {
	err := godotenv.Load("../.env")
	if err != nil {
		fmt.Println("failed to load .env file")
	}
	// Mock Accounts In JSON
	jsonAcc, err := json.Marshal(mockAccount)
	if err != nil {
		fmt.Println("Error marshaling account to JSON:", err)
		return
	}
	jsonAcc1, err := json.Marshal(mockAccount1)
	if err != nil {
		fmt.Println("Error marshaling account1 to JSON:", err)
	}

	// AddAccount
	rec := echotest.ContextConfig{
		Headers: map[string][]string{
			echo.HeaderContentType: {echo.MIMEApplicationJSON},
		},
		JSONBody: jsonAcc,
	}.ServeWithHandler(t, AddAccount)

	assert.Equal(t, http.StatusCreated, rec.Code)
	assert.Equal(t, string(jsonAcc)+"\n", rec.Body.String())

	// GetAccounts
	rec = echotest.ContextConfig{
		Headers: map[string][]string{
			echo.HeaderContentType: {echo.MIMEApplicationJSON},
		},
		JSONBody: jsonAcc,
	}.ServeWithHandler(t, GetAccounts)

	assert.Equal(t, http.StatusOK, rec.Code)

	// GetAccount
	rec = echotest.ContextConfig{
		PathValues: echo.PathValues{
			{Name: "id", Value: "66"},
		},
		Headers: map[string][]string{
			echo.HeaderContentType: {echo.MIMEApplicationJSON},
		},
		JSONBody: jsonAcc,
	}.ServeWithHandler(t, GetAccount)

	assert.Equal(t, http.StatusOK, rec.Code)

	// UpdateAccount
	rec = echotest.ContextConfig{
		PathValues: echo.PathValues{
			{Name: "id", Value: "66"},
		},
		Headers: map[string][]string{
			echo.HeaderContentType: {echo.MIMEApplicationJSON},
		},
		JSONBody: jsonAcc1,
	}.ServeWithHandler(t, UpdateAccount)

	assert.Equal(t, http.StatusAccepted, rec.Code)

	// DeleteAccount
	rec = echotest.ContextConfig{
		PathValues: echo.PathValues{
			{Name: "id", Value: "66"},
		},
		Headers: map[string][]string{
			echo.HeaderContentType: {echo.MIMEApplicationJSON},
		},
		JSONBody: jsonAcc1,
	}.ServeWithHandler(t, DeleteAccount)

	assert.Equal(t, http.StatusAccepted, rec.Code)
}

func TestItemController(t *testing.T) {
	// Scan PNG Image As Byte Array Into mockItem & mockItem1
	testPng, err := os.Open("../services/sample.png")
	if err != nil {
		fmt.Println("Failed to open sample.png")
	}
	defer testPng.Close()

	img, err := png.Decode(testPng)
	if err != nil {
		fmt.Printf("Error decoding PNG: %v", err)
	}
	imgBytes, err := services.ConvertImageToByte(img)
	mockItem.Image.Data = imgBytes
	mockItem1.Image.Data = imgBytes

	// Mock Items In JSON
	jsonItem, err := json.Marshal(mockItem)
	if err != nil {
		fmt.Println("Error marshaling item to JSON:", err)
		return
	}
	jsonItem1, err := json.Marshal(mockItem1)
	if err != nil {
		fmt.Println("Error marshaling item1 to JSON:", err)
	}

	// AddItem
	rec := echotest.ContextConfig{
		Headers: map[string][]string{
			echo.HeaderContentType: {echo.MIMEApplicationJSON},
		},
		JSONBody: jsonItem,
	}.ServeWithHandler(t, AddItem)

	assert.Equal(t, http.StatusCreated, rec.Code)
	assert.Equal(t, string(jsonItem)+"\n", rec.Body.String())

	// GetItems
	rec = echotest.ContextConfig{
		Headers: map[string][]string{
			echo.HeaderContentType: {echo.MIMEApplicationJSON},
		},
		JSONBody: jsonItem,
	}.ServeWithHandler(t, GetItems)

	assert.Equal(t, http.StatusOK, rec.Code)

	// GetItem
	rec = echotest.ContextConfig{
		PathValues: echo.PathValues{
			{Name: "id", Value: "66"},
		},
		Headers: map[string][]string{
			echo.HeaderContentType: {echo.MIMEApplicationJSON},
		},
		JSONBody: jsonItem,
	}.ServeWithHandler(t, GetItem)

	assert.Equal(t, http.StatusOK, rec.Code)

	// UpdateItem
	rec = echotest.ContextConfig{
		PathValues: echo.PathValues{
			{Name: "id", Value: "66"},
		},
		Headers: map[string][]string{
			echo.HeaderContentType: {echo.MIMEApplicationJSON},
		},
		JSONBody: jsonItem1,
	}.ServeWithHandler(t, UpdateItem)

	assert.Equal(t, http.StatusAccepted, rec.Code)

	// DeleteItem
	rec = echotest.ContextConfig{
		PathValues: echo.PathValues{
			{Name: "id", Value: "66"},
		},
		Headers: map[string][]string{
			echo.HeaderContentType: {echo.MIMEApplicationJSON},
		},
		JSONBody: jsonItem1,
	}.ServeWithHandler(t, DeleteItem)

	assert.Equal(t, http.StatusAccepted, rec.Code)
}

func TestShipmentController(t *testing.T) {
	// Mock Shipments In JSON
	jsonShipment, err := json.Marshal(mockShipment)
	if err != nil {
		fmt.Println("Error marshaling shipment to JSON:", err)
		return
	}
	jsonShipment1, err := json.Marshal(mockShipment1)
	if err != nil {
		fmt.Println("Error marshaling shipment1 to JSON:", err)
	}

	// AddShipment
	rec := echotest.ContextConfig{
		Headers: map[string][]string{
			echo.HeaderContentType: {echo.MIMEApplicationJSON},
		},
		JSONBody: jsonShipment,
	}.ServeWithHandler(t, AddShipment)

	assert.Equal(t, http.StatusCreated, rec.Code)
	assert.Equal(t, string(jsonShipment)+"\n", rec.Body.String())

	// GetShipments
	rec = echotest.ContextConfig{
		Headers: map[string][]string{
			echo.HeaderContentType: {echo.MIMEApplicationJSON},
		},
		JSONBody: jsonShipment,
	}.ServeWithHandler(t, GetShipments)

	assert.Equal(t, http.StatusOK, rec.Code)

	// GetShipment
	rec = echotest.ContextConfig{
		PathValues: echo.PathValues{
			{Name: "id", Value: "66"},
		},
		Headers: map[string][]string{
			echo.HeaderContentType: {echo.MIMEApplicationJSON},
		},
		JSONBody: jsonShipment,
	}.ServeWithHandler(t, GetShipment)

	assert.Equal(t, http.StatusOK, rec.Code)

	// UpdateShipment
	rec = echotest.ContextConfig{
		PathValues: echo.PathValues{
			{Name: "id", Value: "66"},
		},
		Headers: map[string][]string{
			echo.HeaderContentType: {echo.MIMEApplicationJSON},
		},
		JSONBody: jsonShipment1,
	}.ServeWithHandler(t, UpdateShipment)

	assert.Equal(t, http.StatusAccepted, rec.Code)

	// DeleteShipment
	rec = echotest.ContextConfig{
		PathValues: echo.PathValues{
			{Name: "id", Value: "66"},
		},
		Headers: map[string][]string{
			echo.HeaderContentType: {echo.MIMEApplicationJSON},
		},
		JSONBody: jsonShipment1,
	}.ServeWithHandler(t, DeleteShipment)

	assert.Equal(t, http.StatusAccepted, rec.Code)
}

func TestBoxController(t *testing.T) {
	// Mock Boxes In JSON
	jsonBox, err := json.Marshal(mockBox)
	if err != nil {
		fmt.Println("Error marshaling box to JSON:", err)
		return
	}
	jsonBox1, err := json.Marshal(mockBox1)
	if err != nil {
		fmt.Println("Error marshaling box1 to JSON:", err)
	}

	// AddBox
	rec := echotest.ContextConfig{
		Headers: map[string][]string{
			echo.HeaderContentType: {echo.MIMEApplicationJSON},
		},
		JSONBody: jsonBox,
	}.ServeWithHandler(t, AddBox)

	assert.Equal(t, http.StatusCreated, rec.Code)
	assert.Equal(t, string(jsonBox)+"\n", rec.Body.String())

	// GetBoxes
	rec = echotest.ContextConfig{
		Headers: map[string][]string{
			echo.HeaderContentType: {echo.MIMEApplicationJSON},
		},
		JSONBody: jsonBox,
	}.ServeWithHandler(t, GetBoxes)

	assert.Equal(t, http.StatusOK, rec.Code)

	// GetBox
	rec = echotest.ContextConfig{
		PathValues: echo.PathValues{
			{Name: "id", Value: "66"},
		},
		Headers: map[string][]string{
			echo.HeaderContentType: {echo.MIMEApplicationJSON},
		},
		JSONBody: jsonBox,
	}.ServeWithHandler(t, GetBox)

	assert.Equal(t, http.StatusOK, rec.Code)

	// UpdateBox
	rec = echotest.ContextConfig{
		PathValues: echo.PathValues{
			{Name: "id", Value: "66"},
		},
		Headers: map[string][]string{
			echo.HeaderContentType: {echo.MIMEApplicationJSON},
		},
		JSONBody: jsonBox1,
	}.ServeWithHandler(t, UpdateBox)

	assert.Equal(t, http.StatusAccepted, rec.Code)

	// DeleteBox
	rec = echotest.ContextConfig{
		PathValues: echo.PathValues{
			{Name: "id", Value: "66"},
		},
		Headers: map[string][]string{
			echo.HeaderContentType: {echo.MIMEApplicationJSON},
		},
		JSONBody: jsonBox1,
	}.ServeWithHandler(t, DeleteBox)

	assert.Equal(t, http.StatusAccepted, rec.Code)
}

func TestInventoryController(t *testing.T) {
	// Mock Inventory In JSON
	jsonInv, err := json.Marshal(mockInv)
	if err != nil {
		fmt.Println("Error marshaling inventory to JSON:", err)
		return
	}
	jsonInv1, err := json.Marshal(mockInv1)
	if err != nil {
		fmt.Println("Error marshaling inventory1 to JSON:", err)
	}

	// AddInventory
	rec := echotest.ContextConfig{
		Headers: map[string][]string{
			echo.HeaderContentType: {echo.MIMEApplicationJSON},
		},
		JSONBody: jsonInv,
	}.ServeWithHandler(t, AddInventory)

	assert.Equal(t, http.StatusCreated, rec.Code)
	assert.Equal(t, string(jsonInv)+"\n", rec.Body.String())

	// GetAllInventory
	rec = echotest.ContextConfig{
		Headers: map[string][]string{
			echo.HeaderContentType: {echo.MIMEApplicationJSON},
		},
		JSONBody: jsonInv,
	}.ServeWithHandler(t, GetAllInventory)

	assert.Equal(t, http.StatusOK, rec.Code)

	// GetInventory
	rec = echotest.ContextConfig{
		PathValues: echo.PathValues{
			{Name: "id", Value: "66"},
		},
		Headers: map[string][]string{
			echo.HeaderContentType: {echo.MIMEApplicationJSON},
		},
		JSONBody: jsonInv,
	}.ServeWithHandler(t, GetInventory)

	assert.Equal(t, http.StatusOK, rec.Code)

	// UpdateInventory
	rec = echotest.ContextConfig{
		PathValues: echo.PathValues{
			{Name: "id", Value: "66"},
		},
		Headers: map[string][]string{
			echo.HeaderContentType: {echo.MIMEApplicationJSON},
		},
		JSONBody: jsonInv1,
	}.ServeWithHandler(t, UpdateInventory)

	assert.Equal(t, http.StatusAccepted, rec.Code)

	// DeleteInventory
	rec = echotest.ContextConfig{
		PathValues: echo.PathValues{
			{Name: "id", Value: "66"},
		},
		Headers: map[string][]string{
			echo.HeaderContentType: {echo.MIMEApplicationJSON},
		},
		JSONBody: jsonInv1,
	}.ServeWithHandler(t, DeleteInventory)

	assert.Equal(t, http.StatusAccepted, rec.Code)
}
