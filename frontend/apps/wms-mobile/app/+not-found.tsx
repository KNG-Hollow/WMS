// SPDX-License-Identifier: GPL-3.0

import { Link, Stack } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops! Not Found" }} />
      <SafeAreaProvider>
        <SafeAreaView className="flex flex-1 bg-darkbg justify-center align-middle items-center">
          <Link href="/" className="font-semibold color-white underline">
            Go back to Home Screen!
          </Link>
        </SafeAreaView>
      </SafeAreaProvider>
    </>
  );
}
