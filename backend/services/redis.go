// SPDX-License-Identifier: GPL-3.0

package services

import (
	"context"
	"encoding/json/v2"
	"fmt"
	"os"

	"github.com/KNG-Hollow/WMS/backend/models"
	"github.com/redis/go-redis/v9"
)

// TODO Caching for 'Accounts Online',
//  'Photo Caching'

var (
	Rdb *redis.Client = redis.NewClient(&redis.Options{
		Addr:     os.Getenv("REDIS_HOST") + ":" + os.Getenv("REDIS_PORT"),
		Password: "",
		DB:       0,
		Protocol: 2,
		OnConnect: func(ctx context.Context, cn *redis.Conn) error {
			fmt.Println("Connected to Redis server!")
			return nil
		},
	})
	ctx context.Context = context.Background()
)

// Utility

func InitRedisClient() *redis.Client {
	err := Rdb.FlushDB(context.Background()).Err()
	if err != nil {
		fmt.Println("Failed to flush cache")
	} else {
		fmt.Println("Flushed Cache!")
	}
	return Rdb
}

// TODO
// Instead of using the CheckCache function
// before each call, have redis try to get the query
// and if it doesnt return, have the database query
func CheckCache(prefix string, id string) bool {
	fmt.Printf("Checking cache for %s:%s\n", prefix, id)
	arr, _, err := Rdb.Scan(ctx, 0, fmt.Sprintf("%s:%s", prefix, id), 3).Result()
	if err != nil {
		fmt.Printf("Redis scan error: %s\n", err)
		panic(err)
	} else {
		if len(arr) > 0 {
			fmt.Printf("Cache Found!\n")
			return true
		}
	}
	fmt.Printf("Cache with %s:%s does not exist\n", prefix, id)
	return false
}

// Account

func AddAccountToCache(account models.Account) error {
	fmt.Println("Adding account to cache")
	err := Rdb.JSONSet(ctx, fmt.Sprintf("account:%d", account.ID), "$", account).Err()
	if err != nil {
		panic(err)
	}
	return nil
}

func AddCustomerListToCache(accounts []models.Account) error {
	fmt.Println("Adding customer list to cache")
	pipe := Rdb.Pipeline()

	for _, v := range accounts {
		pipe.JSONSet(ctx, fmt.Sprintf("customer:%d", v.ID), "$", v).Err()
	}
	_, err := pipe.Exec(ctx)
	if err != nil {
		panic(err)
	}
	return nil
}

func GetAccountFromCache(id int64) (models.Account, error) {
	fmt.Println("Getting account from cache")
	acc, err := Rdb.JSONGet(ctx, fmt.Sprintf("account:%d", id)).Result()
	if err == redis.Nil {
		fmt.Printf("account:%d does not exits", id)
	} else if err != nil {
		panic(err)
	} else {
		var account models.Account
		byte := []byte(acc)
		err := json.Unmarshal(byte, &account)
		if err != nil {
			panic(err)
		}
		return account, nil
	}
	return models.Account{}, err
}

func GetCustomerListFromCache() ([]models.Account, error) {
	fmt.Println("Getting customer list from cache")
	arr, _, err := Rdb.Scan(ctx, 0, "customer:*", 10000).Result()
	if err == redis.Nil {
		fmt.Println("customer: cache failed to return an array")
	} else if err != nil {
		panic(err)
	}
	var accounts []models.Account
	for _, v := range arr {
		acc, err := Rdb.JSONGet(ctx, v).Result()
		if err == redis.Nil {
			fmt.Printf("%s does not exits", v)
		} else if err != nil {
			panic(err)
		} else {
			var account models.Account
			byte := []byte(acc)
			err := json.Unmarshal(byte, &account)
			if err != nil {
				panic(err)
			}
			accounts = append(accounts, account)
		}
	}
	return accounts, err
}

func DeleteAccountFromCache(id int64) error {
	fmt.Println("Deleting account from cache")
	int, err := Rdb.Del(ctx, fmt.Sprintf("account:%d", id)).Result()
	if err != nil {
		return err
	} else if int < 1 {
		return fmt.Errorf("account:%d was not found, failed to delete\n", id)
	}
	return nil
}

// Item

func AddProductToCache(item models.Item) error {
	fmt.Println("Adding product to cache")
	err := Rdb.JSONSet(ctx, fmt.Sprintf("product:%d", item.ID), "$", item).Err()
	if err != nil {
		panic(err)
	}
	return nil
}
func AddProductListToCache(items []models.ItemInfo) error {
	fmt.Println("Adding product info to cache")
	pipe := Rdb.Pipeline()

	for _, v := range items {
		pipe.JSONSet(ctx, fmt.Sprintf("productInfo:%d", v.ID), "$", v).Err()
	}
	_, err := pipe.Exec(ctx)
	if err != nil {
		panic(err)
	}
	return nil
}

func GetProductFromCache(id int64) (models.Item, error) {
	fmt.Println("Getting product from cache")
	prodStr, err := Rdb.JSONGet(ctx, fmt.Sprintf("product:%d", id)).Result()
	if err == redis.Nil {
		fmt.Printf("product:%d does not exits", id)
	} else if err != nil {
		panic(err)
	} else {
		var item models.Item
		byte := []byte(prodStr)
		err := json.Unmarshal(byte, &item)
		if err != nil {
			panic(err)
		}
		return item, nil
	}
	return models.Item{}, err
}

func GetProductListFromCache() ([]models.ItemInfo, error) {
	fmt.Println("Getting product info from cache")
	arr, _, err := Rdb.Scan(ctx, 0, "productInfo:*", 10000).Result()
	if err == redis.Nil {
		fmt.Println("productList: cache failed to return an array")
	} else if err != nil {
		panic(err)
	}
	var products []models.ItemInfo
	for _, v := range arr {
		acc, err := Rdb.JSONGet(ctx, v).Result()
		if err == redis.Nil {
			fmt.Printf("%s does not exits", v)
		} else if err != nil {
			panic(err)
		} else {
			var item models.ItemInfo
			byte := []byte(acc)
			err := json.Unmarshal(byte, &item)
			if err != nil {
				panic(err)
			}
			products = append(products, item)
		}
	}
	return products, err
}

func DeleteProductFromCache(id int64) error {
	fmt.Println("Deleting product from cache")
	int, err := Rdb.Del(ctx, fmt.Sprintf("product:%d", id)).Result()
	if err != nil {
		return err
	} else if int < 1 {
		return fmt.Errorf("product:%d was not found, failed to delete\n", id)
	}
	return nil
}
