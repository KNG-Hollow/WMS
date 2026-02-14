// SPDX-License-Identifier: GPL-3.0

import { useEffect, useState } from "react";
import { useAppSelector } from "../../app/hooks";
import { selectAppActive, selectUser } from "../../features/appSlice";
import { PingHealth } from "../../services/utilityApi";
import { Link } from "react-router";

export default function Navbar() {
  const appActive = useAppSelector(selectAppActive);
  const userState = useAppSelector(selectUser);
  const [connected, setConnected] = useState<boolean>(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      setConnected(await PingHealth());
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  if (!appActive || !userState.userActive) {
    return null;
  }

  return (
    <div className="py-3 border-b-2 fixed top-0 left-0 flex w-full scale-z-100 content-center justify-center bg-cyan-800 border-cyan-600">
      <nav>
        <ul className="flex flex-row gap-8">
          <li className="hover:underline">
            <Link
              id="link-home"
              to="/"
              className="text-white hover:text-cyan-200"
            >
              Home
            </Link>
          </li>
          <li className="hover:underline">
            {userState.role === "ADMIN" ? (
              <Link
                id="link-accounts"
                to="/accounts"
                className="text-white hover:text-cyan-200"
              >
                Accounts
              </Link>
            ) : null}
          </li>
          <li className="hover:underline">
            <Link
              id="link-logout"
              to="/logout"
              className="text-white hover:text-red-600"
            >
              Logout
            </Link>
          </li>
          <li>
            {userState.role === "ADMIN" ? (
              <Link id="link-error" to="/error" className="text-red-600">
                Error Page
              </Link>
            ) : null}
          </li>
          <li>
            <h2 className="flex flex-row gap-2 font-semibold">
              Connection:
              {connected ? (
                <p className="text-green-500">ACTIVE</p>
              ) : (
                <p className="text-red-600">INACTIVE</p>
              )}
            </h2>
          </li>
          {/*
            // TODO Shipments
            // TODO Orders
            // TODO Inventory
          */}
        </ul>
      </nav>
    </div>
  );
}
