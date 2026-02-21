// SPDX-License-Identifier: GPL-3.0

import axios, { HttpStatusCode } from "axios";
import type { Inventory, Item, LocationData } from "../app/models";
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

export function InitInvAPI() {
  const token = useAppSelector(selectJWT);
  api.interceptors.request.use((config) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
}

export async function CreateInventory(
  initiatorAccount: AccountSliceState,
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
  initiatorAccount: AccountSliceState,
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
  initiatorAccount: AccountSliceState,
  id: number,
): Promise<[boolean, Inventory]> {
  let received: boolean;
  let entry: Inventory;

  try {
    if (
      initiatorAccount.role !== "ADMIN" &&
      initiatorAccount.role !== "MANAGER"
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
  initiatorAccount: AccountSliceState,
  newInventory: Inventory,
): Promise<[boolean, Inventory]> {
  let success: boolean;

  try {
    if (
      initiatorAccount.role !== "ADMIN" &&
      initiatorAccount.role !== "MANAGER"
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
