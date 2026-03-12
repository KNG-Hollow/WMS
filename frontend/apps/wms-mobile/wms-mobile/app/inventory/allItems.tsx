// SPDX-License-Identifier: GPL-3.0

import { Text } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function AllItems() {
  return (
    <SafeAreaProvider>
      <SafeAreaView>
        <Text>All Items Route</Text>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
