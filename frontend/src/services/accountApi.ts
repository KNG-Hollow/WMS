// SPDX-License-Identifier: GPL-3.0

import axios, { HttpStatusCode } from "axios";
import type { Account, Role } from "../app/models";
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

export function InitAPI() {
  const token = useAppSelector(selectJWT);
  api.interceptors.request.use((config) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
}

export async function CreateAccount(
  initiatorAccount: AccountSliceState,
  id: number | null,
  firstname: string,
  lastname: string,
  email: string,
  phone: string,
  username: string,
  password: string,
  role: Role,
): Promise<[boolean, Account]> {
  let successful: boolean;
  const timestamp = new Date().toISOString();
  const newAccount: Account = {
    id: id,
    firstname: firstname,
    lastname: lastname,
    email: email,
    phone: phone,
    username: username,
    password: password,
    role: role,
    active: true,
    created: timestamp,
  };

  try {
    if (initiatorAccount.role !== "ADMIN") {
      successful = false;
      alert("You Do Have Have Permission To Create An Account");
      throw new Error("Initiator's Account Is Not Privileged");
    }
    const response = await api.post<Account>(
      apiHost + "/api/accounts",
      {
        id: newAccount.id,
        firstname: newAccount.firstname,
        lastname: newAccount.lastname,
        email: newAccount.email,
        phone: newAccount.phone,
        username: newAccount.username,
        password: newAccount.password,
        role: newAccount.role.Value,
        active: newAccount.active,
        created: newAccount.created,
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
    alert(`Error: Failed To Create Account: ${err}`);
    throw new Error("Failed To Query RESTapi: " + err);
  }
}

export async function GetAccounts(
  initiatorAccount: AccountSliceState,
): Promise<[boolean, Account[]]> {
  let received: boolean;
  let accounts: Account[];

  try {
    if (initiatorAccount.role !== "ADMIN") {
      received = false;
      alert("You Do Have Have Permission To View All Accounts");
      throw new Error("Initiator's Account Is Not Privileged");
    }
    const response = await api.get<Account[]>(apiHost + "/api/accounts", {
      //withCredentials: true,
    });
    const data = response.data;
    console.log("Raw API Response: ", data);
    if (response.status !== HttpStatusCode.Ok) {
      received = false;
      throw new Error("Response Status: NOT 'Ok'");
    }
    received = true;
    accounts = data;
    return [received, accounts];
  } catch (err) {
    console.error(err);
    alert("Error: Failed To Get Accounts!: " + err);
    throw new Error("Failed To Query RESTapi: " + err);
  }
}

export async function GetAccount(
  initiatorAccount: AccountSliceState,
  id: number,
): Promise<[boolean, Account]> {
  let received: boolean;
  let account: Account;

  try {
    if (initiatorAccount.id !== id && initiatorAccount.role !== "ADMIN") {
      received = false;
      alert("You Do Have Have Permission To View This Account");
      throw new Error("Initiator's Account Is Not Privileged");
    }

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

export async function UpdateAccount(
  id: number,
  initiatorAccount: AccountSliceState,
  newAccount: Account,
): Promise<[boolean, Account]> {
  let success: boolean;

  try {
    if (initiatorAccount.id !== id && initiatorAccount.role !== "ADMIN") {
      success = false;
      alert("You Do Have Have Permission To Update This Account");
      throw new Error("Initiator's Account Is Not Privileged");
    }
    if (id !== newAccount.id && initiatorAccount.role !== "ADMIN") {
      console.error(
        `Input ID and New Account's ID Do Not Match:\n\tInput: ${id}, Account: ${newAccount.id}`,
      );
      throw new Error(
        `Input ID and New Account's ID Do Not Match:\n\tInput: ${id}, Account: ${newAccount.id}`,
      );
    }
    const response = await api.put<Account>(
      apiHost + `/api/accounts/${id}`,
      {
        id: newAccount.id,
        firstname: newAccount.firstname,
        lastname: newAccount.lastname,
        email: newAccount.email,
        phone: newAccount.phone,
        username: newAccount.username,
        password: newAccount.password,
        role: newAccount.role,
        active: newAccount.active,
        created: newAccount.created,
      },
      {
        //withCredentials: true,
      },
    );
    const accountData = response.data;
    console.log("Raw API Response: ", accountData);
    if (response.status !== HttpStatusCode.Accepted) {
      success = false;
      throw new Error(`Unexpected Response Status`);
    }
    success = true;
    return [success, accountData];
  } catch (err) {
    console.error(err);
    alert(`Error: Failed To Update Account [${id}]: ` + err);
    throw new Error("Failed To Query RESTapi: " + err);
  }
}

export async function DeleteAccount(
  initiatorAccount: AccountSliceState,
  id: number,
): Promise<[boolean, number]> {
  let success: boolean;

  try {
    if (initiatorAccount.id !== id && initiatorAccount.role !== "ADMIN") {
      success = false;
      alert("You Do Have Have Permission To Update This Account");
      throw new Error("Initiator's Account Is Not Privileged");
    }
    const response = await api.delete<number>(apiHost + `/api/accounts/${id}`, {
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
    alert(`Error: Failed To Delete Account [${id}]: ` + err);
    throw new Error("Failed To Query RESTapi: " + err);
  }
}
