// SPDX-License-Identifier: GPL-3.0

import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectAppActive } from "../appSlice";
import { selectErrorActive, insertError } from "../errors/errorSlice";
import DOMPurify from "dompurify";
import { selectRole, selectUserState } from "./accountSlice";
import type { Account } from "../../app/models";
import { CreateAccount } from "../../services/accountApi";

export default function CreateAccountForm() {
  const userRole = useAppSelector(selectRole);
  const appActive = useAppSelector(selectAppActive);
  const errorActive = useAppSelector(selectErrorActive);
  const userState = useAppSelector(selectUserState);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [usernameIn, setUsernameValue] = useState("");
  const [passwordIn, setPasswordValue] = useState("");
  const [firstnameIn, setFirstnameValue] = useState("");
  const [lastnameIn, setLastnameValue] = useState("");
  const [emailIn, setEmailValue] = useState("");
  const [phoneIn, setPhoneValue] = useState("");
  const [roleIn, setRoleValue] = useState("");

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
  }, [appActive, errorActive, navigate, dispatch, userRole]);

  const handleCreate = async () => {
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
      active: false,
      created: "",
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

    console.log("Attempting to create account...");
    try {
      [success, responseAccount] = await CreateAccount(
        userState,
        null,
        updatedAccount.firstname,
        updatedAccount.lastname,
        updatedAccount.email,
        updatedAccount.phone,
        updatedAccount.username,
        updatedAccount.password,
        updatedAccount.role,
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
    <div className="flex pt-20 pb-20 flex-col items-center">
      <div className="font-extrabold text-cyan-500">
        <h1>Create Account</h1>
      </div>
      <div
        id="form-container"
        className="mt-10 border-3 border-cyan-600 rounded bg-gray-900 p-20 gap-y-2 flex flex-col"
      >
        <div id="form" className="flex gap-y-5 flex-col items-center">
          <div id="input-username">
            <label htmlFor="username-area" className="relative right-2">
              *Username:
            </label>
            <input
              className="border-2 rounded text-center"
              type="text"
              aria-label="username"
              value={usernameIn}
              onChange={(e) => {
                const sanitizedValue = DOMPurify.sanitize(e.target.value);
                setUsernameValue(sanitizedValue);
              }}
            />
          </div>
          <div id="input-password">
            <label htmlFor="password-area">*Password:</label>
            <input
              className="border-2 rounded"
              type="password"
              aria-label="password"
              value={passwordIn}
              onChange={(e) => {
                const sanitizedValue = DOMPurify.sanitize(e.target.value);
                setPasswordValue(sanitizedValue);
              }}
            />
          </div>
          <div id="input-firstname">
            <label htmlFor="firstname-area">*Firstname:</label>
            <input
              className="border-2 rounded"
              type="text"
              aria-label="firstname"
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
              className="border-2 rounded"
              type="text"
              aria-label="lastname"
              value={lastnameIn}
              onChange={(e) => {
                const sanitizedValue = DOMPurify.sanitize(e.target.value);
                setLastnameValue(sanitizedValue);
              }}
            />
          </div>
          <div id="input-email">
            <label htmlFor="email-area">Email:</label>
            <input
              className="border-2 rounded"
              type="text"
              aria-label="email"
              value={emailIn}
              onChange={(e) => {
                const sanitizedValue = DOMPurify.sanitize(e.target.value);
                setEmailValue(sanitizedValue);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
              }}
            />
          </div>
          <div id="input-phone">
            <label htmlFor="phone-area">Phone:</label>
            <input
              className="border-2 rounded"
              type="text"
              aria-label="phone"
              value={phoneIn}
              onChange={(e) => {
                const sanitizedValue = DOMPurify.sanitize(e.target.value);
                setPhoneValue(sanitizedValue);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
              }}
            />
          </div>
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
                  if (e.key === "Enter") handleCreate();
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
                  if (e.key === "Enter") handleCreate();
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
                  if (e.key === "Enter") handleCreate();
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
                  if (e.key === "Enter") handleCreate();
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
                  if (e.key === "Enter") handleCreate();
                }}
              />
              <span className="">Admin</span>
            </label>
          </div>
          <div className="mt-5 flex flex-col gap-y-2">
            <button onClick={() => handleCreate()}>Submit</button>
            <button onClick={() => navigate(-1)}>Back</button>
          </div>
        </div>
      </div>
    </div>
  );
}
