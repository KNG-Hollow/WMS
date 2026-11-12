// SPDX-License-Identifier: GPL-3.0

import { Stack, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function StackLayout() {
  const router = useRouter();
  return (
    <Stack
      screenOptions={{
        headerRight: () => (
          <View className="flex-row mr-2">
            <Pressable onPress={() => router.navigate("/")}>
              <Text className="text-white font-semibold text-lg">Home</Text>
            </Pressable>
          </View>
        ),
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Inventory",
          headerShown: true,
          headerStyle: {
            backgroundColor: "#25292e",
          },
          headerTintColor: "#fff",
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: "Add Inventory",
          headerShown: true,
          headerStyle: {
            backgroundColor: "#25292e",
          },
          headerTintColor: "#fff",
        }}
      />
      <Stack.Screen
        name="all"
        options={{
          title: "All Inventory",
          headerShown: true,
          headerStyle: {
            backgroundColor: "#25292e",
          },
          headerTintColor: "#fff",
        }}
      />
      <Stack.Screen
        name="[inventoryId]"
        options={{
          title: "View Inventory",
          headerShown: true,
          headerStyle: {
            backgroundColor: "#25292e",
          },
          headerTintColor: "#fff",
        }}
      />
    </Stack>
  );
}
