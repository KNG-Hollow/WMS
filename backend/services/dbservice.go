// SPDX-License-Identifier: GPL-3.0

package services

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"image"
	"image/png"
	"log"
	"os"

	"github.com/WMS/models"
	"github.com/jackc/pgx/v5"
)

func Connect() *pgx.Conn {
	fmt.Println("Attempting to connect to database...")
	url := fmt.Sprintf("postgres://%v:%v@%v:%v/%v",
		os.Getenv("DBUSER"),
		os.Getenv("DBPASS"),
		os.Getenv("DBHOST"),
		os.Getenv("DBPORT"),
		os.Getenv("DBNAME"),
	)

	conn, err := pgx.Connect(context.Background(), url)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to Connect to database: %v\n", err)
		os.Exit(1)
	}
	/*
		err = registerDataTypes(context.Background(), conn)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Failed to register custom data types: %v\n", err)
			os.Exit(1)
		}
	*/
	fmt.Println("Successfully connected to database!")
	return conn
}

/*
	func registerDataTypes(c context.Context, conn *pgx.Conn) error {
		dataTypeNames := []string{
			//"role",
			//"_role",
			//"image",
			//"_image",
			//"customer",
			//"_customer",
			//"payload",
			//"_payload",
			//"item",
			//"_item",
		}

		for _, typeName := range dataTypeNames {
			dataType, err := conn.LoadType(c, typeName)
			if err != nil {
				return err
			}
			conn.TypeMap().RegisterType(dataType)
		}

		fmt.Println("Data Types Registered!")
		return nil
	}
*/

func convertByteToImage(imageData []byte) (image.Image, error) {
	fmt.Println("Attempting to convert bytea to image...")

	img, err := png.Decode(bytes.NewReader(imageData))
	if err != nil {
		return nil, err
	}

	fmt.Println("Successfully converted bytea to image!")
	return img, nil
}

func ConvertImageToByte(image image.Image) ([]byte, error) {
	fmt.Println("Attempting to convert image to bytea...")

	var buf bytes.Buffer
	fmt.Printf("Image type: %T\n", image)
	err := png.Encode(&buf, image)
	if err != nil {
		log.Fatalf("failed to encode image: %v\n", err)
	}
	fmt.Println(buf.Len())
	imageData := buf.Bytes()

	fmt.Println("Successfully converted image to bytea!")
	return imageData, nil
}

func AddAccount(account models.Account) error {
	hashPass, err := hashPassword(account.Password)
	if err != nil {
		return errors.New("failed to hash password")
	}

	conn := Connect()
	defer conn.Close(context.Background())

	fmt.Println("Attempting to add account to database...")
	commandstr := "insert into account (id, firstname, lastname, email, phone, username, password, role, active, created) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)"

	command, err := conn.Exec(context.Background(), commandstr,
		account.ID,
		account.Firstname,
		account.Lastname,
		account.Email,
		account.Phone,
		account.Username,
		hashPass,
		account.Role.Value,
		account.Active,
		account.Created,
	)
	if err != nil {
		return err
	}
	if command.RowsAffected() != 1 {
		return errors.New("No new account created")
	}

	fmt.Println("Successfully added account!")
	return nil
}

func AddItem(item models.Item) error {
	conn := Connect()
	defer conn.Close(context.Background())

	fmt.Println("Attempting to add item to database...")
	//imageBytes, err := models.ConvertImageToByte(item.Image.Img)
	//if err != nil {
	//	return err
	//}

	commandstr := "insert into item (id, upc, name, description, weight, image) values ($1, $2, $3, $4, $5, $6)"
	command, err := conn.Exec(context.Background(), commandstr,
		item.ID,
		item.UPC,
		item.Name,
		item.Description,
		item.Weight,
		item.Image.Data,
	)
	if err != nil {
		return err
	}
	if command.RowsAffected() != 1 {
		return errors.New("No new item created")
	}

	fmt.Println("Successfully added item!")
	return nil
}

