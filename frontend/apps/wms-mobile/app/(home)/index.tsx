// SPDX-License-Identifier: GPL-3.0

import { GlobalContext } from "@/utility/GlobalContext";
import { useRouter } from "expo-router";
import { useContext, useEffect } from "react";
import { Pressable, Text } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const router = useRouter();
  const globalctx = useContext(GlobalContext);
  let userData = globalctx?.userData;

  useEffect(() => {
    if (!globalctx?.appActive || globalctx?.userData === undefined) {
      const timeoutId = setTimeout(() => {
        router.navigate("/login");
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [globalctx?.appActive, globalctx?.userData, router]);

  const handleLogout = () => {
    router.navigate("/login");
    setTimeout(() => {
      globalctx?.resetError();
      globalctx?.resetJWT();
      globalctx?.resetUser();
    });
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
      <SafeAreaView
        style={{
          experimental_backgroundImage: "linear-gradient(#0891b2, #25292e)",
        }}
        className="flex items-center flex-1 justify-center align-middle"
      >
        <SafeAreaView className="mb-20">
          <Text className="font-semibold text-lg text-white">
            Hello{" "}
            <Text className="underline">{capitalize(userData?.username)}</Text>
          </Text>
        </SafeAreaView>
        <SafeAreaView className="gap-y-4">
          {/*
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
          */}
          <Pressable
            className="bg-darkbg rounded items-center p-2"
            onPress={handleLogout}
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
