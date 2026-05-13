// SPDX-License-Identifier: GPL-3.0

import { useAppSelector } from "@/app/hooks";
import type { ItemGroup, Shipment } from "@/app/models";
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

export function InitShipmentAPI() {
  const token = useAppSelector(selectJWT);
  api.interceptors.request.use((config) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
}

export async function CreateShipment(
  initiatorAccount: AccountSliceState,
  id: number | null,
  supplier: string,
  payload: ItemGroup[],
): Promise<[boolean, Shipment]> {
  let successful: boolean;
  const timestamp = new Date().toISOString();
  const newShipment: Shipment = {
    id: id,
    supplier: supplier,
    eta: timestamp,
    payload: payload,
  };

  try {
    if (
      initiatorAccount.role !== "ADMIN" &&
      initiatorAccount.role !== "MANAGER"
    ) {
      successful = false;
      alert("You Do Have Have Permission To Create A Shipment");
      throw new Error("Initiator's Account Is Not Privileged");
    }
    const response = await api.post<Shipment>(
      apiHost + "/api/shipments",
      {
        id: newShipment.id,
        supplier: newShipment.supplier,
        eta: newShipment.eta,
        payload: newShipment.payload,
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
    alert(`Error: Failed To Create Shipment: ${err}`);
    throw new Error("Failed To Query RESTapi: " + err);
  }
}

export async function GetShipments(
  initiatorAccount: AccountSliceState,
): Promise<[boolean, Shipment[]]> {
  let received: boolean;
  let shipments: Shipment[];

  try {
    if (initiatorAccount.role === "CUSTOMER") {
      received = false;
      alert("You Do Have Have Permission To View All Shipments");
      throw new Error("Initiator's Account Is Not Privileged");
    }
    const response = await api.get<Shipment[]>(apiHost + "/api/shipments", {
      //withCredentials: true,
    });
    const data = response.data;
    console.log("Raw API Response: ", data);
    if (response.status !== HttpStatusCode.Ok) {
      received = false;
      throw new Error("Response Status: NOT 'Ok'");
    }
    received = true;
    shipments = data;
    return [received, shipments];
  } catch (err) {
    console.error(err);
    alert("Error: Failed To Get Shipments!: " + err);
    throw new Error("Failed To Query RESTapi: " + err);
  }
}

export async function GetShipment(
  initiatorAccount: AccountSliceState,
  id: number,
): Promise<[boolean, Shipment]> {
  let received: boolean;
  let shipment: Shipment;

  try {
    if (
      initiatorAccount.role === "SUPPLIER" ||
      initiatorAccount.role === "CUSTOMER"
    ) {
      received = false;
      alert("You Do Have Have Permission To View This Shipment");
      throw new Error("Initiator's Account Is Not Privileged");
    }

    console.log(`Attempting To Get Shipment [${id}] ...`);
    const response = await api.get<Shipment>(apiHost + `/api/shipment/${id}`, {
      //withCredentials: true,
    });
    const data = response.data;
    console.log("Raw API Response: ", data);
    if (response.status !== HttpStatusCode.Ok) {
      received = false;
      throw new Error("Response Status: NOT 'OK'");
    }
    received = true;
    shipment = data;
    return [received, shipment];
  } catch (err) {
    console.error(err);
    alert(`Error: Failed To Get Shipment [${id}]: ` + err);
    throw new Error("Failed To Query RESTapi: " + err);
  }
}

export async function UpdateShipment(
  id: number,
  initiatorAccount: AccountSliceState,
  newShipment: Shipment,
): Promise<[boolean, Shipment]> {
  let success: boolean;

  try {
    if (
      initiatorAccount.role !== "MANAGER" &&
      initiatorAccount.role !== "ADMIN"
    ) {
      success = false;
      alert("You Do Have Have Permission To Update This Shipment");
      throw new Error("Initiator's Account Is Not Privileged");
    }
    if (id !== newShipment.id) {
      console.error(
        `Input ID and New Shipment's ID Do Not Match:\n\tInput: ${id}, Shipment: ${newShipment.id}`,
      );
      throw new Error(
        `Input ID and New Shipment's ID Do Not Match:\n\tInput: ${id}, Shipment: ${newShipment.id}`,
      );
    }
    const response = await api.put<Shipment>(
      apiHost + `/api/shipments/${id}`,
      {
        id: newShipment.id,
        supplier: newShipment.supplier,
        eta: newShipment.eta,
        payload: newShipment.payload,
      },
      {
        //withCredentials: true,
      },
    );
    const shipmentData = response.data;
    console.log("Raw API Response: ", shipmentData);
    if (response.status !== HttpStatusCode.Accepted) {
      success = false;
      throw new Error(`Unexpected Response Status`);
    }
    success = true;
    return [success, shipmentData];
  } catch (err) {
    console.error(err);
    alert(`Error: Failed To Update Shipment [${id}]: ` + err);
    throw new Error("Failed To Query RESTapi: " + err);
  }
}

export async function DeleteShipment(
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
      alert("You Do Have Have Permission To Delete This Shipment");
      throw new Error("Initiator's Account Is Not Privileged");
    }
    const response = await api.delete<number>(
      apiHost + `/api/shipments/${id}`,
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
    alert(`Error: Failed To Delete Shipment [${id}]: ` + err);
    throw new Error("Failed To Query RESTapi: " + err);
  }
}
