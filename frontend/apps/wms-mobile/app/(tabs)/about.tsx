// SPDX-License-Identifier: GPL-3.0

import { PingHealth } from "@/utility/ApiServices";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Linking, Pressable, Text } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { version } from "../../package.json";

export default function AboutScreen() {
  const [connected, setConnected] = useState<boolean>(true);

  useEffect(() => {
    const interval = setInterval(async () => {
      setConnected(await PingHealth());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex items-center flex-1 bg-darkbg justify-center align-middle">
        <Text className="text-white">
          Warehouse Management System - Inventory Manager
        </Text>
        <Text className="mt-15 text-white">Version: {version}</Text>
        <Pressable
          className="mt-10"
          onPress={() =>
            Linking.openURL(
              "https://github.com/KNG-Hollow/WMS/tree/feature/wms-mobile/frontend/apps/wms-mobile",
            )
          }
        >
          <Ionicons name="logo-github" size={40} color="white" />
        </Pressable>
        <Text className="mt-20 text-white">
          Connection:{"\t"}
          {connected ? (
            <Text className="text-green-600">Active</Text>
          ) : (
            <Text className="text-red-600">Inactive</Text>
          )}
        </Text>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
