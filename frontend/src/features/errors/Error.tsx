// SPDX-License-Identifier: GPL-3.0

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { selectAppActive } from "../appSlice";
import {
  insertError,
  selectErrorActive,
  selectHeader,
  selectMessage,
} from "./errorSlice";

export default function Error() {
  const errTitle = useAppSelector(selectHeader);
  const errMessage = useAppSelector(selectMessage);
  const appActive = useAppSelector(selectAppActive);
  const errActive = useAppSelector(selectErrorActive);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!appActive) {
      navigate("/login");
    }
    if (!errActive) {
      dispatch(
        insertError([
          "Unknown Error",
          "You have been sent to the error screen without having an error active. Please refresh the application!",
          true,
        ]),
      );
    }
  }, [appActive, dispatch, errActive, navigate]);

  return (
    <div className="flex flex-1 flex-col justify-center items-center w-svw h-svh">
      <div
        id="error-container"
        className="border-2 text-center items-center border-red-600 p-10 bg-gray-900 gap-y-15 rounded flex-col flex"
      >
        <div id="error-header" className="">
          <h2 className="text-red-600 underline text-xl font-bold">ERROR</h2>
        </div>
        <div className="space-y-3">
          <h2>Title:</h2>
          <h4
            id="error-title"
            className="text-red-700 wrap-break-word font-bold w-xl"
          >
            {errTitle}
          </h4>
        </div>
        <div className="space-y-3">
          <h2>Message:</h2>
          <p id="error-message" className="text-red-600 wrap-break-word w-xl">
            {errMessage}
          </p>
        </div>
        <div id="error-button" className="">
          <button onClick={() => window.location.reload()}>Refresh</button>
        </div>
      </div>
    </div>
  );
}
