// SPDX-License-Identifier: GPL-3.0

package controllers

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/KNG-Hollow/WMS/backend/models"
	"github.com/KNG-Hollow/WMS/backend/services"
	"github.com/labstack/echo/v5"
)

func AuthorizeLogin(c *echo.Context) error {
	var loginDetails models.LoginDetails
	loginDetails.Username = c.FormValue("username")
	loginDetails.Password = c.FormValue("password")
	if len(loginDetails.Username) == 0 || len(loginDetails.Password) == 0 {
		err := c.Bind(&loginDetails)
		if err != nil {
			return c.JSON(http.StatusBadRequest, "bad request")
		}
	}

	acc, err := services.ValidateLogin(loginDetails.Username, loginDetails.Password)
	if acc == nil {
		return errors.New("account is empty")
	}
	if err != nil {
		return err
	}
	// TODO test new cookie and JWT format
	token, err := services.InitJWT(acc)
	if err != nil {
		return err
	}
	cookie := new(http.Cookie)
	cookie.Name = "jwt"
	cookie.Value = token
	cookie.Expires = time.Now().Add(24 * time.Hour)
	//cookie.HttpOnly = true
	cookie.SameSite = http.SameSiteNoneMode
	c.SetCookie(cookie)
	// TODO test
	dto := models.AccountDTO{ID: acc.ID, Username: acc.Username, Password: acc.Password, Role: acc.Role, JWT: token}
	if err := services.AddActiveToCache(dto); err != nil {
		return err
	}

	return c.JSON(http.StatusAccepted, map[string]string{"token": token})
}

func RefreshJWT(c *echo.Context) error {
	type Id struct {
		Id int64 `param:"id" json:"id"`
	}
	var binder Id
	if err := c.Bind(&binder); err != nil {
		return c.JSON(http.StatusBadRequest, "could not convert")
	}
	token, err := services.RefreshJWT(c, int(binder.Id))
	if err != nil {
		return err
	} else if token == "" {
		return fmt.Errorf("Token is empty")
	}

	return c.JSON(http.StatusAccepted, map[string]string{"token": token})

}

// TODO test
func LogoutActive(c *echo.Context) error {
	type Id struct {
		Id int64 `param:"id" json:"id"`
	}
	var binder Id
	if err := c.Bind(&binder); err != nil {
		return c.JSON(http.StatusBadRequest, "could not convert")
	}
	if err := services.DeleteActiveFromCache(binder.Id); err != nil {
		return err
	}

	return c.JSON(http.StatusAccepted, map[string]bool{"ok": true})
}

func GetItemsList(c *echo.Context) error {
	/*
		err := services.AuthorizeRequest(c)
		if err != nil {
			return err
		}
	*/
	var items []models.ItemInfo
	res := services.CheckCache("productInfo", "*")
	if res {
		arr, err := services.GetProductListFromCache()
		if err != nil {
			return err
		}
		items = arr
	} else {
		arr, err := services.GetItemsList()
		if err != nil {
			return err
		}
		items = arr
		if err = services.AddProductListToCache(items); err != nil {
			return err
		}
	}
	return c.JSON(http.StatusOK, items)
}

func GetCustomersList(c *echo.Context) error {
	var customers []models.Account
	res := services.CheckCache("customer", "*")
	if res {
		arr, err := services.GetCustomerListFromCache()
		if err != nil {
			return err
		}
		customers = arr
	} else {
		arr, err := services.GetCustomersList()
		if err != nil {
			return err
		}
		customers = arr
		if err = services.AddCustomerListToCache(customers); err != nil {
			return err
		}
	}
	return c.JSON(http.StatusOK, customers)
}

// TODO test
func GetActiveUsers(c *echo.Context) error {
	var users []models.AccountDTO
	res := services.CheckCache("active", "*")
	if res {
		arr, err := services.GetActiveUsersFromCache()
		if err != nil {
			return err
		}
		users = arr
	}
	return c.JSON(http.StatusOK, users)
}

// TODO test
func GetActiveUser(c *echo.Context) error {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		return err
	}
	var user models.AccountDTO
	res := services.CheckCache("active", idParam)
	if res {
		arr, err := services.GetActiveUserFromCache(int64(id))
		if err != nil {
			return err
		}
		user = arr
	} else {
		return fmt.Errorf("User was not found in cache")
	}
	return c.JSON(http.StatusOK, user)
}

