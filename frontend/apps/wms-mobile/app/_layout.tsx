// SPDX-License-Identifier: GPL-3.0

import { GlobalProvider } from "@/utility/GlobalContext";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PaperProvider } from "react-native-paper";
import "../global.css";

export default function RootLayout() {
  return (
    <GlobalProvider>
      <PaperProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen
            name="account"
            options={{
              title: "Account",
              headerShown: true,
              headerStyle: {
                backgroundColor: "#25292e",
              },
              headerTintColor: "#fff",
            }}
          />
          <Stack.Screen name="inventory" options={{ headerShown: false }} />
          <Stack.Screen name="products" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="light" />
      </PaperProvider>
    </GlobalProvider>
  );
}
