// SPDX-License-Identifier: GPL-3.0

import { useAppSelector } from "@/app/hooks";
import type { JwtObject } from "@/app/models";
import { selectJWT } from "@/features/accounts/accountSlice";
import axios, { HttpStatusCode } from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

export const ApiHost: string =
  import.meta.env.VITE_API_URL || "https://localhost:1323";

export const ApiClient = axios.create({
  baseURL: ApiHost,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const DecodeToken = (token: string): JwtObject | null => {
  try {
    return jwtDecode<JwtObject>(token);
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
};

export function InitAPI() {
  const tokenStr = useAppSelector(selectJWT);
  const tokenObject = DecodeToken(tokenStr);
  if (!tokenObject) {
    return console.error("Failed to convert tokenStr to object");
  }
  const currentDate = new Date();
  const currentUnix = Math.floor(currentDate.getTime() / 1000);
  ApiClient.interceptors.request.use((config) => {
    if (tokenObject.exp < currentUnix) {
      const newToken = RefreshJWT(tokenObject.id);
      config.headers.Authorization = `Bearer ${newToken}`;
    } else {
      config.headers.Authorization = `Bearer ${tokenStr}`;
    }
    return config;
  });
}

export async function PingHealth(): Promise<boolean> {
  let active: boolean = false;

  try {
    const response = await axios.get<boolean>(ApiHost + "/health");
    if (response.status !== HttpStatusCode.Ok) {
      throw "Health Check Failed To Pass!";
    }
    active = true;
  } catch (err) {
    console.error("Health check not OK!: " + err);
    return false;
  }

  return active;
}

export async function LogoutApi(id: number): Promise<boolean> {
  let successful: boolean = false;

  try {
    const response = await axios.post<{ ok: boolean }>(
      ApiHost + `/logout`,
      {
        id,
      },
      { withCredentials: true },
    );
    if (response.status !== HttpStatusCode.Accepted) {
      throw "Failed to logout of backend!";
    }
    successful = true;
  } catch (err) {
    console.error("Logout was unsuccessful!: " + err);
    return false;
  }
  return successful;
}

// Authorizes User Credentials With A JWT Response
export async function AuthorizeUser(
  username: string,
  password: string,
): Promise<[boolean, string, JwtObject]> {
  let exists: boolean = false;
  let accessToken: string = "";
  let jwtPayload: JwtObject = {} as JwtObject;

  try {
    const response = await axios.post<{ token: string }>(
      ApiHost + "/login",
      {
        username,
        password,
      },
      {
        withCredentials: true,
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
    //TODO cleanup when cookies are solved
    //token = response.data["token"];
    const cookies = response.headers["set-cookie"];
    console.log("Cookies:", cookies);
    if (!cookies) {
      throw "Cookies not in header";
    }
    let refreshToken = cookies[0];
    if (!refreshToken) {
      throw "Token does not exist";
    }
    exists = true;
    jwtPayload = DecodeToken(refreshToken)!;
    [exists, accessToken] = await RefreshJWT(jwtPayload.id);
    if (!exists) {
      throw "Token was not refreshed";
    }
    jwtPayload = DecodeToken(accessToken)!;
    ApiClient.interceptors.request.use(
      (config) => {
        config.headers.Authorization = `Bearer ${accessToken}`;
        return config;
      },
      (error) => {
        console.error("Request interceptor error: ", error);
        return Promise.reject(error);
      },
    );

    return [exists, accessToken, jwtPayload];
  } catch (err) {
    console.error(err);
    alert(`Error: ${err}`);
    throw new Error("Failed To Query RESTapi: " + err);
  }
}
// TODO Test
export async function RefreshJWT(id: number): Promise<[boolean, string]> {
  let tokenStr = Cookies.get("jwt");
  if (!tokenStr) {
    throw "Token does not exist";
  }
  let exists = false;
  let token = "";
  try {
    const response = await axios.post<{ token: string }>(
      "/refresh",
      { id },
      { withCredentials: true },
    );
    console.log("Raw response: ", response);
    if (response.status !== HttpStatusCode.Accepted) {
      exists = false;
      throw new Error("Response status: Unsuccessful");
    }
    if (response.data === null) {
      exists = false;
      throw new Error("Token does not exist does not exist");
    }
    token = response.data.token;
    exists = true;
    return [exists, token];
  } catch (err) {
    console.error(err);
    alert(`Error: ${err}`);
    throw new Error("Failed To Query RESTapi: " + err);
  }
}
