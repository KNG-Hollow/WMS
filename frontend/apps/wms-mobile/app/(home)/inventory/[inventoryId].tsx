// SPDX-License-Identifier: GPL-3.0

import { GlobalContext } from "@/utility/GlobalContext";
import { Inventory, LocationData } from "@/utility/Models";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Text } from "react-native";
import { DataTable } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function ViewInventory() {
  const globalCtx = useContext(GlobalContext);
  const userData = globalCtx?.userData;
  const router = useRouter();
  const { inventoryId, jsonData } = useLocalSearchParams();
  const [entry, setEntry] = useState<Inventory>();

  useEffect(() => {
    if (userData === undefined || !globalCtx?.appActive) {
      router.navigate("/login");
    }

    if (jsonData.length === 0) {
      alert("Data Failed To Transfer");
      globalCtx?.insertError({
        title: "Failed To Transfer Data",
        message: `The inventory data: ${inventoryId} failed to transfer from the previous page`,
        active: true,
      });
      router.navigate("..");
    } else {
      setEntry(JSON.parse(jsonData.toString()));
    }
  }, [globalCtx, inventoryId, jsonData, router, userData]);

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex flex-1 justify-center">
        <SafeAreaView className="self-center items-center">
          <SafeAreaView className="flex-row gap-x-3">
            <Link
              className="underline font-bold text-lg text-cyan-600"
              href={{
                pathname: "/products/[productId]",
                params: { productId: entry?.item.id! },
              }}
            >
              {entry?.item.name}
            </Link>
            <Text className="font-bold text-lg">: :</Text>
            <Link
              className="underline font-bold text-lg text-cyan-600"
              href={{
                pathname: "/products/[productId]",
                params: { productId: entry?.item.id! },
              }}
            >
              {entry?.item.upc}
            </Link>
          </SafeAreaView>
          <Text>{`Total:\t${entry?.total}`}</Text>
        </SafeAreaView>
        <SafeAreaView>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Area</DataTable.Title>
              <DataTable.Title>Count</DataTable.Title>
            </DataTable.Header>
            {entry?.locations.map((mapLocation: LocationData) => (
              <DataTable.Row key={mapLocation.area} className="">
                <DataTable.Cell>{mapLocation.area}</DataTable.Cell>
                <DataTable.Cell>{mapLocation.count}</DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </SafeAreaView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
