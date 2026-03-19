// SPDX-License-Identifier: GPL-3.0

import CamScanner from "@/components/CamScanner";
import { GetItemsList } from "@/utility/ApiServices";
import { GlobalContext } from "@/utility/GlobalContext";
import { ItemInfo } from "@/utility/Models";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
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
    if (scannerValue !== undefined) {
      setProductValue(scannerValue.value);
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

  const handleBarcodeSubmit = () => {
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
        count: tempItem.at(0)!.count,
      },
    ]);

    globalctx?.resetScan();
    setProductValue("");
  };

  const handleTextSubmit = () => {
    const tempItem = productList!.filter(
      (item) => item.name === productIn.trim(),
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
          count: tempItem.at(0)!.count,
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

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex flex-1 items-center">
        <SafeAreaView className="h-1/5 w-11/12 mt-5">
          <TextInput
            className="border-2 border-cyan-600"
            onChangeText={(text: string) => {
              if (scannerValue) {
                handleBarcodeSubmit();
                return;
              }
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
            <Picker
              selectedValue={productIn}
              onValueChange={(v, i) => {
                // Runs when item is selected
                setProductValue(v);
              }}
              mode="dropdown"
              numberOfLines={10}
            >
              {filteredOptions &&
                filteredOptions.map((option, index) => (
                  <Picker.Item
                    key={index}
                    label={option.name}
                    value={option.name}
                  />
                ))}
            </Picker>
          )}
        </SafeAreaView>

        {productQueue.length > 0 ? (
          <SafeAreaView className=" w-11/12 flex flex-1 items-center border-2 border-cyan-600">
            <Text className="font-semibold">Queue</Text>
            <DataTable className="">
              <DataTable.Header className="">
                <DataTable.Title>
                  <Text className="font-bold">Name</Text>
                </DataTable.Title>
                <DataTable.Title>
                  <Text className="font-bold">Count</Text>
                </DataTable.Title>
              </DataTable.Header>
              {productQueue.map((mapQueue, mapIndex) => (
                <DataTable.Row key={mapIndex} className="flex">
                  <DataTable.Cell className="">
                    <Text>{mapQueue.name}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell className="">
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
                          console.log("Increment Button Pressed!");
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
          <SafeAreaView className="w-3/4 absolute bottom-20">
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
