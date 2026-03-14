// SPDX-License-Identifier: GPL-3.0

import { GlobalContext } from "@/utility/GlobalContext";
import { useRouter } from "expo-router";
import { useContext, useEffect } from "react";
import { Pressable, Text } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const router = useRouter();
  const globalCtx = useContext(GlobalContext);
  let userData = globalCtx?.userData;

  useEffect(() => {
    if (!globalCtx?.appActive || globalCtx?.userData === undefined) {
      const timeoutId = setTimeout(() => {
        router.navigate("/login");
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [globalCtx?.appActive, globalCtx?.userData, router]);

  const handleRestart = () => {
    globalCtx?.resetError();
    globalCtx?.resetJWT();
    globalCtx?.resetUser();
  };

  const capitalize = (str: string | undefined): string => {
    if (str === undefined) {
      return "";
    } else {
      return str?.charAt(0).toUpperCase() + str?.slice(1);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex items-center flex-1 justify-center align-middle">
        <SafeAreaView className="mb-20">
          <Text className="font-semibold text-lg">
            Hello{" "}
            <Text className="underline">{capitalize(userData?.username)}</Text>
          </Text>
        </SafeAreaView>
        <SafeAreaView className="gap-y-4">
          <Pressable
            className="bg-cyan-600 rounded items-center p-2"
            onPress={() => router.navigate("/inventory")}
          >
            <Text>Inventory</Text>
          </Pressable>
          <Pressable
            className="bg-cyan-600 rounded items-center p-2"
            onPress={() => router.navigate("/account")}
          >
            <Text>Account</Text>
          </Pressable>
          <Pressable
            className="bg-darkbg rounded items-center p-2"
            onPress={handleRestart}
          >
            <Text className="text-white">Logout</Text>
          </Pressable>
          {userData?.role === "ADMIN" ? (
            <Pressable
              className="bg-red-600 rounded items-center p-2"
              onPress={() => router.navigate("/error")}
            >
              <Text>Error</Text>
            </Pressable>
          ) : null}
        </SafeAreaView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
