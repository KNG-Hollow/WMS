// SPDX-License-Identifier: GPL-3.0

import { useAppSelector } from "@/app/hooks";
import { selectAppActive, selectAppUser } from "@/features/appSlice";
import { selectErrorActive } from "@/features/errors/errorSlice";
import { InitAccAPI } from "@/services/accountApi";
import { InitBoxAPI } from "@/services/boxApi";
import { InitInvAPI } from "@/services/inventoryApi";
import { InitItemAPI } from "@/services/itemApi";
import { useEffect } from "react";
import { useNavigate } from "react-router";

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
    <div className="flex flex-1 justify-center items-center">
      <div className="flex flex-col my-20 p-10 items-center gap-y-5 border-3 border-cyan-600 rounded-xl bg-gray-900">
        <div className="flex gap-x-2 text-center text-2xl font-bold text-cyan-600">
          <h2>Welcome Home</h2>
          <h2 className="underline text-cyan-400 font-extrabold">
            {userState.username}
          </h2>
        </div>
        <div className="flex flex-col text-center gap-y-3">
          <h2>Username:</h2>
          <p>{userState.username}</p>
          <h2>JWT:</h2>
          <p className="wrap-break-word w-xl">{userState.jwt}</p>
          <h2>Role:</h2>
          <p>{userState.role}</p>
        </div>
      </div>
    </div>
  );
}
