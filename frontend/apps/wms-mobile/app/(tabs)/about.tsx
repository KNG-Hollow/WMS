// SPDX-License-Identifier: GPL-3.0

import { GlobalContext } from "@/utility/GlobalContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useContext, useEffect } from "react";
import { Linking, Pressable, Text } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { version } from "../../package.json";

export default function AboutScreen() {
  //const [connected, setConnected] = useState<boolean>(true);
  const globalCtx = useContext(GlobalContext);
  const connected = globalCtx?.APIActive;
  const router = useRouter();

  useEffect(() => {
    if (!globalCtx?.appActive || globalCtx.userData === undefined) {
      router.navigate("/login");
    }
    /*
    const interval = setInterval(async () => {
      setConnected(await PingHealth());
    }, 60000);

    return () => clearInterval(interval);
    */
  }, [globalCtx?.appActive, globalCtx?.userData, router]);

  const footer = () => {
    const copyright = String.fromCodePoint(0x00a9);
    const year = new Date().getFullYear();
    const companyName = "Jaylen Holloway";

    return (
      <Text className="text-cyan-400">{`${copyright} ${year} ${companyName}. All Rights Reserved.`}</Text>
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex flex-1 items-center justify-center align-middle bg-darkbg">
        <SafeAreaView className="flex items-center flex-1 justify-center">
          <Text className="text-white">
            Warehouse Management System - Inventory Manager
          </Text>
          <Text className="mt-15 text-white">Version: {version}</Text>

          <Text className="mt-20 text-white">
            Connection:{"\t"}
            {connected ? (
              <Text className="text-green-600">Active</Text>
            ) : (
              <Text className="text-red-600">Inactive</Text>
            )}
          </Text>
        </SafeAreaView>
        <SafeAreaView className="mb-2">
          <Pressable
            className="mb-5 self-center"
            onPress={() =>
              Linking.openURL(
                "https://github.com/KNG-Hollow/WMS/tree/feature/wms-mobile/frontend/apps/wms-mobile",
              )
            }
          >
            <Ionicons name="logo-github" size={40} color="white" />
          </Pressable>
          {footer()}
        </SafeAreaView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
