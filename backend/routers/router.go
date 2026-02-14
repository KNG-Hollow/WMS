// SPDX-License-Identifier: GPL-3.0

package routers

import (
	"net/http"

	ctrl "github.com/WMS/controllers"
	"github.com/labstack/echo/v5"
)

func InitRouter(e *echo.Echo, jwtConfig echo.MiddlewareFunc) {
	// UNPROTECTED ROUTES
	e.GET("/", func(c *echo.Context) error {
		return c.File("public/index.html")
	})
	e.GET("/login", func(c *echo.Context) error {
		return c.File("public/index.html")
	})
	e.GET("/home", func(c *echo.Context) error {
		return c.File("public/home.html")
	})
	e.GET("/health", func(c *echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{"status": "healthy"})
	})
	e.POST("/login", ctrl.AuthorizeLogin)

	// PROTECTED ROUTES
	api := e.Group("/api")
	api.Use(jwtConfig)

	api.POST("/accounts", ctrl.AddAccount)
	api.POST("/items", ctrl.AddItem)
	api.POST("/shipments", ctrl.AddShipment)
	api.POST("/boxes", ctrl.AddBox)
	api.POST("/inventory", ctrl.AddInventory)

	api.GET("/accounts", ctrl.GetAccounts)
	api.GET("/accounts/:id", ctrl.GetAccount)
	api.GET("/items", ctrl.GetItems)
	api.GET("/items/:id", ctrl.GetItem)
	api.GET("/shipments", ctrl.GetShipments)
	api.GET("/shipments/:id", ctrl.GetShipment)
	api.GET("/boxes", ctrl.GetBoxes)
	api.GET("/boxes/:id", ctrl.GetBox)
	api.GET("/inventory", ctrl.GetAllInventory)
	api.GET("/inventory/:id", ctrl.GetInventory)

	api.PUT("/accounts/:id", ctrl.UpdateAccount)
	api.PUT("/items/:id", ctrl.UpdateItem)
	api.PUT("/shipments/:id", ctrl.UpdateShipment)
	api.PUT("/boxes/:id", ctrl.UpdateBox)
	api.PUT("/inventory/:id", ctrl.UpdateInventory)

	api.DELETE("/accounts/:id", ctrl.DeleteAccount)
	api.DELETE("/items/:id", ctrl.DeleteItem)
	api.DELETE("/shipments/:id", ctrl.DeleteShipment)
	api.DELETE("/boxes/:id", ctrl.DeleteBox)
	api.DELETE("/inventory/:id", ctrl.DeleteInventory)
}