//  Basic Functionality  //

func AddAccount(c *echo.Context) error {
	/*
		err := services.AuthorizeRequest(c)
		if err != nil {
			return err
		}
	*/
	var account models.Account
	if err := c.Bind(&account); err != nil {
		return err
	}
	err := services.AddAccount(account)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusCreated, account)
}

func AddItem(c *echo.Context) error {
	/*
		err := services.AuthorizeRequest(c)
		if err != nil {
			return err
		}
	*/
	var item models.Item
	if err := c.Bind(&item); err != nil {
		return err
	}
	err := services.AddItem(item)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusCreated, item)
}

func AddOrder(c *echo.Context) error {
	/*
		err := services.AuthorizeRequest(c)
		if err != nil {
			return err
		}
	*/
	var order models.Order
	if err := c.Bind(&order); err != nil {
		return err
	}
	err := services.AddOrder(order)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusCreated, order)
}

func AddBox(c *echo.Context) error {
	/*
		err := services.AuthorizeRequest(c)
		if err != nil {
			return err
		}
	*/
	var box models.Box
	if err := c.Bind(&box); err != nil {
		return err
	}
	err := services.AddBox(box)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusCreated, box)
}

func AddInventory(c *echo.Context) error {
	/*
		err := services.AuthorizeRequest(c)
		if err != nil {
			return err
		}
	*/
	var inv models.Inventory
	if err := c.Bind(&inv); err != nil {
		return err
	}
	err := services.AddInventory(inv)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusCreated, inv)
}

func AddShipment(c *echo.Context) error {
	/*
		err := services.AuthorizeRequest(c)
		if err != nil {
			return err
		}
	*/
	var ship models.Shipment
	if err := c.Bind(&ship); err != nil {
		return err
	}
	err := services.AddShipment(ship)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusCreated, ship)
}

func GetAccounts(c *echo.Context) error {
	/*
		err := services.AuthorizeRequest(c)
		if err != nil {
			return err
		}
	*/
	accounts, err := services.GetAccounts()
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, accounts)
}

func GetAccount(c *echo.Context) error {
	/*
		err := services.AuthorizeRequest(c)
		if err != nil {
			return err
		}
	*/
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		return err
	}
	var account models.Account
	res := services.CheckCache("account", idParam)
	if res {
		account, err = services.GetAccountFromCache(int64(id))
		if err != nil {
			return err
		}
	} else {
		account, err = services.GetAccount(id)
		if err != nil {
			return err
		}
		if err := services.AddAccountToCache(account); err != nil {
			return err
		}
	}
	return c.JSON(http.StatusOK, account)
}

func GetOrders(c *echo.Context) error {
	/*
		err := services.AuthorizeRequest(c)
		if err != nil {
			return err
		}
	*/
	orders, err := services.GetOrders()
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, orders)
}

func GetOrder(c *echo.Context) error {
	/*
		err := services.AuthorizeRequest(c)
		if err != nil {
			return err
		}
	*/
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		return err
	}

	order, err := services.GetOrder(id)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, order)
}

func GetItems(c *echo.Context) error {
	/*
		err := services.AuthorizeRequest(c)
		if err != nil {
			return err
		}
	*/
	items, err := services.GetItems()
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, items)
}

func GetItem(c *echo.Context) error {
	/*
		err := services.AuthorizeRequest(c)
		if err != nil {
			return err
		}
	*/
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		return err
	}
	var item models.Item
	res := services.CheckCache("product", idParam)
	if res {
		item, err = services.GetProductFromCache(int64(id))
		if err != nil {
			return err
		}
	} else {
		item, err = services.GetItem(id)
		if err != nil {
			return err
		}
		if err := services.AddProductToCache(item); err != nil {
			return err
		}
	}
	return c.JSON(http.StatusOK, item)
}

func GetBoxes(c *echo.Context) error {
	/*
		err := services.AuthorizeRequest(c)
		if err != nil {
			return err
		}
	*/
	boxes, err := services.GetBoxes()
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, boxes)
}

func GetBox(c *echo.Context) error {
	/*
		err := services.AuthorizeRequest(c)
		if err != nil {
			return err
		}
	*/
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		return err
	}

	box, err := services.GetBox(id)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, box)
}

