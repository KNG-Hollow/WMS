// SPDX-License-Identifier: GPL-3.0

import { GetItems } from "@/utility/ApiServices";
import { GlobalContext } from "@/utility/GlobalContext";
import { Item } from "@/utility/Models";
import { Link, useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { DataTable } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function AllItems() {
  const globalCtx = useContext(GlobalContext);
  const userData = globalCtx?.userData;
  const router = useRouter();
  const [allItems, setAllItems] = useState<Item[] | null>(null);

  useEffect(() => {
    if (globalCtx?.userData === undefined || !globalCtx?.appActive) {
      router.navigate("/login");
    }

    const fetchItems = async () => {
      let successful = false;

      try {
        const [fetchSuccessful, fetchedItems] = await GetItems(userData!);
        successful = fetchSuccessful;
        if (!successful) {
          throw new Error("Failed to get Item array");
        }
        setAllItems(fetchedItems);
      } catch (err) {
        globalCtx?.insertError({
          title: "Failed To Get Items",
          message: `Failed To Return An Acceptable Item Array :: ${err}`,
          active: true,
        });
      }
    };
    fetchItems();
  }, [globalCtx, router, userData]);

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex flex-1">
        <SafeAreaView className="">
          <DataTable className="">
            <DataTable.Header className="">
              <DataTable.Title>UPC</DataTable.Title>
              <DataTable.Title>Name</DataTable.Title>
              <DataTable.Title>Description</DataTable.Title>
              <DataTable.Title>{""}</DataTable.Title>
            </DataTable.Header>
            {allItems?.map((mapItem: Item) => (
              <DataTable.Row key={mapItem.id} className="">
                <DataTable.Cell>{mapItem.upc}</DataTable.Cell>
                <DataTable.Cell>{mapItem.name}</DataTable.Cell>
                <DataTable.Cell>{mapItem.description}</DataTable.Cell>
                <DataTable.Cell>
                  <Link
                    className="underline font-bold text-cyan-600"
                    href={{
                      pathname: "/products/[productId]",
                      params: { productId: mapItem.id! },
                    }}
                  >
                    View
                  </Link>
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </SafeAreaView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
