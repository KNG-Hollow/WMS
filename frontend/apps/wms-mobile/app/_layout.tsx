// SPDX-License-Identifier: GPL-3.0

import { GlobalProvider } from "@/utility/Providers";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PaperProvider } from "react-native-paper";
import "../global.css";

export default function RootLayout() {
  return (
    <GlobalProvider>
      <PaperProvider>
        <Stack>
          <Stack.Screen name="(home)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="error" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="light" />
      </PaperProvider>
    </GlobalProvider>
  );
}
