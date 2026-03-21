// SPDX-License-Identifier: GPL-3.0

import axios, { HttpStatusCode } from "axios";
import { jwtDecode } from "jwt-decode";
import { useContext } from "react";
import { GlobalContext } from "./GlobalContext";
import type {
  Account,
  Inventory,
  Item,
  ItemInfo,
  JwtObject,
  LocationData,
  UserState,
} from "./Models";

const apiHost: string =
  process.env.EXPO_PUBLIC_API_URL || "https://localhost:1323";

const api = axios.create({
  baseURL: apiHost,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const decodeToken = (token: string): JwtObject | null => {
  try {
    return jwtDecode<JwtObject>(token);
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
};

export function InitAPI() {
  const token = useContext(GlobalContext)?.jwToken;
  api.interceptors.request.use((config) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
}

export async function PingHealth(): Promise<boolean> {
  let active: boolean = false;

  try {
    const response = await axios.get<boolean>(apiHost + "/health");
    if (response.status !== HttpStatusCode.Ok) {
      throw "Health Check Failed To Pass!";
    }
    active = true;
  } catch (err) {
    console.error("Health check not OK!: " + err);
  }

  return active;
}

// Authorizes User Credentials With A JWT Response
export async function AuthorizeUser(
  username: string,
  password: string,
): Promise<[boolean, string, JwtObject]> {
  let exists: boolean;
  let token: string;
  let jwtPayload: JwtObject = {} as JwtObject;

  try {
    const response = await axios.post<{ token: string }>(
      apiHost + "/login",
      {
        username,
        password,
      },
      {
        //withCredentials: true,
      },
    );
    console.log("Raw response: ", response);
    if (response.status !== HttpStatusCode.Accepted) {
      exists = false;
      throw new Error("Response status: Unsuccessful");
    }
    if (response.data === null) {
      exists = false;
      throw new Error("Authorization failed / User does not exist");
    }

    exists = true;
    token = response.data["token"];
    jwtPayload = decodeToken(token)!;
    api.interceptors.request.use(
      (config) => {
        config.headers.Authorization = `Bearer ${token}`;
        return config;
      },
      (error) => {
        console.error("Request interceptor error: ", error);
        return Promise.reject(error);
      },
    );

    return [exists, token, jwtPayload];
  } catch (err) {
    console.error(err);
    alert(`Error: ${err}`);
    throw new Error("Failed To Query RESTapi: " + err);
  }
}

export async function CreateInventory(
  initiatorAccount: UserState,
  id: number | null,
  item: Item,
  total: number,
  locations: LocationData[],
): Promise<[boolean, Inventory]> {
  let successful: boolean;
  const newInventory: Inventory = {
    id: id,
    item: item,
    total: total,
    locations: locations,
  };

  try {
    if (
      initiatorAccount.role !== "ADMIN" &&
      initiatorAccount.role !== "MANAGER"
    ) {
      successful = false;
      alert("You Do Have Have Permission To Create Inventory Entries");
      throw new Error("Initiator's Account Is Not Privileged");
    }
    const response = await api.post<Inventory>(
      apiHost + "/api/inventory",
      {
        id: newInventory.id,
        item: newInventory.item,
        total: newInventory.total,
        locations: newInventory.locations,
      },
      {
        // withCredentials: true,
      },
    );
    if (response.status !== HttpStatusCode.Created) {
      console.error("Http Status Code Is Not [Created]: " + response.status);
      successful = false;
      throw new Error("Unexpected Response Status");
    }
    console.log("Raw Response Data: " + response.data);
    successful = true;
    return [successful, response.data];
  } catch (err) {
    console.error(err);
    alert(`Error: Failed To Create Inventory: ${err}`);
    throw new Error("Failed To Query RESTapi: " + err);
  }
}

export async function GetAllInventory(
  initiatorAccount: UserState,
): Promise<[boolean, Inventory[]]> {
  let received: boolean;
  let allInventory: Inventory[];

  try {
    if (!initiatorAccount.userActive) {
      received = false;
      alert("User Account Is Not Active!");
      throw new Error("Initiator's Account Is Not Privileged");
    }
    const response = await api.get<Inventory[]>(apiHost + "/api/inventory", {
      //withCredentials: true,
    });
    const data = response.data;
    console.log("Raw API Response: ", data);
    if (response.status !== HttpStatusCode.Ok) {
      received = false;
      throw new Error("Response Status: NOT 'Ok'");
    }
    received = true;
    allInventory = data;
    return [received, allInventory];
  } catch (err) {
    console.error(err);
    alert("Error: Failed To Get Inventory!: " + err);
    throw new Error("Failed To Query RESTapi: " + err);
  }
}

export async function GetInventory(
  initiatorAccount: UserState,
  id: number,
): Promise<[boolean, Inventory]> {
  let received: boolean;
  let entry: Inventory;

  try {
    if (
      initiatorAccount.role === "CUSTOMER" ||
      initiatorAccount.role === "SUPPLIER"
    ) {
      received = false;
      alert("You Do Have Have Permission To View This Entry");
      throw new Error("Initiator's Account Is Not Privileged");
    }

    console.log(`Attempting To Get Inventory Entry [${id}] ...`);
    const response = await api.get<Inventory>(
      apiHost + `/api/inventory/${id}`,
      {
        //withCredentials: true,
      },
    );
    const data = response.data;
    console.log("Raw API Response: ", data);
    if (response.status !== HttpStatusCode.Ok) {
      received = false;
      throw new Error("Response Status: NOT 'OK'");
    }
    received = true;
    entry = data;
    return [received, entry];
  } catch (err) {
    console.error(err);
    alert(`Error: Failed To Get Inventory Entry [${id}]: ` + err);
    throw new Error("Failed To Query RESTapi: " + err);
  }
}

export async function UpdateInventory(
  id: number,
  initiatorAccount: UserState,
  newInventory: Inventory,
): Promise<[boolean, Inventory]> {
  let success: boolean;

  try {
    if (
      initiatorAccount.role === "CUSTOMER" ||
      initiatorAccount.role === "SUPPLIER"
    ) {
      success = false;
      alert("You Do Have Have Permission To Update This Entry");
      throw new Error("Initiator's Account Is Not Privileged");
    }
    if (id !== newInventory.id) {
      console.error(
        `Input ID and New Inventory's ID Do Not Match:\n\tInput: ${id}, Entry: ${newInventory.id}`,
      );
      throw new Error(
        `Input ID and New Inventory's ID Do Not Match:\n\tInput: ${id}, Entry: ${newInventory.id}`,
      );
    }
    const response = await api.put<Inventory>(
      apiHost + `/api/inventory/${id}`,
      {
        id: newInventory.id,
        item: newInventory.item,
        total: newInventory.total,
        locations: newInventory.locations,
      },
      {
        //withCredentials: true,
      },
    );
    const inventoryData = response.data;
    console.log("Raw API Response: ", inventoryData);
    if (response.status !== HttpStatusCode.Accepted) {
      success = false;
      throw new Error(`Unexpected Response Status`);
    }
    success = true;
    return [success, inventoryData];
  } catch (err) {
    console.error(err);
    alert(`Error: Failed To Update Inventory Entry [${id}]: ` + err);
    throw new Error("Failed To Query RESTapi: " + err);
  }
}

export async function DeleteInventory(
  initiatorAccount: UserState,
  id: number,
): Promise<[boolean, number]> {
  let success: boolean;

  try {
    if (
      initiatorAccount.role !== "ADMIN" &&
      initiatorAccount.role !== "MANAGER"
    ) {
      success = false;
      alert("You Do Have Have Permission To Delete This Entry");
      throw new Error("Initiator's Account Is Not Privileged");
    }
    const response = await api.delete<number>(
      apiHost + `/api/inventory/${id}`,
      {
        //withCredentials: true,
      },
    );
    const data = response.data;
    console.log("Raw API Response: ", data);
    if (response.status !== HttpStatusCode.Accepted) {
      success = false;
      throw new Error("Unexpected Response Status!");
    }
    success = true;
    return [success, data];
  } catch (err) {
    console.error(err);
    alert(`Error: Failed To Delete Inventory Entry [${id}]: ` + err);
    throw new Error("Failed To Query RESTapi: " + err);
  }
}

// Account API

export async function GetAccount(id: number): Promise<[boolean, Account]> {
  let received: boolean;
  let account: Account;

  try {
    console.log(`Attempting To Get Account [${id}] ...`);
    const response = await api.get<Account>(apiHost + `/api/accounts/${id}`, {
      //withCredentials: true,
    });
    const data = response.data;
    console.log("Raw API Response: ", data);
    if (response.status !== HttpStatusCode.Ok) {
      received = false;
      throw new Error("Response Status: NOT 'OK'");
    }
    received = true;
    account = data;
    return [received, account];
  } catch (err) {
    console.error(err);
    alert(`Error: Failed To Get Account [${id}]: ` + err);
    throw new Error("Failed To Query RESTapi: " + err);
  }
}

// Items API

export async function GetItemsList(
  initiatorAccount: UserState,
): Promise<[boolean, ItemInfo[]]> {
  let received: boolean;
  let itemsInfo: ItemInfo[];

  try {
    /*
    if (!initiatorAccount.userActive) {
      received = false;
      alert("User Account Is Not Active!");
      throw new Error("Initiator's Account Is Not Privileged");
    }
    */
    const response = await api.get<ItemInfo[]>(apiHost + "/api/items/list", {
      //withCredentials: true,
    });
    const data = response.data;
    console.log("Raw API Response: ", data);
    if (response.status !== HttpStatusCode.Ok) {
      received = false;
      throw new Error("Response Status: NOT 'Ok'");
    }
    received = true;
    itemsInfo = data;
    return [received, itemsInfo];
  } catch (err) {
    console.error(err);
    alert("Error: Failed To Get Item Names!: " + err);
    throw new Error("Failed To Query RESTapi: " + err);
  }
}

export async function GetItems(
  initiatorAccount: UserState,
): Promise<[boolean, Item[]]> {
  let received: boolean;
  let items: Item[];

  try {
    /*
    if (!initiatorAccount.userActive) {
      received = false;
      alert("User Account Is Not Active!");
      throw new Error("Initiator's Account Is Not Privileged");
    }
    */
    const response = await api.get<Item[]>(apiHost + "/api/items", {
      //withCredentials: true,
    });
    const data = response.data;
    console.log("Raw API Response: ", data);
    if (response.status !== HttpStatusCode.Ok) {
      received = false;
      throw new Error("Response Status: NOT 'Ok'");
    }
    received = true;
    items = data;
    return [received, items];
  } catch (err) {
    console.error(err);
    alert("Error: Failed To Get Items!: " + err);
    throw new Error("Failed To Query RESTapi: " + err);
  }
}

export async function GetItem(
  initiatorAccount: UserState,
  id: number,
): Promise<[boolean, Item]> {
  let received: boolean;
  let item: Item;

  try {
    /*
    if (!initiatorAccount.userActive) {
      received = false;
      alert("User Account Is Not Active!");
      throw new Error("Initiator's Account Is Not Privileged");
    }
      */

    console.log(`Attempting To Get Item [${id}] ...`);
    const response = await api.get<Item>(apiHost + `/api/items/${id}`, {
      //withCredentials: true,
    });
    const data = response.data;
    console.log("Raw API Response: ", data);
    if (response.status !== HttpStatusCode.Ok) {
      received = false;
      throw new Error("Response Status: NOT 'OK'");
    }
    received = true;
    item = data;
    return [received, item];
  } catch (err) {
    console.error(err);
    alert(`Error: Failed To Get Item [${id}]: ` + err);
    throw new Error("Failed To Query RESTapi: " + err);
  }
}
