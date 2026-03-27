// SPDX-License-Identifier: GPL-3.0

import { GlobalContext } from "@/utility/Contexts";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useContext, useEffect } from "react";
import { BackHandler, Pressable, Text } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function ViewError() {
  const globalctx = useContext(GlobalContext);
  const errorData = globalctx?.errorData;
  const router = useRouter();

  useEffect(() => {
    if (globalctx?.userData === undefined || !globalctx?.appActive) {
      router.navigate("/login");
    }
    if (errorData === undefined) {
      globalctx?.insertError({
        title: "Unknown Error",
        message:
          "You were directed to the error page without having an error, please restart the app!",
        active: true,
      });
    }
  });

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );
      return () => backHandler.remove();
    }, []),
  );

  const handleRestart = () => {
    router.navigate("/login");
    setTimeout(() => {
      globalctx?.resetError();
      globalctx?.resetJWT();
      globalctx?.resetUser();
    }, 500);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex flex-1 bg-darkbg justify-center items-center">
        <SafeAreaView className="items-center">
          <Text className="text-red-600 text-xl font-bold">Error</Text>
        </SafeAreaView>
        <SafeAreaView className="items-center w-4/5">
          <SafeAreaView className="items-center gap-y-2">
            <Text className="text-red-600 text-lg font-semibold">Title:</Text>
            <Text className="text-white">{errorData?.title}</Text>
          </SafeAreaView>

          <SafeAreaView className="items-center gap-y-2">
            <Text className="text-red-600 text-lg font-semibold">Message:</Text>
            <Text className="text-white">{errorData?.message}</Text>
          </SafeAreaView>
        </SafeAreaView>
        <Pressable
          className="bg-cyan-600 rounded items-center p-2"
          onPress={handleRestart}
        >
          <Text className="">Restart</Text>
        </Pressable>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
