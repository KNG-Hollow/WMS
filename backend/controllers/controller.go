// SPDX-License-Identifier: GPL-3.0

package controllers

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/WMS/models"
	"github.com/WMS/services"
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

	token, err := services.InitJWT(acc)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusAccepted, token)
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

	account, err := services.GetAccount(id)
	if err != nil {
		return err
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

func GetItemsList(c *echo.Context) error {
	/*
		err := services.AuthorizeRequest(c)
		if err != nil {
			return err
		}
	*/
	items, err := services.GetItemsList()
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

	item, err := services.GetItem(id)
	if err != nil {
		return err
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
