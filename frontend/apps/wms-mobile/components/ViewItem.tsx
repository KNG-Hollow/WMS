// SPDX-License-Identifier: GPL-3.0

import { Text } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function ViewItem() {
  return (
    <SafeAreaProvider>
      <SafeAreaView>
        <Text>View Item Route</Text>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
