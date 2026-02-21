// SPDX-License-Identifier: GPL-3.0

import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  deactivateApp,
  resetAppUser,
  selectAppActive,
} from "../../features/appSlice";
import { useEffect, useState } from "react";

export default function Logout() {
  const dispatch = useAppDispatch();
  const appActive = useAppSelector(selectAppActive);
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  const redirectText = () => {
    if (countdown === 0) {
      return <p>Redirecting to login page...</p>;
    }
  };
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
    <div className="py-20 flex justify-center">
      {/*
        <div className="mt-20 text-cyan-500 mb-10 flex justify-center self-center text-2xl font-bold">
          <h2>Logging Out</h2>
        </div>
      */}
      <div className="mt-10 flex flex-col items-center text-xl">
        <div
          id="logout-container"
          className="justify-center space-y-3 border-3 px-20 rounded-xl border-cyan-600 py-10 bg-gray-900 flex h-full flex-col items-center"
        >
          <div id="logout-header" className="mt-5 flex flex-col justify-center">
            <p>You are being logged out in...</p>
            <div className="mt-10 self-center bg-white w-18 h-18 rounded-full">
              <p className=" font-extrabold translate-y-5 text-center text-red-600">
                {countdown}
              </p>
            </div>
          </div>
          <div id="logout-info">{redirectText()}</div>
        </div>
      </div>
    </div>
  );
}