func AddOrder(order models.Order) error {
	conn := Connect()
	defer conn.Close(context.Background())

	fmt.Println("Attempting to add order to database!")
	commandstr := "insert into order_data (id, customer, address, timeOrdered, payload) values ($1, $2, $3, $4, $5)"
	command, err := conn.Exec(context.Background(), commandstr,
		order.ID,
		order.Customer,
		order.Address,
		order.TimeOrdered,
		order.Payload,
	)
	if err != nil {
		return err
	}
	if command.RowsAffected() != 1 {
		return errors.New("No new order created")
	}

	fmt.Println("Successfully added order!")
	return nil
}

func AddBox(box models.Box) error {
	conn := Connect()
	defer conn.Close(context.Background())

	fmt.Println("Attempting to add box to database!")

	commandstr := "insert into box (id, upc, item, dimensions, count) values ($1, $2, $3, $4, $5)"
	command, err := conn.Exec(context.Background(), commandstr,
		box.ID,
		box.UPC,
		box.Item,
		box.Dimensions,
		box.Count,
	)
	if err != nil {
		return err
	}
	if command.RowsAffected() != 1 {
		return errors.New("No new row created")
	}

	fmt.Println("Successfully added box!")
	return nil
}

func AddInventory(inv models.Inventory) error {
	conn := Connect()
	defer conn.Close(context.Background())

	fmt.Println("Attempting to add inventory to database!")

	commandstr := "insert into inventory (id, item, total, locations) values ($1, $2, $3, $4)"
	command, err := conn.Exec(context.Background(), commandstr,
		inv.ID,
		inv.Item,
		inv.TotalCount,
		inv.Locations,
	)
	if err != nil {
		return err
	}
	if command.RowsAffected() != 1 {
		return errors.New("No new row created")
	}

	fmt.Println("Successfully added inventory!")
	return nil
}

func GetAccounts() ([]models.Account, error) {
	conn := Connect()

	defer conn.Close(context.Background())

	fmt.Println("Attempting to get accounts...")
	rows, _ := conn.Query(context.Background(), "select * from account")
	accounts, err := pgx.CollectRows(rows, func(row pgx.CollectableRow) (models.Account, error) {
		var n models.Account
		err := row.Scan(
			&n.ID,
			&n.Firstname,
			&n.Lastname,
			&n.Email,
			&n.Phone,
			&n.Username,
			&n.Password,
			&n.Role,
			&n.Active,
			&n.Created,
		)
		if err != nil {
			return models.Account{}, err
		}
		return n, err
	})
	if err != nil {
		fmt.Printf("CollectRows error: %v", err)
		return []models.Account{}, err
	}
	if len(accounts) < 1 {
		return []models.Account{}, errors.New("Accounts table is empty")
	}

	fmt.Println("Successfully retrieved accounts!")
	return accounts, nil
}

func GetAccount(id int) (models.Account, error) {
	conn := Connect()

	defer conn.Close(context.Background())

	fmt.Printf("Attempting to get account: %v...\n", id)
	rows, _ := conn.Query(context.Background(), "select * from account where id=$1", id)
	col, err := pgx.CollectRows(rows, func(row pgx.CollectableRow) (models.Account, error) {
		var n models.Account
		err := row.Scan(
			&n.ID,
			&n.Firstname,
			&n.Lastname,
			&n.Email,
			&n.Phone,
			&n.Username,
			&n.Password,
			&n.Role,
			&n.Active,
			&n.Created,
		)
		if err != nil {
			return models.Account{}, err
		}
		return n, err
	})
	if err != nil {
		return models.Account{}, err
	}
	if len(col) != 1 {
		return models.Account{}, errors.New("Account does not exist or there are duplicate accounts")
	}

	account := col[0]

	fmt.Printf("Successfully retrieved account: %v!\n", id)
	return account, nil
}

func GetItems() ([]models.Item, error) {
	conn := Connect()

	defer conn.Close(context.Background())

	fmt.Println("Attempting to get items...")
	rows, _ := conn.Query(context.Background(), "select * from item")
	items, err := pgx.CollectRows(rows, func(row pgx.CollectableRow) (models.Item, error) {
		var n models.Item
		err := row.Scan(
			&n.ID,
			&n.UPC,
			&n.Name,
			&n.Description,
			&n.Weight,
			&n.Image,
		)
		if err != nil {
			return models.Item{}, err
		}
		return n, err
	})
	if err != nil {
		fmt.Printf("CollectRows error: %v", err)
		return []models.Item{}, err
	}
	if len(items) < 1 {
		return []models.Item{}, errors.New("Item table is empty")
	}

	fmt.Println("Successfully retrieved items!")
	return items, nil
}

