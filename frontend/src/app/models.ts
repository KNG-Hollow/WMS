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
  id: number | null;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  role: Role;
  active: boolean;
  created: Date | string;
}

export interface Role {
  ADMIN: string;
  MANAGER: string;
  EMPLOYEE: string;
  SUPPLIER: string;
  CUSTOMER: string;
  Value: string;
}

export interface Item {
  id: number | null;
  upc: string;
  name: string;
  description: string;
  weight: number;
  image: ImageInfo;
}

export interface ImageInfo {
  name: string;
  data: string;
  valid: boolean;
}

export interface Box {
  id: number | null;
  upc: string;
  item: Item;
  dimensions: string;
  count: number;
}

export interface Dimensions {
  length: number;
  width: number;
  height: number;
}

export interface Inventory {
  id: number | null;
  item: Item;
  total: number;
  locations: LocationData[];
}

export interface LocationData {
  area: string;
  count: number;
}

export interface Order {
  id: number | null;
  customer: Account;
  address: string;
  time: Date | string;
  payload: ItemGroup[];
}

export interface Shipment {
  id: number | null;
  supplier: Account;
  distributor: string;
  eta: Date | string;
  payload: ItemGroup[];
}

export interface ItemGroup {
  item: Item;
  count: number;
}
