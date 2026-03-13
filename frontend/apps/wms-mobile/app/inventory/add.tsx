// SPDX-License-Identifier: GPL-3.0

import { Text } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function AddInventory() {
  return (
    <SafeAreaProvider>
      <SafeAreaView>
        <Text>Add Inventory Route</Text>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