func GetItem(id int) (models.Item, error) {
	conn := Connect()

	fmt.Printf("Attempting to get item: %v...\n", id)
	rows, _ := conn.Query(context.Background(), "select * from item where id=$1", id)
	col, err := pgx.CollectRows(rows, func(row pgx.CollectableRow) (models.Item, error) {
		var n models.Item
		err := row.Scan(
			&n.ID,
			&n.UPC,
			&n.Name,
			&n.Description,
			&n.Weight,
			&n.Image,
		)
		if err != nil {
			return models.Item{}, err
		}
		return n, err
	})
	if err != nil {
		fmt.Printf("CollectRows error: %v", err)
		return models.Item{}, err
	}
	if len(col) < 1 {
		return models.Item{}, errors.New("Item table is empty")
	}

	item := col[0]

	fmt.Printf("Successfully retrieved item: %v!\n", id)
	return item, nil
}

func GetOrders() ([]models.Order, error) {
	conn := Connect()

	defer conn.Close(context.Background())

	fmt.Println("Attempting to get orders...")
	rows, _ := conn.Query(context.Background(), "select * from order_data")
	orders, err := pgx.CollectRows(rows, func(row pgx.CollectableRow) (models.Order, error) {
		var n models.Order
		err := row.Scan(
			&n.ID,
			&n.Customer,
			&n.Address,
			&n.TimeOrdered,
			&n.Payload,
		)
		if err != nil {
			return models.Order{}, err
		}
		return n, nil
	})
	if err != nil {
		fmt.Printf("CollectRows error: %v", err)
		return []models.Order{}, err
	}
	if len(orders) < 1 {
		return []models.Order{}, errors.New("Order table is empty")
	}

	fmt.Println("Successfully retrieved orders!")
	return orders, nil
}

func GetOrder(id int) (models.Order, error) {
	conn := Connect()

	fmt.Printf("Attempting to get order: %v...\n", id)
	rows, _ := conn.Query(context.Background(), "select * from order_data where id=$1", id)
	col, err := pgx.CollectRows(rows, func(row pgx.CollectableRow) (models.Order, error) {
		var n models.Order
		err := row.Scan(
			&n.ID,
			&n.Customer,
			&n.Address,
			&n.TimeOrdered,
			&n.Payload,
		)
		if err != nil {
			return models.Order{}, err
		}
		return n, err
	})
	if err != nil {
		fmt.Printf("CollectRows error: %v", err)
		return models.Order{}, err
	}
	if len(col) < 1 {
		return models.Order{}, errors.New("Order table is empty")
	}

	order := col[0]

	fmt.Printf("Successfully retrieved order: %v!\n", id)
	return order, nil
}

func GetBoxes() ([]models.Box, error) {
	conn := Connect()

	defer conn.Close(context.Background())

	fmt.Println("Attempting to get boxes...")
	rows, _ := conn.Query(context.Background(), "select * from box")
	boxes, err := pgx.CollectRows(rows, func(row pgx.CollectableRow) (models.Box, error) {
		var n models.Box
		err := row.Scan(
			&n.ID,
			&n.UPC,
			&n.Item,
			&n.Dimensions,
			&n.Count,
		)
		if err != nil {
			return models.Box{}, err
		}
		return n, nil
	})
	if err != nil {
		fmt.Printf("CollectRows error: %v", err)
		return []models.Box{}, err
	}
	if len(boxes) < 1 {
		return []models.Box{}, errors.New("Box table is empty")
	}

	fmt.Println("Successfully retrieved boxes!")
	return boxes, nil
}

