// SPDX-License-Identifier: GPL-3.0

import { GlobalContext } from "@/utility/Contexts";
import { useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { useContext } from "react";
import { Pressable, Text, View } from "react-native";

export default function Layout() {
  const globalctx = useContext(GlobalContext);
  const router = useRouter();
  const handleRestart = () => {
    router.navigate("/login");
    setTimeout(() => {
      globalctx?.resetError();
      globalctx?.resetJWT();
      globalctx?.resetUser();
    }, 500);
  };

  return (
    <Drawer
      screenOptions={{
        headerStyle: {
          backgroundColor: "#25292e",
        },
        headerShadowVisible: false,
        headerTintColor: "#fff",
        drawerStyle: {
          backgroundColor: "#0891b2",
        },
        drawerInactiveTintColor: "#fff",
        drawerActiveBackgroundColor: "white",
        drawerActiveTintColor: "#0891b2",
        headerRight: () => (
          <View className="flex-row mr-5">
            <Pressable onPress={handleRestart}>
              <Text className="text-white font-semibold text-lg">Logout</Text>
            </Pressable>
          </View>
        ),
      }}
    >
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
  );
}
