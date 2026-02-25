// SPDX-License-Identifier: GPL-3.0

import axios, { HttpStatusCode } from "axios";
import type { Box, Dimensions, Item } from "../app/models";
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

export function ConvertDimensions(dims: Dimensions): string {
  return `${dims.length}x${dims.width}x${dims.height}`;
}

export function InitBoxAPI() {
  const token = useAppSelector(selectJWT);
  api.interceptors.request.use((config) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
}

export async function CreateBox(
  initiatorAccount: AccountSliceState,
  id: number | null,
  upc: string,
  item: Item,
  dimensions: Dimensions,
  count: number,
): Promise<[boolean, Box]> {
  let successful: boolean;
  const newBox: Box = {
    id: id,
    upc: upc,
    item: item,
    dimensions: ConvertDimensions(dimensions),
    count: count,
  };

  try {
    if (
      initiatorAccount.role !== "ADMIN" &&
      initiatorAccount.role !== "MANAGER"
    ) {
      successful = false;
      alert("You Do Have Have Permission To Create Box Entries");
      throw new Error("Initiator's Account Is Not Privileged");
    }
    const response = await api.post<Box>(
      apiHost + "/api/boxes",
      {
        id: newBox.id,
        upc: newBox.upc,
        item: newBox.item,
        dimensions: newBox.dimensions,
        count: newBox.count,
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
    alert(`Error: Failed To Create Box: ${err}`);
    throw new Error("Failed To Query RESTapi: " + err);
  }
}

export async function GetAllBoxes(
  initiatorAccount: AccountSliceState,
): Promise<[boolean, Box[]]> {
  let received: boolean;
  let allBoxes: Box[];

  try {
    if (!initiatorAccount.userActive) {
      received = false;
      alert("User Account Is Not Active!");
      throw new Error("Initiator's Account Is Not Privileged");
    }
    const response = await api.get<Box[]>(apiHost + "/api/boxes", {
      //withCredentials: true,
    });
    const data = response.data;
    console.log("Raw API Response: ", data);
    if (response.status !== HttpStatusCode.Ok) {
      received = false;
      throw new Error("Response Status: NOT 'Ok'");
    }
    received = true;
    allBoxes = data;
    return [received, allBoxes];
  } catch (err) {
    console.error(err);
    alert("Error: Failed To Get Boxes!: " + err);
    throw new Error("Failed To Query RESTapi: " + err);
  }
}

export async function GetBox(
  initiatorAccount: AccountSliceState,
  id: number,
): Promise<[boolean, Box]> {
  let received: boolean;
  let entry: Box;

  try {
    if (
      initiatorAccount.role !== "ADMIN" &&
      initiatorAccount.role !== "MANAGER"
    ) {
      received = false;
      alert("You Do Have Have Permission To View This Entry");
      throw new Error("Initiator's Account Is Not Privileged");
    }

    console.log(`Attempting To Get Box Entry [${id}] ...`);
    const response = await api.get<Box>(apiHost + `/api/boxes/${id}`, {
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
    alert(`Error: Failed To Get Box Entry [${id}]: ` + err);
    throw new Error("Failed To Query RESTapi: " + err);
  }
}

export async function UpdateBox(
  id: number,
  initiatorAccount: AccountSliceState,
  newBox: Box,
): Promise<[boolean, Box]> {
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
    if (id !== newBox.id) {
      console.error(
        `Input ID and New Box's ID Do Not Match:\n\tInput: ${id}, Entry: ${newBox.id}`,
      );
      throw new Error(
        `Input ID and New Box's ID Do Not Match:\n\tInput: ${id}, Entry: ${newBox.id}`,
      );
    }
    const response = await api.put<Box>(
      apiHost + `/api/boxes/${id}`,
      {
        id: newBox.id,
        upc: newBox.upc,
        item: newBox.item,
        dimensions: newBox.dimensions,
        count: newBox.count,
      },
      {
        //withCredentials: true,
      },
    );
    const boxData = response.data;
    console.log("Raw API Response: ", boxData);
    if (response.status !== HttpStatusCode.Accepted) {
      success = false;
      throw new Error(`Unexpected Response Status`);
    }
    success = true;
    return [success, boxData];
  } catch (err) {
    console.error(err);
    alert(`Error: Failed To Update Box Entry [${id}]: ` + err);
    throw new Error("Failed To Query RESTapi: " + err);
  }
}

export async function DeleteBox(
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
    const response = await api.delete<number>(apiHost + `/api/boxes/${id}`, {
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
    alert(`Error: Failed To Delete Box Entry [${id}]: ` + err);
    throw new Error("Failed To Query RESTapi: " + err);
  }
}
