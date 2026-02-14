// SPDX-License-Identifier: GPL-3.0

import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAppSelector } from "../../app/hooks";
import { selectAppActive } from "../appSlice";
import { selectErrorActive } from "../errors/errorSlice";

export default function Account() {
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
    <div>
      <h2 className="pt-20 text-center font-extrabold text-amber-600">
        View Account Routing Works!
      </h2>
    </div>
  );
}
