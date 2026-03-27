// SPDX-License-Identifier: GPL-3.0

import { ReactNode, useEffect, useState } from "react";
import { PingHealth } from "./ApiServices";
import { ErrorState, ScannedCode, UserState } from "./Models";
import { GlobalContext } from "./Contexts";

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [jwToken, setJWToken] = useState<string>();
  const [appActive, setAppActive] = useState<boolean>();
  const [userData, setUserData] = useState<UserState>();
  const [errorData, setErrorData] = useState<ErrorState>();
  const [scannedCode, setScannedCode] = useState<ScannedCode>();
  const [APIActive, setAPIActive] = useState<boolean>(true);

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

  const insertScan = (code: ScannedCode) => {
    setScannedCode(code);
  };
  const resetScan = () => {
    setScannedCode(undefined);
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      setAPIActive(await PingHealth());
    }, 60000);

    return () => clearInterval(interval);
  });

  return (
    <GlobalContext
      value={{
        jwToken,
        appActive,
        userData,
        errorData,
        scannedCode,
        APIActive,
        insertJWT,
        resetJWT,
        activateApp,
        deactivateApp,
        insertUser,
        resetUser,
        insertError,
        resetError,
        insertScan,
        resetScan,
      }}
    >
      {children}
    </GlobalContext>
  );
};
