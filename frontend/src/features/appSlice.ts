// SPDX-License-Identifier: GPL-3.0

import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../app/createAppSlice";
import { accountSlice, type AccountSliceState } from "./accounts/accountSlice";
import { errorSlice, type ErrorSliceState } from "./errors/errorSlice";

export type AppSliceState = {
  user: AccountSliceState;
  errorState: ErrorSliceState;
  appActive: boolean;
};

const initialState: AppSliceState = {
  user: accountSlice.getInitialState(),
  errorState: errorSlice.getInitialState(),
  appActive: false,
};

// If you are not using async thunks you can use the standalone `createSlice`.
export const appSlice = createAppSlice({
  name: "app",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: (create) => ({
    insertUser: create.reducer(
      (state, action: PayloadAction<AccountSliceState>) => {
        state.user = action.payload;
      },
    ),
    resetUser: create.reducer((state) => {
      state.user = {
        jwt: "",
        role: "",
        userActive: false,
      };
    }),
    insertErrorState: create.reducer(
      (state, action: PayloadAction<ErrorSliceState>) => {
        state.errorState = action.payload;
      },
    ),
    resetErrorState: create.reducer((state) => {
      state.errorState = {
        errorActive: false,
        header: "",
        message: "",
      };
    }),
    activateApp: create.reducer((state) => {
      state.appActive = true;
    }),
    deactivateApp: create.reducer((state) => {
      state.appActive = false;
    }),
    ...accountSlice.reducer,
    ...errorSlice.reducer,
  }),
  // You can define your selectors here. These selectors receive the slice
  // state as their first argument.
  selectors: {
    selectUser: (app: AppSliceState) => app.user,
    selectErrorState: (app: AppSliceState) => app.errorState,
    selectAppActive: (app: AppSliceState) => app.appActive,
  },
});

// Action creators are generated for each case reducer function.
export const {
  insertUser,
  resetUser,
  insertErrorState,
  resetErrorState,
  activateApp,
  deactivateApp,
} = appSlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const { selectUser, selectErrorState, selectAppActive } =
  appSlice.selectors;
