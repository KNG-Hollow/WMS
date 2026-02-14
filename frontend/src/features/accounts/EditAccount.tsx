// SPDX-License-Identifier: GPL-3.0

import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAppSelector } from "../../app/hooks";
import { selectAppActive } from "../appSlice";
import { selectErrorActive } from "../errors/errorSlice";

export default function EditAccount() {
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
    <div className="text-amber-400 mt-20">
      <h2>Edit Account Routing Works!</h2>
    </div>
  );
}
