// SPDX-License-Identifier: GPL-3.0

import { router } from "expo-router";
import { Pressable, Text } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function AllInventory() {
  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex flex-1 justify-center items-center">
        <SafeAreaView>
          <Text className="font-semibold text-lg">Inventory Manager</Text>
        </SafeAreaView>
        <SafeAreaView className="gap-y-4 w-3/4">
          <Pressable
            className="bg-cyan-600 rounded items-center p-2"
            onPress={() => router.navigate("/products")}
          >
            <Text>All Products</Text>
          </Pressable>
          <Pressable
            className="bg-cyan-600 rounded items-center p-2"
            onPress={() => router.navigate("/inventory/all")}
          >
            <Text>All Inventory</Text>
          </Pressable>
          <Pressable
            className="bg-cyan-600 rounded items-center p-2"
            onPress={() => router.navigate("/inventory/add")}
          >
            <Text>Add Inventory</Text>
          </Pressable>
        </SafeAreaView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
