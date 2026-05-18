// SPDX-License-Identifier: GPL-3.0

import { useAppSelector } from "@/app/hooks";
import type { Account, ItemGroup, Order } from "@/app/models";
import {
  selectJWT,
  type AccountSliceState,
} from "@/features/accounts/accountSlice";
import axios, { HttpStatusCode } from "axios";

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

export function InitOrderAPI() {
  const token = useAppSelector(selectJWT);
  api.interceptors.request.use((config) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
}

export async function CreateOrder(
  initiatorAccount: AccountSliceState,
  id: number | null,
  customer: Account,
  address: string,
  time: Date | string,
  payload: ItemGroup[],
): Promise<[boolean, Order]> {
  let successful: boolean;
  const newOrder: Order = {
    id: id,
    customer: customer,
    address: address,
    timeOrdered: time,
    payload: payload,
  };

  try {
    if (
      initiatorAccount.role !== "ADMIN" &&
      initiatorAccount.role !== "MANAGER"
    ) {
      successful = false;
      alert("You Do Have Have Permission To Create Order Entries");
      throw new Error("Initiator's Account Is Not Privileged");
    }
    const response = await api.post<Order>(
      apiHost + "/api/orders",
      {
        id: newOrder.id,
        customer: newOrder.customer,
        address: newOrder.address,
        time: newOrder.timeOrdered,
        payload: newOrder.payload,
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
    alert(`Error: Failed To Create Order: ${err}`);
    throw new Error("Failed To Query RESTapi: " + err);
  }
}

export async function GetAllOrders(
  initiatorAccount: AccountSliceState,
): Promise<[boolean, Order[]]> {
  let received: boolean;
  let allOrders: Order[];

  try {
    if (!initiatorAccount.userActive) {
      received = false;
      alert("User Account Is Not Active!");
      throw new Error("Initiator's Account Is Not Privileged");
    }
    if (
      initiatorAccount.role === "CUSTOMER" ||
      initiatorAccount.role === "SUPPLIER"
    ) {
      received = false;
      alert("You Do Have Have Permission To View This Entry");
      throw new Error("Initiator's Account Is Not Privileged");
    }
    const response = await api.get<Order[]>(apiHost + "/api/orders", {
      //withCredentials: true,
    });
    const data = response.data;
    console.log("Raw API Response: ", data);
    if (response.status !== HttpStatusCode.Ok) {
      received = false;
      throw new Error("Response Status: NOT 'Ok'");
    }
    received = true;
    allOrders = data;
    return [received, allOrders];
  } catch (err) {
    console.error(err);
    alert("Error: Failed To Get Orders!: " + err);
    throw new Error("Failed To Query RESTapi: " + err);
  }
}

export async function GetOrder(
  initiatorAccount: AccountSliceState,
  id: number,
): Promise<[boolean, Order]> {
  let received: boolean;
  let entry: Order;

  try {
    if (
      initiatorAccount.role === "CUSTOMER" ||
      initiatorAccount.role === "SUPPLIER"
    ) {
      received = false;
      alert("You Do Have Have Permission To View This Entry");
      throw new Error("Initiator's Account Is Not Privileged");
    }

    console.log(`Attempting To Get Order Entry [${id}] ...`);
    const response = await api.get<Order>(apiHost + `/api/orders/${id}`, {
      //withCredentials: true,
    });
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
    alert(`Error: Failed To Get Order Entry [${id}]: ` + err);
    throw new Error("Failed To Query RESTapi: " + err);
  }
}

export async function UpdateOrder(
  id: number,
  initiatorAccount: AccountSliceState,
  newOrder: Order,
): Promise<[boolean, Order]> {
  let success: boolean;

  try {
    if (
      initiatorAccount.role !== "MANAGER" &&
      initiatorAccount.role !== "ADMIN"
    ) {
      success = false;
      alert("You Do Have Have Permission To Update This Entry");
      throw new Error("Initiator's Account Is Not Privileged");
    }
    if (id !== newOrder.id) {
      console.error(
        `Input ID and New Order's ID Do Not Match:\n\tInput: ${id}, Entry: ${newOrder.id}`,
      );
      throw new Error(
        `Input ID and New Order's ID Do Not Match:\n\tInput: ${id}, Entry: ${newOrder.id}`,
      );
    }
    const response = await api.put<Order>(
      apiHost + `/api/orders/${id}`,
      {
        id: newOrder.id,
        customer: newOrder.customer,
        address: newOrder.address,
        time: newOrder.timeOrdered,
        payload: newOrder.payload,
      },
      {
        //withCredentials: true,
      },
    );
    const orderData = response.data;
    console.log("Raw API Response: ", orderData);
    if (response.status !== HttpStatusCode.Accepted) {
      success = false;
      throw new Error(`Unexpected Response Status`);
    }
    success = true;
    return [success, orderData];
  } catch (err) {
    console.error(err);
    alert(`Error: Failed To Update Order Entry [${id}]: ` + err);
    throw new Error("Failed To Query RESTapi: " + err);
  }
}

export async function DeleteOrder(
  initiatorAccount: AccountSliceState,
  id: number,
): Promise<[boolean, number]> {
  let success: boolean;

  try {
    if (
      initiatorAccount.role !== "MANAGER" &&
      initiatorAccount.role !== "ADMIN"
    ) {
      success = false;
      alert("You Do Have Have Permission To Delete This Entry");
      throw new Error("Initiator's Account Is Not Privileged");
    }
    const response = await api.delete<number>(apiHost + `/api/orders/${id}`, {
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
    alert(`Error: Failed To Delete Order Entry [${id}]: ` + err);
    throw new Error("Failed To Query RESTapi: " + err);
  }
}