func GetAllInventory(c *echo.Context) error {
	/*
		err := services.AuthorizeRequest(c)
		if err != nil {
			return err
		}
	*/
	allInventory, err := services.GetAllInventory()
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, allInventory)
}

func GetInventory(c *echo.Context) error {
	/*
		err := services.AuthorizeRequest(c)
		if err != nil {
			return err
		}
	*/
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		return err
	}

	inv, err := services.GetInventory(id)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, inv)
}

func GetAllShipments(c *echo.Context) error {
	/*
		err := services.AuthorizeRequest(c)
		if err != nil {
			return err
		}
	*/
	allShipments, err := services.GetAllShipments()
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, allShipments)
}

func GetShipment(c *echo.Context) error {
	/*
		err := services.AuthorizeRequest(c)
		if err != nil {
			return err
		}
	*/
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		return err
	}

	ship, err := services.GetShipment(id)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, ship)
}

func UpdateAccount(c *echo.Context) error {
	/*
		err := services.AuthorizeRequest(c)
		if err != nil {
			return err
		}
	*/
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		return err
	}

	var account models.Account
	if err := c.Bind(&account); err != nil {
		return err
	}
	err = services.UpdateAccount(id, account)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusAccepted, account)
}

func UpdateItem(c *echo.Context) error {
	/*
		err := services.AuthorizeRequest(c)
		if err != nil {
			return err
		}
	*/
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		return err
	}

	var item models.Item
	if err := c.Bind(&item); err != nil {
		return err
	}
	err = services.UpdateItem(id, item)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusAccepted, item)
}

func UpdateOrder(c *echo.Context) error {
	/*
		err := services.AuthorizeRequest(c)
		if err != nil {
			return err
		}
	*/
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		return err
	}

	var order models.Order
	if err := c.Bind(&order); err != nil {
		return err
	}
	err = services.UpdateOrder(id, order)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusAccepted, order)
}

func UpdateBox(c *echo.Context) error {
	/*
		err := services.AuthorizeRequest(c)
		if err != nil {
			return err
		}
	*/
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		return err
	}

	var box models.Box
	if err := c.Bind(&box); err != nil {
		return err
	}
	err = services.UpdateBox(id, box)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusAccepted, box)
}

func UpdateInventory(c *echo.Context) error {
	/*
		err := services.AuthorizeRequest(c)
		if err != nil {
			return err
		}
	*/
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		return err
	}

	var inv models.Inventory
	if err := c.Bind(&inv); err != nil {
		return err
	}
	err = services.UpdateInventory(id, inv)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusAccepted, inv)
}

func UpdateShipment(c *echo.Context) error {
	/*
		err := services.AuthorizeRequest(c)
		if err != nil {
			return err
		}
	*/
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		return err
	}

	var ship models.Shipment
	if err := c.Bind(&ship); err != nil {
		return err
	}
	err = services.UpdateShipment(id, ship)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusAccepted, ship)
}

func DeleteAccount(c *echo.Context) error {
	/*
		err := services.AuthorizeRequest(c)
		if err != nil {
			return err
		}
	*/
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		return err
	}

	err = services.DeleteAccount(id)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusAccepted, id)
}

func DeleteItem(c *echo.Context) error {
	/*
		err := services.AuthorizeRequest(c)
		if err != nil {
			return err
		}
	*/
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		return err
	}

	err = services.DeleteItem(id)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusAccepted, id)
}

func DeleteOrder(c *echo.Context) error {
	/*
		err := services.AuthorizeRequest(c)
		if err != nil {
			return err
		}
	*/
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		return err
	}

	err = services.DeleteOrder(id)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusAccepted, id)
}

func DeleteBox(c *echo.Context) error {
	/*
		err := services.AuthorizeRequest(c)
		if err != nil {
			return err
		}
	*/
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		return err
	}

	err = services.DeleteBox(id)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusAccepted, id)
}

func DeleteInventory(c *echo.Context) error {
	/*
		err := services.AuthorizeRequest(c)
		if err != nil {
			return err
		}
	*/
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		return err
	}

	err = services.DeleteInventory(id)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusAccepted, id)
}

func DeleteShipment(c *echo.Context) error {
	/*
		err := services.AuthorizeRequest(c)
		if err != nil {
			return err
		}
	*/
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		return err
	}

	err = services.DeleteShipment(id)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusAccepted, id)
}
