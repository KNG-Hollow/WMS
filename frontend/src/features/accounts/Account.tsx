// SPDX-License-Identifier: GPL-3.0

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectAppActive } from "../appSlice";
import { insertError, selectErrorActive } from "../errors/errorSlice";
import { GetAccount } from "../../services/accountApi";
import { selectUserState } from "./accountSlice";
import type { Account } from "../../app/models";

export default function Account() {
  const appActive = useAppSelector(selectAppActive);
  const errorActive = useAppSelector(selectErrorActive);
  const userState = useAppSelector(selectUserState);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const [account, setAccount] = useState<Account | null>(null);

  useEffect(() => {
    if (!appActive) {
      navigate("/login");
    }
    if (errorActive) {
      navigate("/error");
    }

    const fetchAccount = async (id: number) => {
      let Successful = false;

      try {
        const [fetchSuccessful, fetchedAccount] = await GetAccount(
          userState,
          id,
        );
        Successful = fetchSuccessful;
        if (!Successful || fetchedAccount === null) {
          throw new Error("Failed to get account");
        }
        setAccount(fetchedAccount);
      } catch (err) {
        console.error(`Failed To Get Account ${id}: ` + err);
        alert(`Failed To Get Account: ${id}`);
        dispatch(
          insertError([
            "Failed To Get Account!",
            `Failed To Return An Acceptable Account Object With ID [${account?.id}] :: ${err}`,
            true,
          ]),
        );
      }
    };
    if (userState.role !== "ADMIN") {
      fetchAccount(userState.id);
    } else {
      fetchAccount(+id!);
    }
  }, [account?.id, appActive, dispatch, errorActive, id, navigate, userState]);

  function capitalize(str: string | undefined): string {
    if (str === undefined) {
      return "";
    } else {
      return str?.charAt(0).toUpperCase() + str?.slice(1);
    }
  }

  return (
    <div className="flex justify-center">
      <div className="flex flex-col border-3 mb-20 rounded border-cyan-600 p-25 mt-20 bg-gray-900 items-center justify-center">
        <div className="text-xl font-extrabold text-cyan-500">
          <h1>{`${capitalize(account?.firstname)} ${capitalize(account?.lastname)}`}</h1>
        </div>
        <div className="flex flex-col gap-y-5 items-center mt-10">
          <div className="flex gap-x-2">
            <h3>Username:</h3>
            <p>{account?.username}</p>
          </div>
          <div className="flex gap-x-2">
            <h3>Email:</h3>
            <p>{account?.email}</p>
          </div>
          <div className="flex gap-x-2">
            <h3>Phone:</h3>
            <p>{account?.phone}</p>
          </div>
          {userState.role === "ADMIN" ? (
            <div className="flex gap-x-2">
              <h3>Role:</h3>
              <p>{account?.role.Value}</p>
            </div>
          ) : null}
          <div className="flex gap-x-2">
            <h3>Created:</h3>
            <p>{account?.created.toString()}</p>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-y-2">
          <button onClick={() => navigate("./edit")}>Edit Account</button>
          <button onClick={() => navigate(-1)}>Back</button>
        </div>
      </div>
    </div>
  );
}
