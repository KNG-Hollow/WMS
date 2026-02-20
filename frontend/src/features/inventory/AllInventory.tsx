// SPDX-License-Identifier: GPL-3.0

import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAppSelector } from "../../app/hooks";
import { selectAppActive } from "../appSlice";
import { selectErrorActive } from "../errors/errorSlice";

export default function AllInventory() {
  const appActive = useAppSelector(selectAppActive);
  const errorActive = useAppSelector(selectErrorActive);
  const navigate = useNavigate();

  useEffect(() => {
    if (!appActive) {
      navigate("/login");
    }
    if (errorActive) {
      navigate("/error");
    }
  });

  return (
    <div className="pt-20 flex justify-center-safe">
      <div className="flex flex-col p-20 border-3 bg-gray-900 border-cyan-600 w-11/12 gap-y-3">
        <div className="text-cyan-500 text-center font-extrabold">
          <h1>Inventory</h1>
        </div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
}
