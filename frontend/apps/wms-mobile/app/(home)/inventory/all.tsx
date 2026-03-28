// SPDX-License-Identifier: GPL-3.0

import { GetAllInventory, GetItemsList } from "@/utility/ApiServices";
import { GlobalContext } from "@/utility/Contexts";
import { Inventory, ItemInfo, LocationData } from "@/utility/Models";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { DataTable } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function AllInventory() {
  const globalCtx = useContext(GlobalContext);
  const userData = globalCtx?.userData;
  const router = useRouter();
  const [allInventory, setAllInventory] = useState<Inventory[] | null>(null);
  const [itemsList, setItemsList] = useState<ItemInfo[] | null>(null);
  const [page, setPage] = useState<number>(0);
  const itemsPerPage = 10;
  const from = page * itemsPerPage;
  const to = (page + 1) * itemsPerPage;

  useEffect(() => {
    if (globalCtx?.userData === undefined || !globalCtx?.appActive) {
      router.navigate("/login");
    }

    const fetchInventory = async () => {
      let successful = false;

      try {
        const [fetchSuccessful, fetchedInventory] = await GetAllInventory(
          userData!,
        );
        successful = fetchSuccessful;
        if (!successful) {
          throw new Error("Failed to get Inventory array");
        }
        setAllInventory(fetchedInventory);
      } catch (err) {
        globalCtx?.insertError({
          title: "Failed To Get Accounts",
          message: `Failed To Return An Acceptable Inventory Array ::\n${err}`,
          active: true,
        });
      }
    };

    const fetchItemsList = async () => {
      let successful = false;

      try {
        const [fetchSuccessful, fetchedList] = await GetItemsList();
        successful = fetchSuccessful;
        if (!successful) {
          throw new Error("Failed to get ItemInfo array");
        }
        setItemsList(fetchedList);
      } catch (err) {
        globalCtx?.insertError({
          title: "Failed To Get Item List",
          message: `Failed To Return An Acceptable ItemList Array ::\n${err}`,
          active: true,
        });
      }
    };

    fetchInventory();
    fetchItemsList();
  }, [globalCtx, router, userData]);

  const displayLocations = (data: LocationData[]) => {
    if (data.length < 5) {
      return (
        <View className="">
          {data.map((entry: LocationData) => (
            <View key={entry.area} className="flex-row gap-x-2">
              <Text className="font-medium">{entry.area}</Text>
              <Text>:</Text>
              <Text>{entry.count}</Text>
            </View>
          ))}
        </View>
      );
    } else {
      return (
        <View className="">
          {data
            .slice(0, 2)
            .concat(data.slice(-1))
            .map((entry: LocationData) => (
              <View key={entry.area} className="flex-row gap-x-2">
                <Text className="font-medium">{entry.area}</Text>
                <Text>:</Text>
                <Text>{entry.count}</Text>
              </View>
            ))}
          <Text className="text-center text-cyan-600">...</Text>
        </View>
      );
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex flex-1">
        <SafeAreaView className="flex-1">
          <DataTable className="">
            <DataTable.Header className="">
              <DataTable.Title>Item</DataTable.Title>
              <DataTable.Title>Total</DataTable.Title>
              <DataTable.Title>Locations</DataTable.Title>
            </DataTable.Header>
            <ScrollView className="max-h-fix">
              {allInventory?.map((mapInv: Inventory) => (
                <DataTable.Row key={mapInv.id} className="flex h-24">
                  <DataTable.Cell>
                    <Link
                      className="flex-row"
                      href={{
                        pathname: "/inventory/[inventoryId]",
                        params: {
                          inventoryId: mapInv.id!,
                          itemName: itemsList
                            ?.filter((v) => v.id === mapInv.item_id)
                            .at(0)?.name,
                          itemUPC: itemsList
                            ?.filter((v) => v.id === mapInv.item_id)
                            .at(0)?.upc,
                          jsonData: JSON.stringify(mapInv),
                        },
                      }}
                    >
                      <Text className="font-bold text-cyan-600 mr-0.5">
                        {
                          itemsList
                            ?.filter((v) => v.id === mapInv.item_id)
                            .at(0)?.name
                        }
                      </Text>
                      <Ionicons
                        style={{ color: "#0891b2" }}
                        name="navigate"
                        size={12}
                      />
                    </Link>
                  </DataTable.Cell>
                  <DataTable.Cell>{mapInv.total}</DataTable.Cell>
                  <DataTable.Cell className="my-auto">
                    <Pressable
                      className=""
                      onPress={() =>
                        router.navigate({
                          pathname: "/inventory/[inventoryId]",
                          params: {
                            inventoryId: mapInv.id!,
                            itemName: itemsList
                              ?.filter((v) => v.id === mapInv.item_id)
                              .at(0)?.name,
                            itemUPC: itemsList
                              ?.filter((v) => v.id === mapInv.item_id)
                              .at(0)?.upc,
                            jsonData: JSON.stringify(mapInv),
                          },
                        })
                      }
                    >
                      {displayLocations(mapInv.locations)}
                    </Pressable>
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </ScrollView>
          </DataTable>
        </SafeAreaView>
        <SafeAreaView>
          {allInventory ? (
            <DataTable.Pagination
              className=""
              page={page}
              numberOfPages={Math.floor(allInventory!.length / itemsPerPage)}
              onPageChange={(page) => setPage(page)}
              label={`${from + 1}-${to} of ${allInventory?.length}`}
            />
          ) : null}
        </SafeAreaView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
