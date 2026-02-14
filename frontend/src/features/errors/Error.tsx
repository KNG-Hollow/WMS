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
      <div id="error-header">
        <h2 className="text-red-600 mt-10 text-xl font-extrabold">ERROR</h2>
      </div>
      <div
        id="error-container"
        className="border-2 w-11/12 py-10 gap-y-15 rounded flex-col flex mt-15"
      >
        <div>
          <h2>Title:</h2>
          <h4 id="error-title" className="text-red-700">
            {errTitle}
          </h4>
        </div>
        <div className="">
          <h2>Message:</h2>
          <p id="error-message" className="text-red-600">
            {errMessage}
          </p>
        </div>
      </div>
      <div id="error-button" className="mt-20">
        <button onClick={() => window.location.reload()}>Refresh</button>
      </div>
    </div>
  );
}
