// SPDX-License-Identifier: GPL-3.0

import { createContext } from "react";
import { ErrorState, ScannedCode, UserState } from "./Models";

export interface GlobalContextType {
  jwToken: string | undefined;
  appActive: boolean | undefined;
  userData: UserState | undefined;
  errorData: ErrorState | undefined;
  scannedCode: ScannedCode | undefined;
  APIActive: boolean;
  insertJWT: (jwt: string) => void;
  resetJWT: () => void;
  activateApp: () => void;
  deactivateApp: () => void;
  insertUser: (user: UserState) => void;
  resetUser: () => void;
  insertError: (error: ErrorState) => void;
  resetError: () => void;
  insertScan: (code: ScannedCode) => void;
  resetScan: () => void;
}

export const GlobalContext = createContext<GlobalContextType | null>(null);
