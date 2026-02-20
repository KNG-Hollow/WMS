// SPDX-License-Identifier: GPL-3.0

import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../app/createAppSlice";

export type ErrorSliceState = {
  errorActive: boolean;
  header: string;
  message: string;
};

const initialState: ErrorSliceState = {
  errorActive: false,
  header: "",
  message: "",
};

// TODO Fill Values
// If you are not using async thunks you can use the standalone `createSlice`.
export const errorSlice = createAppSlice({
  name: "error",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: (create) => ({
    activateError: create.reducer((state) => {
      state.errorActive = true;
    }),
    deactivateError: create.reducer((state) => {
      state.errorActive = false;
    }),
    insertHeader: create.reducer((state, action: PayloadAction<string>) => {
      state.header = action.payload;
    }),
    resetHeader: create.reducer((state) => {
      state.header = "";
    }),
    insertMessage: create.reducer((state, action: PayloadAction<string>) => {
      state.message = action.payload;
    }),
    resetMessage: create.reducer((state) => {
      state.message = "";
    }),
    insertError: create.reducer(
      (state, action: PayloadAction<[string, string, boolean]>) => {
        [state.header, state.message, state.errorActive] = action.payload;
      },
    ),
  }),
  // You can define your selectors here. These selectors receive the slice
  // state as their first argument.
  selectors: {
    selectError: (error: ErrorSliceState) => error,
    selectErrorActive: (error: ErrorSliceState) => error.errorActive,
    selectHeader: (error: ErrorSliceState) => error.header,
    selectMessage: (error: ErrorSliceState) => error.message,
  },
});

// Action creators are generated for each case reducer function.
export const {
  activateError,
  deactivateError,
  insertHeader,
  resetHeader,
  insertMessage,
  resetMessage,
  insertError,
} = errorSlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const { selectError, selectErrorActive, selectHeader, selectMessage } =
  errorSlice.selectors;
