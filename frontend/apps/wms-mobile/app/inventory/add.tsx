// SPDX-License-Identifier: GPL-3.0

import CamScanner from "@/components/CamScanner";
import {
  GetInventory,
  GetItemsList,
  UpdateInventory,
} from "@/utility/ApiServices";
import { GlobalContext } from "@/utility/GlobalContext";
import { Inventory, ItemInfo } from "@/utility/Models";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useContext, useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { DataTable } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

// TODO Remove scannedCode from global context when exiting route
// TODO Submit product query on barcode scan
// TODO Add view showing queue of items about to be added to inventory, allow adjustment of amounts
// TODO Fix Increment Button
export default function AddInventory() {
  const globalctx = useContext(GlobalContext);
  const userData = globalctx?.userData;
  const scannerValue = globalctx?.scannedCode;
  const router = useRouter();
  const [scannerActive, setScannerActive] = useState<boolean>(false);
  const [productIn, setProductValue] = useState<string>("");
  const [productList, setProductList] = useState<ItemInfo[]>();
  const [filteredOptions, setFilteredOptions] = useState<ItemInfo[]>();
  const [productQueue, setProductQueue] = useState<ItemInfo[]>([]);

  useEffect(() => {
    if (globalctx?.userData === undefined || !globalctx?.appActive) {
      router.navigate("/inventory");
    }
    if (globalctx?.errorData?.active) {
      router.navigate("/error");
    }

    const fetchProductList = async () => {
      console.log("Attempting to get product list...");
      try {
        const [exists, productData] = await GetItemsList(userData!);
        console.log(
          `Exists: ${exists}, Products in list: ${productData.length}`,
        );

        if (!exists || productData.length < 1) {
          alert("Failed To Get Item List!");
        }
        setProductList(productData);
      } catch (err) {
        console.error(err);
        globalctx?.insertError({
          title: "Failed To Get Item List!",
          message: `${err}`,
          active: true,
        });
      }
    };
    fetchProductList();
  }, [globalctx, router, scannerValue, userData]);

  const handleBarcodeSubmit = useCallback(() => {
    const tempItem = productList!.filter(
      (item) => item.upc === globalctx?.scannedCode?.value,
    );
    if (tempItem.length === 0) {
      alert("Product Barcode Not Recognized!");
      globalctx?.resetScan();
      setProductValue("");
      return;
    }
    setProductQueue([
      ...productQueue,
      {
        id: tempItem.at(0)!.id,
        upc: tempItem.at(0)!.upc,
        name: tempItem.at(0)!.name,
        count: (tempItem.at(0)!.count = 0),
      },
    ]);

    globalctx?.resetScan();
    setProductValue("");
  }, [globalctx, productList, productQueue]);

  useEffect(() => {
    if (scannerValue !== undefined) {
      handleBarcodeSubmit();
    }
  }, [handleBarcodeSubmit, scannerValue]);

  const handleTextSubmit = (productName: string) => {
    const tempItem = productList!.filter(
      (item) => item.name === productName.trim(),
    );
    if (tempItem.length === 0) {
      alert("Product Name Not Recognized!");
      return;
    }
    setProductQueue([
      ...productQueue,
      {
        id: tempItem.at(0)!.id,
        upc: tempItem.at(0)!.upc,
        name: tempItem.at(0)!.name,
        count: (tempItem.at(0)!.count = 0),
      },
    ]);

    globalctx?.resetScan();
    setProductValue("");
  };

  const handleQueueSubmit = () => {
    if (scannerValue) {
      const tempItem = productList!.filter((item) => item.upc === productIn);
      if (tempItem.length === 0) {
        alert("Product Barcode Not Recognized!");
        globalctx?.resetScan();
        setProductValue("");
        return;
      }
      setProductQueue([
        ...productQueue,
        {
          id: tempItem.at(0)!.id,
          upc: tempItem.at(0)!.upc,
          name: tempItem.at(0)!.name,
          count: (tempItem.at(0)!.count = 0),
        },
      ]);
    } else {
      const tempItem = productList!.filter(
        (item) => item.name === productIn.trim(),
      );
      if (tempItem.length === 0) {
        alert("Product Name Not Recognized!");
        globalctx?.resetScan();
        setProductValue("");
        return;
      }
      setProductQueue([
        ...productQueue,
        {
          id: tempItem.at(0)!.id,
          upc: tempItem.at(0)!.upc,
          name: tempItem.at(0)!.name,
          count: (tempItem.at(0)!.count = 0),
        },
      ]);
    }

    globalctx?.resetScan();
    setProductValue("");
  };

  const handleQueueRemove = (index: number) => {
    console.log("Remove Button Pressed!");
    setProductQueue((prevQueue) => {
      return prevQueue.filter((v, i) => v !== prevQueue[index]);
    });
  };

  const handleCountChange = (index: number, newValue: number) => {
    setProductQueue((prevQueue) => {
      const newQueue = [...prevQueue];
      newQueue[index] = {
        ...newQueue[index],
        count: newValue,
      };
      return newQueue;
    });
  };

  const handleDecrement = (index: number) => {
    setProductQueue((prevQueue) => {
      const newQueue = [...prevQueue];
      if (newQueue[index].count > 0) {
        // Prevent count from going below 0
        newQueue[index].count -= 1;
      }
      return newQueue;
    });
  };

  const handleIncrement = (index: number) => {
    setProductQueue((prevQueue) => {
      const newQueue = [...prevQueue];
      newQueue[index].count += 1;
      return newQueue;
    });
  };

  const handleSubmit = async () => {
    if (productQueue.length === 0) {
      alert("Queue Is Empty!");
      return;
    } else if (productQueue.filter((v) => v.count < 1).length > 0) {
      alert("Unit Count Cannot Be Empty, Please Adjust");
      return;
    }

    console.log("Attempting to update inventory...");
    try {
      for (const entry of productQueue) {
        const [getSuccess, prevInv] = await GetInventory(userData!, entry.id);
        if (!getSuccess || prevInv === null) {
          console.error(`Failed To Get Inventory At Id:  ${entry.id}`);
          return;
        }
        let prevLocation = prevInv.locations.find((v) => v.area === "Stock");
        if (prevLocation) {
          prevLocation.count += entry.count;
        } else {
          console.error("Stock Location Not In Database Entry");
          return;
        }
        const updatedInv: Inventory = {
          id: prevInv.id,
          item: prevInv.item,
          total: prevInv.total + entry.count,
          locations: prevInv.locations,
        };
        const [updateSuccess, response] = await UpdateInventory(
          entry.id,
          userData!,
          updatedInv,
        );
        if (!updateSuccess || response === null) {
          console.error("Update Response Not Successful");
          return;
        }
        console.log("Updated Stock: ", entry.name);
      }
      setProductQueue([]);
      console.log("Successfully Processed Queue!");
      alert("Successfully Processed Queue!");
    } catch (err) {
      console.error("ApiService Failed To Update Inventory: " + err);
      globalctx?.insertError({
        title: "Failed To Update Inventory",
        message: `${err}`,
        active: true,
      });
    }
  };

  const SearchDropdown: React.FC<{ options: ItemInfo[] }> = ({ options }) => {
    return (
      <FlatList
        className=""
        data={filteredOptions}
        renderItem={({ item }) => (
          <Pressable
            className="border-2 border-cyan-700 items-center py-1 bg-slate-300"
            onPress={() => {
              handleTextSubmit(item.name);
            }}
          >
            <Text className="font-semibold">{item.name}</Text>
          </Pressable>
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex flex-1 items-center">
        <SafeAreaView className="h-1/5 w-11/12 mt-5">
          <TextInput
            className="border-2 border-cyan-600"
            onChangeText={(text: string) => {
              setProductValue(text);
              setFilteredOptions(
                productList?.filter((option) =>
                  option.name
                    .toLocaleLowerCase()
                    .includes(text.toLocaleLowerCase()),
                ),
              );
            }}
            value={productIn}
            placeholder="Input Text or Scan Barcode..."
            placeholderTextColor="grey"
            autoCapitalize="none"
            onSubmitEditing={handleQueueSubmit}
          />
          {productIn && !scannerValue && (
            <SearchDropdown options={filteredOptions!} />
          )}
        </SafeAreaView>

        {productQueue.length > 0 ? (
          <SafeAreaView className="bg-slate-400 w-11/12 mb-10 flex flex-1 items-center border-2 border-cyan-500">
            <Text className="w-full py-2 border-b-2 border-cyan-500 text-center font-semibold">
              Queue
            </Text>
            <DataTable className="flex-1">
              <DataTable.Header className="">
                <DataTable.Title>
                  <Text className="font-bold">Name</Text>
                </DataTable.Title>
                <DataTable.Title>
                  <Text className="font-bold">Count</Text>
                </DataTable.Title>
              </DataTable.Header>
              <ScrollView className="max-h-fix">
                {productQueue.map((mapQueue, mapIndex) => (
                  <DataTable.Row key={mapIndex} className="flex">
                    <DataTable.Cell className="">
                      <Text>{mapQueue.name}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell className="justify-center">
                      <View className="items-center flex-row">
                        <Pressable
                          className="py-1 px-3 rounded-full bg-cyan-500"
                          onPress={() => handleDecrement(mapIndex)}
                        >
                          <Text className="font-extrabold">-</Text>
                        </Pressable>
                        <TextInput
                          className="border mx-2"
                          onChangeText={(text: string) =>
                            handleCountChange(mapIndex, parseInt(text) || 0)
                          }
                          value={mapQueue.count.toString()}
                          placeholder="0"
                          placeholderTextColor="#fff"
                          keyboardType="number-pad"
                          submitBehavior="blurAndSubmit"
                        />
                        <Pressable
                          className="py-1 px-3 rounded-full bg-cyan-500"
                          onPress={() => {
                            handleIncrement(mapIndex);
                          }}
                        >
                          <Text className="font-extrabold">+</Text>
                        </Pressable>
                      </View>
                    </DataTable.Cell>
                    <DataTable.Cell className="justify-end right-4">
                      <Pressable onPress={() => handleQueueRemove(mapIndex)}>
                        <Ionicons name="trash" color="red" size={24} />
                      </Pressable>
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}
              </ScrollView>
              <Pressable
                className="self-center top-5  bg-cyan-600 rounded p-2"
                onPress={handleSubmit}
              >
                <Text>Submit</Text>
              </Pressable>
            </DataTable>
          </SafeAreaView>
        ) : null}

        {scannerActive ? (
          <CamScanner
            scannerActive={setScannerActive}
            type={scannerValue?.type!}
            value={scannerValue?.value!}
          />
        ) : (
          <SafeAreaView className="w-3/4 mt-auto">
            <Pressable
              className="bg-cyan-600 justify-center rounded p-3 flex-row gap-x-1"
              onPress={() => {
                console.log("Scanner Activated!");
                setScannerActive(true);
              }}
            >
              <Text className="text-white font-semibold">Activate Scanner</Text>
              <Ionicons name="barcode" color="white" size={22} />
            </Pressable>
          </SafeAreaView>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
