// SPDX-License-Identifier: GPL-3.0

import axios, { HttpStatusCode } from "axios";
import type { ImageInfo, Item } from "../app/models";
import {
  selectJWT,
  type AccountSliceState,
} from "../features/accounts/accountSlice";
import { useAppSelector } from "../app/hooks";

const apiHost: string =
  import.meta.env.VITE_API_URL || "https://localhost:1323";

const api = axios.create({
  baseURL: apiHost,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export function InitItemAPI() {
  const token = useAppSelector(selectJWT);
  api.interceptors.request.use((config) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
}

export async function CreateItem(
  initiatorAccount: AccountSliceState,
  id: number | null,
  upc: string,
  name: string,
  description: string,
  weight: number,
  image: ImageInfo,
): Promise<[boolean, Item]> {
  let successful: boolean;
  const newItem: Item = {
    id: id,
    upc: upc,
    name: name,
    description: description,
    weight: weight,
    image: image,
  };

  try {
    if (
      initiatorAccount.role !== "ADMIN" &&
      initiatorAccount.role !== "MANAGER"
    ) {
      successful = false;
      alert("You Do Have Have Permission To Create Items");
      throw new Error("Initiator's Account Is Not Privileged");
    }
    const response = await api.post<Item>(
      apiHost + "/api/items",
      {
        id: newItem.id,
        upc: newItem.upc,
        name: newItem.name,
        description: newItem.description,
        weight: newItem.weight,
        image: newItem.image.data,
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
    alert(`Error: Failed To Create Item: ${err}`);
    throw new Error("Failed To Query RESTapi: " + err);
  }
}

export async function GetItems(
  initiatorAccount: AccountSliceState,
): Promise<[boolean, Item[]]> {
  let received: boolean;
  let items: Item[];

  try {
    if (!initiatorAccount.userActive) {
      received = false;
      alert("User Account Is Not Active!");
      throw new Error("Initiator's Account Is Not Privileged");
    }
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
  initiatorAccount: AccountSliceState,
  id: number,
): Promise<[boolean, Item]> {
  let received: boolean;
  let item: Item;

  try {
    if (!initiatorAccount.userActive) {
      received = false;
      alert("User Account Is Not Active!");
      throw new Error("Initiator's Account Is Not Privileged");
    }

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

export async function UpdateItem(
  id: number,
  initiatorAccount: AccountSliceState,
  newItem: Item,
): Promise<[boolean, Item]> {
  let success: boolean;

  try {
    if (
      initiatorAccount.role !== "ADMIN" &&
      initiatorAccount.role !== "MANAGER"
    ) {
      success = false;
      alert("You Do Have Have Permission To Update This Item");
      throw new Error("Initiator's Account Is Not Privileged");
    }
    if (id !== newItem.id) {
      console.error(
        `Input ID and New Item's ID Do Not Match:\n\tInput: ${id}, Entry: ${newItem.id}`,
      );
      throw new Error(
        `Input ID and New Item's ID Do Not Match:\n\tInput: ${id}, Entry: ${newItem.id}`,
      );
    }
    const response = await api.put<Item>(
      apiHost + `/api/items/${id}`,
      {
        id: newItem.id,
        upc: newItem.upc,
        name: newItem.name,
        description: newItem.description,
        weight: newItem.weight,
        image: newItem.image.data,
      },
      {
        //withCredentials: true,
      },
    );
    const itemData = response.data;
    console.log("Raw API Response: ", itemData);
    if (response.status !== HttpStatusCode.Accepted) {
      success = false;
      throw new Error(`Unexpected Response Status`);
    }
    success = true;
    return [success, itemData];
  } catch (err) {
    console.error(err);
    alert(`Error: Failed To Update Item [${id}]: ` + err);
    throw new Error("Failed To Query RESTapi: " + err);
  }
}

export async function DeleteInventory(
  initiatorAccount: AccountSliceState,
  id: number,
): Promise<[boolean, number]> {
  let success: boolean;

  try {
    if (
      initiatorAccount.role !== "ADMIN" &&
      initiatorAccount.role !== "MANAGER"
    ) {
      success = false;
      alert("You Do Have Have Permission To Delete This Item!");
      throw new Error("Initiator's Account Is Not Privileged");
    }
    const response = await api.delete<number>(apiHost + `/api/items/${id}`, {
      //withCredentials: true,
    });
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
    alert(`Error: Failed To Delete Item [${id}]: ` + err);
    throw new Error("Failed To Query RESTapi: " + err);
  }
}
