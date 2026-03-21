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
          title: "All Products",
          headerShown: true,
          headerStyle: {
            backgroundColor: "#25292e",
          },
          headerTintColor: "#fff",
        }}
      />
      <Stack.Screen
        name="[productId]"
        options={{
          title: "View Product",
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
