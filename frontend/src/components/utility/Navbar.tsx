// SPDX-License-Identifier: GPL-3.0

import { useEffect, useState } from "react";
import { useAppSelector } from "../../app/hooks";
import { selectAppActive, selectUser } from "../../features/appSlice";
import { PingHealth } from "../../services/utilityApi";
import { Link } from "react-router";

// TODO Adjust CSS for smaller screen sizes

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

  function UtilityNav() {
    return (
      <li className="group absolute left-2 bottom-1 ">
        <div className="cursor-pointer w-8 h-8">
          <svg
            viewBox="0 0 32 32"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            fill="#000000"
            className="fill-cyan-400"
            data-darkreader-inline-fill=""
          >
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              {" "}
              <title>plus</title> <desc>Created with Sketch Beta.</desc>{" "}
              <defs> </defs>{" "}
              <g
                id="Page-1"
                stroke="none"
                stroke-width="1"
                fill="none"
                fill-rule="evenodd"
                data-darkreader-inline-stroke=""
              >
                {" "}
                <g
                  id="Icon-Set-Filled"
                  transform="translate(-362.000000, -1037.000000)"
                  fill="#000000"
                  className="fill-cyan-400"
                  data-darkreader-inline-fill=""
                >
                  {" "}
                  <path
                    d="M390,1049 L382,1049 L382,1041 C382,1038.79 380.209,1037 378,1037 C375.791,1037 374,1038.79 374,1041 L374,1049 L366,1049 C363.791,1049 362,1050.79 362,1053 C362,1055.21 363.791,1057 366,1057 L374,1057 L374,1065 C374,1067.21 375.791,1069 378,1069 C380.209,1069 382,1067.21 382,1065 L382,1057 L390,1057 C392.209,1057 394,1055.21 394,1053 C394,1050.79 392.209,1049 390,1049"
                    id="plus"
                  >
                    {" "}
                  </path>{" "}
                </g>{" "}
              </g>{" "}
            </g>
          </svg>
        </div>
        <div className="hidden mt-0.5 bg-gray-800 group-hover:block absolute -left-5">
          <Link
            id="link-home"
            to="/"
            className="block px-4 py-2 text-white hover:text-cyan-200 hover:bg-gray-600"
          >
            Home
          </Link>
          <Link
            id="link-logout"
            to="/logout"
            className="block px-4 border-t border-white py-2 text-white hover:text-red-600 hover:bg-gray-600"
          >
            Logout
          </Link>
          {userState.role === "ADMIN" ? (
            <Link
              id="link-error"
              to="/error"
              className="block border-t border-white px-4 py-2 text-red-600 hover:bg-gray-600"
            >
              Error Page
            </Link>
          ) : null}
        </div>
      </li>
    );
  }

  function AccountDropdown() {
    return (
      <>
        <div className="cursor-pointer font-semibold text-white hover:text-cyan-200">
          Accounts
        </div>
        <div className="hidden bg-gray-800 group-hover:block absolute -left-4">
          <Link
            className="block border-b px-4 py-2 text-white hover:bg-gray-600"
            to={`/accounts/${userState.id}`}
          >
            View Account
          </Link>
          <Link
            className="block border-b px-4 py-2 text-white hover:bg-gray-600"
            to="/accounts/create"
          >
            Create Account
          </Link>

          <Link
            className="block px-4 py-2 text-white hover:bg-gray-600"
            to="/accounts"
          >
            All Accounts
          </Link>
        </div>
      </>
    );
  }

  return (
    <div className="py-2 border-b-2 fixed top-0 left-0 flex w-full scale-z-100 content-center justify-center bg-cyan-800 border-cyan-600">
      <nav>
        <ul className="flex flex-row gap-8">
          {UtilityNav()}
          <li className="hover:underline group relative">
            {userState.role !== "ADMIN" ? (
              <Link
                id="link-accounts"
                to={`/accounts/${userState.id}`}
                className="text-white hover:text-cyan-200"
              >
                Account
              </Link>
            ) : (
              AccountDropdown()
            )}
          </li>
          <li className="hover:underline">
            <Link
              id="link-inventory"
              to="/inventory"
              className="text-white hover:text-cyan-200"
            >
              Inventory
            </Link>
          </li>
          <li className="hover:underline">
            {userState.role !== "CUSTOMER" && userState.role !== "SUPPLIER" ? (
              <Link
                id="link-orders"
                to="/orders"
                className="text-white hover:text-cyan-200"
              >
                Orders
              </Link>
            ) : null}
          </li>
          <li className="hover:underline">
            {userState.role !== "EMPLOYEE" && userState.role !== "CUSTOMER" ? (
              <Link
                id="link-shipments"
                to="/shipments"
                className="text-white hover:text-cyan-200"
              >
                Shipments
              </Link>
            ) : null}
          </li>
          <li>
            <h2 className="flex flex-row gap-2 absolute right-3 font-semibold">
              Connection:
              {connected ? (
                <p className="text-green-500">ACTIVE</p>
              ) : (
                <p className="text-red-600">INACTIVE</p>
              )}
            </h2>
          </li>
        </ul>
      </nav>
    </div>
  );
}
