// SPDX-License-Identifier: GPL-3.0

import { GetItems } from "@/utility/ApiServices";
import { GlobalContext } from "@/utility/GlobalContext";
import { Item } from "@/utility/Models";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Text } from "react-native";
import { DataTable } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function AllItems() {
  const globalCtx = useContext(GlobalContext);
  const userData = globalCtx?.userData;
  const router = useRouter();
  const [allItems, setAllItems] = useState<Item[] | null>(null);
  const [page, setPage] = useState<number>(0);
  const itemsPerPage = 20;
  const from = page * itemsPerPage;
  const to = (page + 1) * itemsPerPage;

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
        <SafeAreaView className="flex-1">
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
                <DataTable.Cell>
                  <Text className="font-semibold">{mapItem.name}</Text>
                </DataTable.Cell>
                <DataTable.Cell>{mapItem.description}</DataTable.Cell>
                <DataTable.Cell className="justify-end right-4">
                  <Link
                    className="text-cyan-600"
                    href={{
                      pathname: "/products/[productId]",
                      params: { productId: mapItem.id! },
                    }}
                  >
                    <Ionicons name="arrow-forward-circle" size={24} />
                  </Link>
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </SafeAreaView>
        <SafeAreaView>
          {allItems ? (
            <DataTable.Pagination
              className=""
              page={page}
              numberOfPages={Math.floor(allItems!.length / itemsPerPage)}
              onPageChange={(page) => setPage(page)}
              label={`${from + 1}-${to} of ${allItems?.length}`}
            />
          ) : null}
        </SafeAreaView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
