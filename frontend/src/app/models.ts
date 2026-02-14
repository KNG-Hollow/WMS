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

export interface Item {
  id: number;
  upc: string;
  name: string;
  description: string;
  weight: number;
  image: ImageInfo;
}

export interface ImageInfo {
  name: string;
  data: Blob;
  valid: boolean;
}

export interface Box {
  id: number;
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
  id: number;
  item: Item;
  total: number;
  locations: LocationData[];
}

export interface LocationData {
  area: string;
  count: number;
}

export interface Order {
  id: number;
  customer: Account;
  address: string;
  time: Date;
  payload: ItemGroup[];
}

export interface Shipment {
  id: number;
  supplier: Account;
  distributor: string;
  eta: Date;
  payload: ItemGroup[];
}

export interface ItemGroup {
  item: Item;
  count: number;
}
