// SPDX-License-Identifier: GPL-3.0

import type { JwtPayload } from "jwt-decode";

export interface JwtResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  token_type: string;
}

export interface JwtObject extends JwtPayload {
  exp: number;
  id: number;
  username: string;
  role: Role;
  orig_iat: number;
}

export interface Account {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  role: Role;
  active: boolean;
  created: Date;
}

export interface Role {
  ADMIN: string;
  MANAGER: string;
  EMPLOYEE: string;
  SUPPLIER: string;
  CUSTOMER: string;
  Value: string;
}

// TODO ITEM
// TODO BOX
// TODO SHIPMENT
// TODO INVENTORY
// TODO IMAGEDATA
