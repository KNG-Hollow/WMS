// SPDX-License-Identifier: GPL-3.0

import { createContext, ReactNode, useState } from "react";
import { ErrorState, UserState } from "./Models";

export interface GlobalContextType {
  jwToken: string | undefined;
  appActive: boolean | undefined;
  userData: UserState | undefined;
  errorData: ErrorState | undefined;
  insertJWT: (jwt: string) => void;
  resetJWT: () => void;
  activateApp: () => void;
  deactivateApp: () => void;
  insertUser: (user: UserState) => void;
  resetUser: () => void;
  insertError: (error: ErrorState) => void;
  resetError: () => void;
}

export const GlobalContext = createContext<GlobalContextType | null>(null);

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [jwToken, setJWToken] = useState<string>();
  const [appActive, setAppActive] = useState<boolean>();
  const [userData, setUserData] = useState<UserState>();
  const [errorData, setErrorData] = useState<ErrorState>();

  const insertJWT = (jwt: string) => {
    setJWToken(jwt);
  };
  const resetJWT = () => {
    setJWToken("");
  };

  const activateApp = () => {
    setAppActive(true);
  };
  const deactivateApp = () => {
    setAppActive(false);
  };

  const insertUser = (user: UserState) => {
    setUserData(user);
  };
  const resetUser = () => {
    setUserData(undefined);
  };

  const insertError = (error: ErrorState) => {
    setErrorData(error);
  };
  const resetError = () => {
    setErrorData(undefined);
  };

  return (
    <GlobalContext
      value={{
        jwToken,
        appActive,
        userData,
        errorData,
        insertJWT,
        resetJWT,
        activateApp,
        deactivateApp,
        insertUser,
        resetUser,
        insertError,
        resetError,
      }}
    >
      {children}
    </GlobalContext>
  );
};
