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
