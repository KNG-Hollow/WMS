// SPDX-License-Identifier: GPL-3.0

import axios, { HttpStatusCode } from "axios";
import { jwtDecode } from "jwt-decode";
import type { JwtObject } from "../app/models";

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

const decodeToken = (token: string): JwtObject | null => {
  try {
    return jwtDecode<JwtObject>(token);
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
};

export async function PingHealth(): Promise<boolean> {
  let active: boolean = false;

  try {
    const response = await axios.get<boolean>(apiHost + "/health");
    if (response.status !== HttpStatusCode.Ok) {
      throw "Health Check Failed To Pass!";
      return false;
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
