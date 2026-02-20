// SPDX-License-Identifier: GPL-3.0

import { useState } from "react";
import { useAppDispatch } from "../../app/hooks";
import {
  insertJWT,
  insertRole,
  activateUser,
  insertUsername,
  insertID,
} from "../../features/accounts/accountSlice";
import { insertAppUser, activateApp } from "../../features/appSlice";
import { useNavigate } from "react-router";
import type { JwtObject } from "../../app/models";
import { AuthorizeUser } from "../../services/utilityApi";
import DOMPurify from "dompurify";

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
    <div className="w-full flex flex-col">
      <div className="text-center w-3/4 py-2 border-2 bg-gray-900 self-center mt-15 text-2xl font-bold">
        <h2>Login</h2>
      </div>
      <div className="mt-5 flex justify-center">
        <div
          id="login-container"
          className="mt-10 border-3 px-10 rounded-xl py-10 bg-gray-900 flex h-full flex-col items-center"
        >
          <div id="login-form">
            <div
              id="input-username"
              className="flex flex-row pr-22 space-x-2 font-extrabold"
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
              className="mt-4 flex flex-row space-x-3 font-extrabold"
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
          <div id="login-buttons" className="mt-15">
            <div id="login-button">
              <button onClick={handleLogin}>Login</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