func GetBox(id int) (models.Box, error) {
	conn := Connect()

	fmt.Printf("Attempting to get box: %v...\n", id)
	rows, _ := conn.Query(context.Background(), "select * from box where id=$1", id)
	boxes, err := pgx.CollectRows(rows, func(row pgx.CollectableRow) (models.Box, error) {
		var n models.Box
		err := row.Scan(
			&n.ID,
			&n.UPC,
			&n.Item,
			&n.Dimensions,
			&n.Count,
		)
		if err != nil {
			return models.Box{}, err
		}
		return n, nil
	})
	if err != nil {
		fmt.Printf("CollectRows error: %v", err)
		return models.Box{}, err
	}
	if len(boxes) < 1 {
		return models.Box{}, errors.New("Box table is empty")
	}

	box := boxes[0]

	fmt.Printf("Successfully retrieved box: %v!\n", id)
	return box, nil
}

func GetAllInventory() ([]models.Inventory, error) {
	conn := Connect()

	defer conn.Close(context.Background())

	fmt.Println("Attempting to get inventory...")
	rows, _ := conn.Query(context.Background(), "select * from inventory")
	inventory, err := pgx.CollectRows(rows, func(row pgx.CollectableRow) (models.Inventory, error) {
		var n models.Inventory
		err := row.Scan(
			&n.ID,
			&n.Item,
			&n.TotalCount,
			&n.Locations,
		)
		if err != nil {
			return models.Inventory{}, err
		}
		return n, nil
	})
	if err != nil {
		fmt.Printf("CollectRows error: %v", err)
		return []models.Inventory{}, err
	}
	if len(inventory) < 1 {
		return []models.Inventory{}, errors.New("Inventory table is empty")
	}

	fmt.Println("Successfully retrieved inventory!")
	return inventory, nil
}

func GetInventory(id int) (models.Inventory, error) {
	conn := Connect()

	fmt.Printf("Attempting to get inventory: %v...\n", id)
	rows, _ := conn.Query(context.Background(), "select * from inventory where id=$1", id)
	allInventory, err := pgx.CollectRows(rows, func(row pgx.CollectableRow) (models.Inventory, error) {
		var n models.Inventory
		err := row.Scan(
			&n.ID,
			&n.Item,
			&n.TotalCount,
			&n.Locations,
		)
		if err != nil {
			return models.Inventory{}, err
		}
		return n, nil
	})
	if err != nil {
		fmt.Printf("CollectRows error: %v", err)
		return models.Inventory{}, err
	}
	if len(allInventory) < 1 {
		return models.Inventory{}, errors.New("Inventory table is empty")
	}

	inv := allInventory[0]

	fmt.Printf("Successfully retrieved inventory: %v!\n", id)
	return inv, nil
}

func UpdateAccount(id int, newData models.Account) error {
	hashPass, err := hashPassword(newData.Password)
	if err != nil {
		return errors.New("failed to hash password")
	}

	conn := Connect()
	defer conn.Close(context.Background())

	fmt.Printf("Attempting to update account: %v...\n", id)
	commandstr := "update account set firstname=$1, lastname=$2, email=$3, phone=$4, username=$5, password=$6, role=$7, active=$8 where id=$9"
	command, err := conn.Exec(context.Background(), commandstr,
		newData.Firstname,
		newData.Lastname,
		newData.Email,
		newData.Phone,
		newData.Username,
		hashPass,
		newData.Role.Value,
		newData.Active,
		id,
	)
	if err != nil {
		return err
	}
	if command.RowsAffected() != 1 {
		return errors.New("No account updated")
	}

	fmt.Printf("Successfully updated account: %v!\n", id)
	return nil
}

func UpdateItem(id int, newData models.Item) error {
	conn := Connect()
	defer conn.Close(context.Background())

	fmt.Printf("Attempting to update item: %v...\n", id)
	commandstr := "update item set upc=$1, name=$2, description=$3, weight=$4, image=$5 where id=$6"
	command, err := conn.Exec(context.Background(), commandstr,
		newData.UPC,
		newData.Name,
		newData.Description,
		newData.Weight,
		newData.Image.Data,
		id,
	)
	if err != nil {
		return err
	}
	if command.RowsAffected() != 1 {
		return errors.New("No item updated")
	}

	fmt.Printf("Successfully updated item: %v!\n", id)
	return nil
}

