// SPDX-License-Identifier: GPL-3.0

import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../app/createAppSlice";

export type AccountSliceState = {
  jwt: string;
  username: string;
  role: string;
  userActive: boolean;
};

const initialState: AccountSliceState = {
  jwt: "",
  username: "",
  role: "",
  userActive: false,
};

// TODO Fill in values
// If you are not using async thunks you can use the standalone `createSlice`.
export const accountSlice = createAppSlice({
  name: "account",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: (create) => ({
    insertJWT: create.reducer((state, action: PayloadAction<string>) => {
      state.jwt = action.payload;
    }),
    resetJWT: create.reducer((state) => {
      state.jwt = "";
    }),
    insertUsername: create.reducer((state, action: PayloadAction<string>) => {
      state.username = action.payload;
    }),
    resetUsername: create.reducer((state) => {
      state.username = "";
    }),
    insertRole: create.reducer((state, action: PayloadAction<string>) => {
      state.role = action.payload;
    }),
    resetRole: create.reducer((state) => {
      state.role = "";
    }),
    activateUser: create.reducer((state) => {
      state.userActive = true;
    }),
    deactivateUser: create.reducer((state) => {
      state.userActive = false;
    }),
  }),
  // You can define your selectors here. These selectors receive the slice
  // state as their first argument.
  selectors: {
    selectJWT: (account: AccountSliceState) => account.jwt,
    selectUsername: (account: AccountSliceState) => account.username,
    selectRole: (account: AccountSliceState) => account.role,
    selectUserActive: (account: AccountSliceState) => account.userActive,
  },
});

// Action creators are generated for each case reducer function.
export const {
  insertUsername,
  resetUsername,
  insertJWT,
  resetJWT,
  insertRole,
  resetRole,
  activateUser,
  deactivateUser,
} = accountSlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const { selectJWT, selectUsername, selectRole, selectUserActive } =
  accountSlice.selectors;
