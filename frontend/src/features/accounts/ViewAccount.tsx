// SPDX-License-Identifier: GPL-3.0

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import type { Account } from "@/app/models";
import { GetAccount } from "@/services/accountApi";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { selectAppActive } from "../appSlice";
import { insertError, selectErrorActive } from "../errors/errorSlice";
import { selectUserState } from "./accountSlice";

export default function ViewAccount() {
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
      let successful = false;

      try {
        const [fetchSuccessful, fetchedAccount] = await GetAccount(
          userState,
          id,
        );
        successful = fetchSuccessful;
        if (!successful || fetchedAccount === null) {
          throw new Error("Failed to get account");
        }
        setAccount(fetchedAccount);
      } catch (err) {
        console.error(`Failed To Get Account ${id}: ` + err);
        alert(`Failed To Get Account: ${id}`);
        dispatch(
          insertError({
            header: "Failed To Get Account!",
            message: `Failed To Return An Acceptable Account Object With ID [${account?.id}] :: ${err}`,
            errorActive: true,
          }),
        );
      }
    };
    if (userState.role !== "ADMIN") {
      fetchAccount(userState.id);
    } else {
      fetchAccount(+id!);
    }
  }, [account?.id, appActive, dispatch, errorActive, id, navigate, userState]);

  return (
    <div className="flex flex-1 justify-center">
      <div className="flex flex-col w-5/6 border-3 gap-y-10 my-20 rounded border-cyan-600 p-20 bg-gray-900 items-center">
        <div className="text-xl font-bold text-cyan-500">
          <h1>{`${account?.firstname} ${account?.lastname}`}</h1>
        </div>
        <div className="flex flex-col gap-y-5 items-start">
          <div className="flex gap-x-5">
            <h3>Username:</h3>
            <p>{account?.username}</p>
          </div>
          <div className="flex gap-x-14">
            <h3>Email:</h3>
            <p>{account?.email}</p>
          </div>
          <div className="flex gap-x-12">
            <h3>Phone:</h3>
            <p>{account?.phone}</p>
          </div>
          {userState.role === "ADMIN" ? (
            <div className="flex gap-x-16">
              <h3>Role:</h3>
              <p>{account?.role.Value}</p>
            </div>
          ) : null}
          <div className="flex gap-x-9">
            <h3>Created:</h3>
            <p>{account?.created.toString()}</p>
          </div>
        </div>
        <div className="flex flex-col gap-y-2">
          <button onClick={() => navigate("./edit")}>Edit Account</button>
          <button onClick={() => navigate(-1)}>Back</button>
        </div>
      </div>
    </div>
  );
}
