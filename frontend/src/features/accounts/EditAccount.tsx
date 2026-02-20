// SPDX-License-Identifier: GPL-3.0

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectAppActive } from "../appSlice";
import { insertError, selectErrorActive } from "../errors/errorSlice";
import type { Account } from "../../app/models";
import { selectRole, selectUserState } from "./accountSlice";
import {
  DeleteAccount,
  GetAccount,
  UpdateAccount,
} from "../../services/accountApi";
import DOMPurify from "dompurify";

export default function EditAccount() {
  const userRole = useAppSelector(selectRole);
  const appActive = useAppSelector(selectAppActive);
  const errorActive = useAppSelector(selectErrorActive);
  const userState = useAppSelector(selectUserState);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [account, setAccount] = useState<Account | null>();
  const [usernameIn, setUsernameValue] = useState("");
  const [passwordIn, setPasswordValue] = useState("");
  const [firstnameIn, setFirstnameValue] = useState("");
  const [lastnameIn, setLastnameValue] = useState("");
  const [emailIn, setEmailValue] = useState("");
  const [phoneIn, setPhoneValue] = useState("");
  const [roleIn, setRoleValue] = useState("");
  const { id } = useParams();

  useEffect(() => {
    if (userRole !== "ADMIN" && userState.id !== +id!) {
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
  }, [
    appActive,
    errorActive,
    navigate,
    dispatch,
    userRole,
    userState.id,
    id,
    userState,
    account?.id,
  ]);

  const handleDelete = async () => {
    let success: boolean;
    let responseId: number;

    console.log("Attempting to update account...");
    try {
      [success, responseId] = await DeleteAccount(userState, +id!);
      if (!success || responseId === null) {
        console.error(
          `success: ${success ? "True" : "False"} , account: ${responseId}`,
        );
        throw new Error("Delete Account Had Unexpected Response Values!");
      }
      console.log(
        `success: ${success ? "True" : "False"} , account: ${responseId}`,
      );
      navigate(-1);
    } catch (err) {
      console.error("ApiService Failed To Delete Account: " + err);
      dispatch(
        insertError([
          "Api Service Failure",
          `Failed To Populate The Database And Get A Successful Response ::\n${err}`,
          true,
        ]),
      );
    }
  };

  const handleUpdate = async () => {
    let success: boolean;
    let responseAccount: Account;
    const updatedAccount: Account = {
      id: null,
      firstname: firstnameIn,
      lastname: lastnameIn,
      email: emailIn,
      phone: phoneIn,
      username: usernameIn,
      password: passwordIn,
      role: {
        ADMIN: "",
        CUSTOMER: "",
        EMPLOYEE: "",
        MANAGER: "",
        SUPPLIER: "",
        Value: roleIn,
      },
      active: account!.active,
      created: account!.created,
    };

    if (updatedAccount.firstname.trim() === "") {
      alert("Firstname cannot be empty!");
      return;
    }
    if (updatedAccount.lastname.trim() === "") {
      alert("Lastname cannot be empty!");
      return;
    }
    if (updatedAccount.username.trim() === "") {
      alert("Username cannot be empty!");
      return;
    }
    if (updatedAccount.password.trim() === "") {
      alert("Password cannot be empty!");
      return;
    }
    if (updatedAccount.role.Value.trim() === "") {
      alert("Role cannot be empty!");
      return;
    }

    console.log("Attempting to update account...");
    try {
      [success, responseAccount] = await UpdateAccount(
        +id!,
        userState,
        updatedAccount,
      );
      if (!success || responseAccount === null) {
        console.error(
          `success: ${success ? "True" : "False"} , account: ${responseAccount}`,
        );
        throw new Error("Create Account Had Unexpected Response Values!");
      }
      console.log(
        `success: ${success ? "True" : "False"} , account: ${responseAccount}`,
      );
      navigate(-1);
    } catch (err) {
      console.error("ApiService Failed To Create Account: " + err);
      dispatch(
        insertError([
          "Api Service Failure",
          `Failed To Populate The Database And Get A Successful Response ::\n${err}`,
          true,
        ]),
      );
    }
  };

  return (
    <div className="flex py-20 flex-col items-center">
      <div
        id="form-container"
        className="mt-10 border-3 border-cyan-600 rounded bg-gray-900 p-20 gap-y-2 flex flex-col"
      >
        <div className="font-extrabold mb-10 text-center text-xl text-cyan-500">
          <h1>Edit Account</h1>
        </div>
        <div id="form" className="flex gap-y-5 flex-col items-center">
          {userRole === "ADMIN" ? (
            <div id="input-username">
              <label htmlFor="username-area" className="relative right-2">
                *Username:
              </label>
              <input
                className="border-2 rounded text-center"
                type="text"
                aria-label="username"
                placeholder={account?.username}
                value={usernameIn}
                onChange={(e) => {
                  const sanitizedValue = DOMPurify.sanitize(e.target.value);
                  setUsernameValue(sanitizedValue);
                }}
              />
            </div>
          ) : null}
          <div id="input-password">
            <label htmlFor="password-area">*Password:</label>
            <input
              className="border-2 rounded text-center"
              type="password"
              aria-label="password"
              placeholder="..."
              value={passwordIn}
              onChange={(e) => {
                const sanitizedValue = DOMPurify.sanitize(e.target.value);
                setPasswordValue(sanitizedValue);
              }}
            />
          </div>
          {userRole === "ADMIN" ? (
            <>
              <div id="input-firstname">
                <label htmlFor="firstname-area">*Firstname:</label>
                <input
                  className="border-2 rounded text-center"
                  type="text"
                  aria-label="firstname"
                  placeholder={account?.firstname}
                  value={firstnameIn}
                  onChange={(e) => {
                    const sanitizedValue = DOMPurify.sanitize(e.target.value);
                    setFirstnameValue(sanitizedValue);
                  }}
                />
              </div>
              <div id="input-lastname">
                <label htmlFor="lastname-area">*Lastname:</label>
                <input
                  className="border-2 rounded text-center"
                  type="text"
                  aria-label="lastname"
                  placeholder={account?.lastname}
                  value={lastnameIn}
                  onChange={(e) => {
                    const sanitizedValue = DOMPurify.sanitize(e.target.value);
                    setLastnameValue(sanitizedValue);
                  }}
                />
              </div>
            </>
          ) : null}

          <div id="input-email">
            <label htmlFor="email-area">Email:</label>
            <input
              className="border-2 rounded text-center"
              type="email"
              aria-label="email"
              placeholder={account?.email}
              value={emailIn}
              onChange={(e) => {
                const sanitizedValue = DOMPurify.sanitize(e.target.value);
                setEmailValue(sanitizedValue);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleUpdate();
              }}
            />
          </div>
          <div id="input-phone">
            <label htmlFor="phone-area">Phone:</label>
            <input
              className="border-2 rounded text-center"
              type="tel"
              aria-label="phone"
              placeholder={account?.phone}
              value={phoneIn}
              onChange={(e) => {
                const sanitizedValue = DOMPurify.sanitize(e.target.value);
                setPhoneValue(sanitizedValue);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleUpdate();
              }}
            />
          </div>
          {userRole === "ADMIN" ? (
            <div
              id="input-role"
              className="border flex items-center py-2 flex-col w-1/2"
            >
              <label className="font-bold flex">Role:</label>
              <label htmlFor="role-customer">
                <input
                  className=""
                  type="radio"
                  name="roles"
                  value="CUSTOMER"
                  checked={roleIn === "CUSTOMER"}
                  onChange={(e) => {
                    const sanitizedValue = DOMPurify.sanitize(e.target.value);
                    setRoleValue(sanitizedValue);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleUpdate();
                  }}
                />
                <span className="">Customer</span>
              </label>
              <label htmlFor="role-employee">
                <input
                  className=""
                  type="radio"
                  name="roles"
                  value="EMPLOYEE"
                  checked={roleIn === "EMPLOYEE"}
                  onChange={(e) => {
                    const sanitizedValue = DOMPurify.sanitize(e.target.value);
                    setRoleValue(sanitizedValue);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleUpdate();
                  }}
                />
                <span className="">Employee</span>
              </label>

              <label htmlFor="role-manager">
                <input
                  className=""
                  type="radio"
                  name="roles"
                  value="MANAGER"
                  checked={roleIn === "MANAGER"}
                  onChange={(e) => {
                    const sanitizedValue = DOMPurify.sanitize(e.target.value);
                    setRoleValue(sanitizedValue);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleUpdate();
                  }}
                />
                <span className="">Manager</span>
              </label>
              <label htmlFor="role-supplier">
                <input
                  className=""
                  type="radio"
                  name="roles"
                  value="SUPPLIER"
                  checked={roleIn === "SUPPLIER"}
                  onChange={(e) => {
                    const sanitizedValue = DOMPurify.sanitize(e.target.value);
                    setRoleValue(sanitizedValue);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleUpdate();
                  }}
                />
                <span className="">Supplier</span>
              </label>
              <label htmlFor="role-admin">
                <input
                  className=""
                  type="radio"
                  name="roles"
                  value="ADMIN"
                  checked={roleIn === "ADMIN"}
                  onChange={(e) => {
                    const sanitizedValue = DOMPurify.sanitize(e.target.value);
                    setRoleValue(sanitizedValue);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleUpdate();
                  }}
                />
                <span className="">Admin</span>
              </label>
            </div>
          ) : null}
          <div className="mt-5 flex flex-col gap-y-2">
            <button onClick={() => handleUpdate()}>Submit</button>
            {userRole === "ADMIN" ? (
              <button onClick={() => handleDelete()}>Delete</button>
            ) : null}
            <button onClick={() => navigate(-1)}>Back</button>
          </div>
        </div>
      </div>
    </div>
  );
}
