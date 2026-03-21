// SPDX-License-Identifier: GPL-3.0

import { AuthorizeUser } from "@/utility/ApiServices";
import { GlobalContext } from "@/utility/GlobalContext";
import { JwtObject } from "@/utility/Models";
import { router } from "expo-router";
import { useContext, useRef, useState } from "react";
import { Pressable, Text, TextInput } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function Login() {
  const [usernameIn, setUsernameValue] = useState("");
  const [passwordIn, setPasswordValue] = useState("");
  const globalCtx = useContext(GlobalContext);
  const passwordRef = useRef<TextInput | null>(null);

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

      globalCtx?.insertJWT(token);
      globalCtx?.insertUser({
        id: payload.id,
        username: payload.username,
        role: payload.role.Value,
        userActive: true,
      });
      globalCtx?.activateApp();
    } catch (err) {
      console.error(err);
      throw new Error(`Failed to authorize user: ${usernameIn}\n` + err);
    }

    console.log("App Initialized!");
    if (exists) {
      router.navigate("/");
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex items-center flex-1 bg-darkbg justify-center align-middle">
        <SafeAreaView>
          <Text className="text-white font-semibold text-xl">Login</Text>
        </SafeAreaView>
        <SafeAreaView className="gap-y-5 w-3/4">
          <TextInput
            className="border-2 text-center text-white border-white rounded-xl"
            onChangeText={setUsernameValue}
            value={usernameIn}
            placeholder="Username"
            placeholderTextColor="#fff"
            autoCapitalize="none"
            autoFocus={true}
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          <TextInput
            className="border-2 text-center text-white border-white rounded-xl"
            ref={passwordRef}
            onChangeText={setPasswordValue}
            value={passwordIn}
            placeholder="Password"
            placeholderTextColor="#fff"
            autoCapitalize="none"
            secureTextEntry={true}
            submitBehavior="blurAndSubmit"
          />
          <Pressable
            className="mt-5 bg-cyan-600 p-3 w-20 self-center items-center rounded-lg"
            onPress={handleLogin}
          >
            <Text className="font-bold text-white">Submit</Text>
          </Pressable>
        </SafeAreaView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
