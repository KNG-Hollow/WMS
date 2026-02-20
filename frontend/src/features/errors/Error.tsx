// SPDX-License-Identifier: GPL-3.0

import { useEffect } from "react";
import { useAppSelector } from "../../app/hooks";
import { selectHeader, selectMessage } from "./errorSlice";
import { selectAppActive } from "../appSlice";
import { useNavigate } from "react-router";

export default function Error() {
  const errTitle = useAppSelector(selectHeader);
  const errMessage = useAppSelector(selectMessage);
  const appActive = useAppSelector(selectAppActive);
  const navigate = useNavigate();

  useEffect(() => {
    if (!appActive) {
      navigate("/login");
    }
  }, [appActive, navigate]);

  return (
    <div className="text-center flex flex-col items-center">
      <div id="error-header" className="mt-20">
        <h2 className="text-red-600 underline text-xl font-extrabold">ERROR</h2>
      </div>
      <div
        id="error-container"
        className="border-2 items-center border-red-600 w-11/12 bg-gray-900 py-10 gap-y-15 rounded flex-col flex mt-15"
      >
        <div className="space-y-3">
          <h2>Title:</h2>
          <h4
            id="error-title"
            className="text-red-700 wrap-break-word font-bold text-lg w-2xl"
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
      </div>
      <div id="error-button" className="mt-15 mb-15">
        <button onClick={() => window.location.reload()}>Refresh</button>
      </div>
    </div>
  );
}
