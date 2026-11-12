import { GlobalContext } from "@/utility/Contexts";
import Ionicons from "@react-native-vector-icons/ionicons/static";
import { useIsFocused } from "expo-router";
import { useContext, useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from "react-native-vision-camera";
import {
  Barcode,
  useBarcodeScannerOutput,
} from "react-native-vision-camera-barcode-scanner";

interface CameraProps {
  scannerActive: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CamScanner({ scannerActive }: CameraProps) {
  const globalctx = useContext(GlobalContext);
  const device = useCameraDevice("back", { physicalDevices: ["telephoto"] });
  const { hasPermission, requestPermission } = useCameraPermission();
  const [torch, setTorch] = useState<boolean>(false);
  const isFocused = useIsFocused();

  const codeScanner = useBarcodeScannerOutput({
    barcodeFormats: ["qr-code", "ean-13", "upc-a"],
    onBarcodeScanned(codes: Barcode[]) {
      for (const code of codes) {
        console.log(`Scanned Type: ${code.valueType}`);
        console.log(`Scanned Value: ${code.displayValue}`);
        const scannedType = code.valueType;
        const scannedValue = code.displayValue!;
        globalctx?.insertScan({ type: scannedType, value: scannedValue });
        scannerActive(false);
        console.log("Scanner Deactivated!");
      }
    },
    onError(error: Error) {
      console.error("Failed to scan barcodes", error);
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
        outputs={[codeScanner]}
        torchMode={torch ? "on" : "off"}
        enableNativeZoomGesture={true}
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
  /*

  return (
    <CodeScanner
      isActive={isFocused}
      style={""}
      barcodeFormats={["qr-code", "ean-13", "upc-a"]}
      onBarcodeScanned={(barcodes) => {
        for (let entry of barcodes) {
          const scannedType = entry.valueType;
          const scannedValue = entry.displayValue;
          console.log(`Scanned Type: ${scannedType}`);
          console.log(`Scanned Value: ${scannedValue}`);
          globalctx?.insertScan({ type: scannedType, value: scannedValue! });
          scannerActive(false);
          console.log("Scanner Deactivated!");
        }
      }}
      onError={(error) => {
        console.error("Error scanning barcodes:", error);
      }}
    />
  );

  

  */
}
