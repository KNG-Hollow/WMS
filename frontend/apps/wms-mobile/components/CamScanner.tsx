import { GlobalContext } from "@/utility/Contexts";
import { Ionicons } from "@expo/vector-icons";
import { useContext, useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from "react-native-vision-camera";

interface CameraProps {
  scannerActive: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CamScanner({ scannerActive }: CameraProps) {
  const globalctx = useContext(GlobalContext);
  const device = useCameraDevice("back");
  const { hasPermission, requestPermission } = useCameraPermission();
  const [torch, setTorch] = useState<boolean>(false);

  const codeScanner = useCodeScanner({
    codeTypes: ["qr", "ean-13", "upc-a"],
    onCodeScanned: (codes) => {
      for (const code of codes) {
        console.log(`Scanned Type: ${code.type}`);
        console.log(`Scanned Value: ${code.value}`);
        const scannedType = code.type;
        const scannedValue = code.value!;
        globalctx?.insertScan({ type: scannedType, value: scannedValue });
        scannerActive(false);
        console.log("Scanner Deactivated!");
      }
    },
  });

  if (!hasPermission) {
    return (
      <SafeAreaView className="flex border-t-4 items-center bg-darkbg w-full border-cyan-600 flex-1 justify-center">
        <Text className="text-center text-white pb-10">
          We request your permission to use the camera.
        </Text>
        <Pressable className="bg-cyan-600 p-3" onPress={requestPermission}>
          <Text className="text-white">Grant Permission</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex flex-1 w-full">
      <Camera
        style={StyleSheet.absoluteFill}
        device={device!}
        isActive={true}
        codeScanner={codeScanner}
        torch={torch ? "on" : "off"}
        enableZoomGesture={true}
      />
      <SafeAreaView className="flex flex-1">
        <Pressable className="top-5" onPress={() => scannerActive(false)}>
          <Ionicons name="chevron-back" color="white" size={35} />
        </Pressable>
        <Pressable
          className="self-center mt-auto"
          onPress={() => setTorch(!torch)}
        >
          <Ionicons
            name={torch ? "flash" : "flash-off"}
            color="white"
            size={24}
          />
        </Pressable>
      </SafeAreaView>
    </SafeAreaView>
  );
}
