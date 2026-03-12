import { Stack } from "expo-router";

export default function StackLayout() {
  return (
    <Stack>
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
        name="addInv"
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
        name="allInv"
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
        name="allItems"
        options={{
          title: "All Items",
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
