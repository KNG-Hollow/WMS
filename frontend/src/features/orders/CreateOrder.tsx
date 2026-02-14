// SPDX-License-Identifier: GPL-3.0

import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAppSelector } from "../../app/hooks";
import { selectAppActive } from "../appSlice";
import { selectErrorActive } from "../errors/errorSlice";

export default function CreateOrder() {
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
    <div className="text-amber-600 font-extrabold text-center pt-20">
      <h2>Create Order Routing Works!</h2>
    </div>
  );
}
