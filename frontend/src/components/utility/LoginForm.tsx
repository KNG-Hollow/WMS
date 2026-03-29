// SPDX-License-Identifier: GPL-3.0

import { useAppDispatch } from "@/app/hooks";
import type { JwtObject } from "@/app/models";
import {
  activateUser,
  insertID,
  insertJWT,
  insertRole,
  insertUsername,
} from "@/features/accounts/accountSlice";
import { activateApp, insertAppUser } from "@/features/appSlice";
import { AuthorizeUser } from "@/services/utilityApi";
import DOMPurify from "dompurify";
import { useState } from "react";
import { useNavigate } from "react-router";

export default function LoginForm() {
  const dispatch = useAppDispatch();
  const [usernameIn, setUsernameValue] = useState<string>("");
  const [passwordIn, setPasswordValue] = useState<string>("");
  const navigate = useNavigate();

  let exists: boolean;
  let token: string;
  let payload: JwtObject;

  const handleLogin = async () => {
    if (usernameIn.trim().length === 0 || passwordIn.trim().length === 0) {
      console.error("fields in the login form cannot be empty");
      alert("Try Again: Please fill in both username and password to login.");
      return;
    }

    console.log("Attempting to login as: ", usernameIn);
    try {
      [exists, token, payload] = await AuthorizeUser(usernameIn, passwordIn);
      console.log("Exists:", exists, "Token Payload:", payload);

      if (!exists || token.length < 1 || payload === null) {
        alert("Account not found in database...");
        throw new Error("Account not found in database!");
      }
      dispatch(insertJWT(token));
      dispatch(insertID(payload.id));
      dispatch(insertUsername(payload.username));
      dispatch(insertRole(payload.role.Value));
      dispatch(activateUser());

      dispatch(
        insertAppUser({
          jwt: token,
          id: payload.id,
          username: payload.username,
          role: payload.role.Value,
          userActive: true,
        }),
      );
      dispatch(activateApp());
    } catch (err) {
      console.error(err);
      throw new Error(`Failed to authorize user: ${usernameIn}\n` + err);
    }

    console.log("App Initialized!");
    if (exists) {
      navigate("/");
    }
  };

  return (
    <div className="flex flex-1 gap-y-15 items-center justify-center flex-col">
      <div className="text-center w-svh py-3 border-2 rounded bg-gray-900 text-2xl font-semibold">
        <h2>Login</h2>
      </div>
      <div className="w-svh flex justify-center">
        <div
          id="login-container"
          className="border-2 rounded-xl py-15 gap-y-10 bg-gray-900 flex w-full flex-col items-center justify-center"
        >
          <div id="login-form" className="space-y-5">
            <div
              id="input-username"
              className="flex flex-row pr-22 space-x-2 font-bold"
            >
              <label htmlFor="username-area">Username:</label>
              <input
                className="border-2 rounded text-center"
                type="text"
                aria-label="username"
                placeholder="..."
                value={usernameIn}
                onChange={(e) => {
                  const sanitizedValue = DOMPurify.sanitize(e.target.value);
                  setUsernameValue(sanitizedValue);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleLogin();
                }}
              />
            </div>
            <div
              id="input-password"
              className="flex flex-row space-x-3 font-bold"
            >
              <label htmlFor="password-area">Password:</label>
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
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleLogin();
                }}
              />
            </div>
          </div>
          <div id="login-buttons" className="">
            <div id="login-button">
              <button onClick={handleLogin}>Login</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
