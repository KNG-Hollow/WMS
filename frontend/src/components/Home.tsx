// SPDX-License-Identifier: GPL-3.0

import { useEffect } from "react";
import { useAppSelector } from "../app/hooks";
import { selectAppActive } from "../features/appSlice";
import { selectUser } from "../features/appSlice";
import { selectErrorActive } from "../features/errors/errorSlice";
import { useNavigate } from "react-router";

export default function Home() {
  const appActive = useAppSelector(selectAppActive);
  const userState = useAppSelector(selectUser);
  const errorState = useAppSelector(selectErrorActive);
  const navigate = useNavigate();

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
      <div className="mt-20 items-center flex gap-x-2 justify-center mb-10 text-2xl font-bold">
        <h2>Welcome Home</h2>
        <h2 className="underline">{userState.username}</h2>
      </div>
      <div className="mb-20 w-11/12 space-y-3 border-3 px-10 rounded-xl py-10 bg-gray-950 flex h-full flex-col items-center">
        <h2>Username:</h2>
        <p>{userState.username}</p>
        <h2>JWT:</h2>
        <p className="w-11/12 wrap-break-word">{userState.jwt}</p>
        <h2>Role:</h2>
        <p>{userState.role}</p>
      </div>
    </div>
  );
}
