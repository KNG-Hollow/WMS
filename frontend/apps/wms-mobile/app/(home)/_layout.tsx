// SPDX-License-Identifier: GPL-3.0

import { Drawer } from "expo-router/drawer";

export default function Layout() {
  return (
    <Drawer>
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: "Home",
          title: "Home",
        }}
      />
      <Drawer.Screen
        name="inventory"
        options={{
          headerShown: false,
          drawerLabel: "Inventory Manager",
          title: "Inventory Manager",
        }}
      />
      <Drawer.Screen
        name="products"
        options={{
          headerShown: false,
          drawerLabel: "Products",
          title: "All Products",
        }}
      />
      <Drawer.Screen
        name="account"
        options={{
          drawerLabel: "Account",
          title: "Account",
        }}
      />
      <Drawer.Screen
        name="about"
        options={{
          drawerLabel: "About",
          title: "About",
        }}
      />
    </Drawer>

    /*
    <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#0092b8",
          headerStyle: {
            backgroundColor: "#25292e",
          },
          headerShadowVisible: false,
          headerTintColor: "#fff",
          tabBarStyle: {
            backgroundColor: "#25292e",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "home-sharp" : "home-outline"}
                color={color}
                size={24}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="about"
          options={{
            title: "About",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={
                  focused ? "information-circle" : "information-circle-outline"
                }
                color={color}
                size={24}
              />
            ),
          }}
        />
      </Tabs>
    */
  );
}
