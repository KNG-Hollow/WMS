// SPDX-License-Identifier: GPL-3.0

import CamScanner from "@/components/CamScanner";
import { GlobalContext } from "@/utility/GlobalContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Pressable, Text } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function AddInventory() {
  const globalctx = useContext(GlobalContext);
  const scannerValue = globalctx?.scannedCode;
  const router = useRouter();
  const [scannerActive, setScannerActive] = useState<boolean>(false);

  useEffect(() => {
    if (globalctx?.userData === undefined || !globalctx?.appActive) {
      router.navigate("/inventory");
    }
  }, [globalctx?.appActive, globalctx?.userData, router, scannerActive]);

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex flex-1 items-center justify-center">
        <SafeAreaView className="">
          <Text>Scanner Recieved:</Text>
          <Text>{scannerValue?.type}</Text>
          <Text>{scannerValue?.value}</Text>
        </SafeAreaView>

        {scannerActive ? (
          <CamScanner
            scannerActive={setScannerActive}
            type={scannerValue?.type!}
            value={scannerValue?.value!}
          />
        ) : (
          <SafeAreaView className="self-center flex-1">
            <Pressable
              className="bg-cyan-600 mt-auto p-3 flex-row gap-x-1"
              onPress={() => {
                console.log("Scanner Activated!");
                setScannerActive(true);
              }}
            >
              <Text className="text-white font-semibold">Activate Scanner</Text>
              <Ionicons name="barcode" color="white" size={22} />
            </Pressable>
          </SafeAreaView>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
