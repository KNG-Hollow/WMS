// SPDX-License-Identifier: GPL-3.0

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectAppActive } from "../appSlice";
import { insertError, selectErrorActive } from "../errors/errorSlice";
import { useNavigate } from "react-router";
import { selectRole, selectUserState } from "./accountSlice";
import type { Account } from "../../app/models";
import { GetAccounts } from "../../services/accountApi";

export default function Accounts() {
  const userRole = useAppSelector(selectRole);
  const userState = useAppSelector(selectUserState);
  const appActive = useAppSelector(selectAppActive);
  const errorActive = useAppSelector(selectErrorActive);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [allAccounts, setAllAccounts] = useState<Account[]>([]);

  useEffect(() => {
    if (userRole !== "ADMIN") {
      dispatch(
        insertError([
          "Unauthorized!",
          "You do not have the proper credentials to access this information",
          true,
        ]),
      );
    }
    if (!appActive) {
      navigate("/login");
    }
    if (errorActive) {
      navigate("/error");
    }

    const fetchAccounts = async () => {
      let successful = false;

      try {
        const [fetchSuccessful, fetchedAccounts] = await GetAccounts(userState);
        successful = fetchSuccessful;
        if (!successful) {
          throw new Error("Failed to get accounts array");
        }
        setAllAccounts(fetchedAccounts);
      } catch (err) {
        console.error("Failed to get accounts array: " + err);
        alert("Failed to get accounts");
        dispatch(
          insertError([
            "Failed To Get Accounts",
            `Failed To Return An Acceptable Accounts Array ::\n${err}`,
            true,
          ]),
        );
      }
    };
    fetchAccounts();
  }, [appActive, dispatch, errorActive, navigate, userRole, userState]);

  return (
    <div className="flex w-full py-20 justify-center">
      <div className="mt-10 border-3 border-cyan-600 rounded bg-gray-900 p-20 items-center gap-y-2 flex flex-col">
        <div className="font-extrabold mb-10 text-center text-xl text-cyan-500">
          <h1>Account Manager</h1>
        </div>
        <div className="mt-10 mb-20 flex w-11/12 flex-col self-center">
          <div id="home-container">
            <div
              id="tasks-info-container"
              className="rounded-2xl flex flex-col items-center border-2 border-cyan-500 py-5"
            >
              <div id="tasks-info" className="mb-3">
                <div className="flex space-x-1">
                  <h2>Accounts:</h2>
                  <p className="text-cyan-200">{allAccounts.length}</p>
                </div>
              </div>
              <div
                id="tasks-info-buttons"
                className="flex flex-row justify-center gap-x-5"
              >
                <button onClick={() => navigate(-1)}>Back</button>
                <button onClick={() => navigate("/accounts/create")}>
                  New Account
                </button>
              </div>
            </div>
            <div
              id="tasks-container"
              className="mt-10 mb-10 rounded-l border-2 border-cyan-500 py-5"
            >
              <div>
                <div className="flex flex-col items-center justify-center">
                  <div
                    id="recent-tasks-text"
                    className="w-11/12 border-2 border-cyan-500 py-3"
                  >
                    <h2 className="font-bold text-center">All Accounts:</h2>
                  </div>
                </div>
                <div className="mt-5 flex flex-col items-center justify-center">
                  <table className="w-11/12">
                    <thead>
                      <tr>
                        <th>Firstname:</th>
                        <th>Lastname:</th>
                        <th>Username:</th>
                        <th>Email:</th>
                        <th>Phone:</th>
                        <th>Role:</th>
                        <th>Active:</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allAccounts.map((mapAccount: Account) => (
                        <tr
                          key={mapAccount.id}
                          className="border-2 border-cyan-400"
                        >
                          <td>{mapAccount.firstname}</td>
                          <td>{mapAccount.lastname}</td>
                          <td>{mapAccount.username}</td>
                          <td>{mapAccount.email}</td>
                          <td>{mapAccount.phone}</td>
                          {mapAccount.role.Value === "ADMIN" ? (
                            <td className="text-amber-300">ADMIN</td>
                          ) : (
                            <td>{mapAccount.role.Value}</td>
                          )}
                          {mapAccount.active ? (
                            <td className="text-green-600">Yes</td>
                          ) : (
                            <td className="text-red-700">No</td>
                          )}
                          <td
                            id="recent-tasks-buttons"
                            className="flex flex-row border-l-2 border-cyan-500"
                          >
                            <button
                              className="w-full self-center text-cyan-500"
                              onClick={() => {
                                navigate(`/accounts/${mapAccount.id}`, {
                                  state: { id: mapAccount.id },
                                });
                              }}
                            >
                              View
                            </button>
                            {/*
                          <button
                            onClick={() => {
                              if (
                                account?.username !== mapAccount?.username &&
                                account?.role.Value !== "ADMIN"
                              ) {
                                alert(
                                  'You Do Not Have Permission To Delete This Account'
                                );
                                return;
                              }
                              handleDelete(mapAccount.id!);
                            }}
                            className="w-3/5 self-center text-red-700"
                          >
                            Delete
                          </button>
                          */}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
