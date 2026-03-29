// SPDX-License-Identifier: GPL-3.0

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  deactivateApp,
  resetAppUser,
  selectAppActive,
} from "@/features/appSlice";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

export default function Logout() {
  const dispatch = useAppDispatch();
  const appActive = useAppSelector(selectAppActive);
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!appActive) {
      navigate("/login");
    }

    const handleLogout = () => {
      dispatch(resetAppUser());
      dispatch(deactivateApp());
      window.location.reload();
    };

    const timeoutId = setTimeout(handleLogout, 5000);
    const intervalId = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [navigate, appActive, dispatch]);
  return (
    <div className="flex flex-1 justify-center items-center">
      <div
        id="logout-container"
        className="justify-center items-center h-1/2 w-1/2 space-y-10 border-2 rounded-xl border-white bg-gray-900 flex flex-col"
      >
        {countdown > 0 ? (
          <>
            <div id="logout-message" className="">
              <p>You are being logged out in...</p>
            </div>
            <div className="self-center bg-white w-18 h-18 rounded-full">
              <p className=" font-bold translate-y-6 text-center text-red-600">
                {countdown}
              </p>
            </div>
          </>
        ) : (
          <div id="logout-info">
            <p>Redirecting To Login Page...</p>
          </div>
        )}
      </div>
    </div>
  );
}