func UpdateOrder(id int, newData models.Order) error {
	conn := Connect()
	defer conn.Close(context.Background())

	fmt.Printf("Attempting to update order: %v...\n", id)
	commandstr := "update order_data set customer=$1, address=$2, timeOrdered=$3, payload=$4 where id=$5"

	command, err := conn.Exec(context.Background(), commandstr,
		newData.Customer,
		newData.Address,
		newData.TimeOrdered,
		newData.Payload,
		id,
	)
	if err != nil {
		return err
	}
	if command.RowsAffected() != 1 {
		return errors.New("No order updated")
	}

	fmt.Printf("Successfully updated order: %v!\n", id)
	return nil
}

func UpdateBox(id int, newData models.Box) error {
	conn := Connect()
	defer conn.Close(context.Background())

	fmt.Printf("Attempting to update box: %v...\n", id)
	commandstr := "update box set upc=$1, item=$2, dimensions=$3, count=$4 where id=$5"

	command, err := conn.Exec(context.Background(), commandstr,
		newData.UPC,
		newData.Item,
		newData.Dimensions,
		newData.Count,
		id,
	)
	if err != nil {
		return err
	}
	if command.RowsAffected() != 1 {
		return errors.New("No box updated")
	}

	fmt.Printf("Successfully updated box: %v!\n", id)
	return nil
}

func UpdateInventory(id int, newData models.Inventory) error {
	conn := Connect()
	defer conn.Close(context.Background())

	fmt.Printf("Attempting to update inventory: %v...\n", id)
	commandstr := "update inventory set id=$1, item=$2, total=$3, locations=$4 where id=$5"

	command, err := conn.Exec(context.Background(), commandstr,
		newData.ID,
		newData.Item,
		newData.TotalCount,
		newData.Locations,
		id,
	)
	if err != nil {
		return err
	}
	if command.RowsAffected() != 1 {
		return errors.New("no inventory updated")
	}

	fmt.Printf("Successfully updated inventory: %v!\n", id)
	return nil
}

func DeleteAccount(id int) error {
	conn := Connect()
	defer conn.Close(context.Background())

	fmt.Printf("Attempting to delete account: %v...\n", id)
	command, err := conn.Exec(context.Background(), "delete from account where id=$1", id)
	if err != nil {
		return err
	}
	if command.RowsAffected() != 1 {
		return errors.New("No account deleted!")
	}

	fmt.Printf("Successfully deleted account: %v!\n", id)
	return nil
}

func DeleteItem(id int) error {
	conn := Connect()
	defer conn.Close(context.Background())

	fmt.Printf("Attempting to delete item: %v...\n", id)
	command, err := conn.Exec(context.Background(), "delete from item where id=$1", id)
	if err != nil {
		return err
	}
	if command.RowsAffected() != 1 {
		return errors.New("No item deleted!")
	}

	fmt.Printf("Successfully deleted item: %v!\n", id)
	return nil
}

func DeleteOrder(id int) error {
	conn := Connect()
	defer conn.Close(context.Background())

	fmt.Printf("Attempting to delete order: %v...\n", id)
	command, err := conn.Exec(context.Background(), "delete from order_data where id=$1", id)
	if err != nil {
		return err
	}
	if command.RowsAffected() != 1 {
		return errors.New("No order deleted!")
	}

	fmt.Printf("Successfully deleted order: %v!\n", id)
	return nil
}

func DeleteBox(id int) error {
	conn := Connect()
	defer conn.Close(context.Background())

	fmt.Printf("Attempting to delete box: %v...\n", id)
	command, err := conn.Exec(context.Background(), "delete from box where id=$1", id)
	if err != nil {
		return err
	}
	if command.RowsAffected() != 1 {
		return errors.New("No box deleted!")
	}

	fmt.Printf("Successfully deleted box: %v!\n", id)
	return nil
}

func DeleteInventory(id int) error {
	conn := Connect()
	defer conn.Close(context.Background())

	fmt.Printf("Attempting to delete inventory: %v...\n", id)
	command, err := conn.Exec(context.Background(), "delete from inventory where id=$1", id)
	if err != nil {
		return err
	}
	if command.RowsAffected() != 1 {
		return errors.New("No inventory deleted!")
	}

	fmt.Printf("Successfully deleted inventory: %v!\n", id)
	return nil
}
