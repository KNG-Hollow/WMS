import { Stack } from "expo-router";

export default function StackLayout() {
  return (
    <Stack>
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
