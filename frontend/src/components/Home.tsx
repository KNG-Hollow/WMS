// SPDX-License-Identifier: GPL-3.0

import { useEffect } from "react";
import { useAppSelector } from "../app/hooks";
import { selectAppActive } from "../features/appSlice";
import { selectAppUser } from "../features/appSlice";
import { selectErrorActive } from "../features/errors/errorSlice";
import { useNavigate } from "react-router";
import { InitInvAPI } from "../services/inventoryApi";
import { InitAccAPI } from "../services/accountApi";
import { InitItemAPI } from "../services/itemApi";
import { InitBoxAPI } from "../services/boxApi";

export default function Home() {
  const appActive = useAppSelector(selectAppActive);
  const userState = useAppSelector(selectAppUser);
  const errorState = useAppSelector(selectErrorActive);
  const navigate = useNavigate();

  InitAccAPI();
  InitInvAPI();
  InitItemAPI();
  InitBoxAPI();

  useEffect(() => {
    if (!appActive || !userState.userActive) {
      navigate("/login");
    }
    if (errorState) {
      navigate("/error");
    }
  }, [appActive, userState, errorState, navigate]);

  return (
    <div className="flex w-full items-center flex-1 flex-col">
      <div className="my-20 w-11/12 space-y-3 border-3 border-cyan-600 p-10 rounded-xl bg-gray-900 items-center">
        <div className="flex gap-x-2 justify-center mb-10 text-2xl font-bold text-cyan-600">
          <h2>Welcome Home</h2>
          <h2 className="underline text-cyan-400 font-extrabold">
            {userState.username}
          </h2>
        </div>
        <div className="flex flex-col items-center gap-y-3">
          <h2>Username:</h2>
          <p>{userState.username}</p>
          <h2>JWT:</h2>
          <p className="w-11/12 wrap-break-word">{userState.jwt}</p>
          <h2>Role:</h2>
          <p>{userState.role}</p>
        </div>
      </div>
    </div>
  );
}
