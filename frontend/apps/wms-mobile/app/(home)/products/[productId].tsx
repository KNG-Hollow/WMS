// SPDX-License-Identifier: GPL-3.0

import { GetItem } from "@/utility/ApiServices";
import { GlobalContext } from "@/utility/GlobalContext";
import { Item } from "@/utility/Models";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Image, Text } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function ViewItem() {
  const globalCtx = useContext(GlobalContext);
  const userData = globalCtx?.userData;
  const router = useRouter();
  const { productId } = useLocalSearchParams();
  const [item, setItem] = useState<Item | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [weightDisplay, setWeightDisplay] = useState<string | null>(null);

  const imageToBase64 = (imageData: string) => {
    return `data:image/png;base64,${imageData}`;
  };

  const convertWeight = (input: number) => {
    if (input < 1) {
      setWeightDisplay(`${input} oz.`);
    } else {
      setWeightDisplay(`${input} lb.`);
    }
  };

  useEffect(() => {
    if (globalCtx?.userData === undefined || !globalCtx?.activateApp) {
      router.navigate("/login");
    }

    const fetchItem = async (id: number) => {
      let successful = false;

      try {
        const [fetchSuccessful, fetchedItem] = await GetItem(userData!, id);
        successful = fetchSuccessful;
        if (!successful || fetchedItem === null) {
          throw new Error("Failed to get item");
        }
        convertWeight(fetchedItem.weight);
        if (fetchedItem.image) {
          setImageUrl(imageToBase64(fetchedItem.image.data));
        }
        setItem(fetchedItem);
      } catch (err) {
        globalCtx?.insertError({
          title: "Failed To Get Item!",
          message: `Failed To Return An Acceptable Item Object With ID: ${id} \n ${err}`,
          active: true,
        });
      }
    };
    fetchItem(+productId);

    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [globalCtx, imageUrl, productId, router, userData]);

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex flex-1 items-center justify-center">
        {item ? (
          <SafeAreaView className="text-center gap-y-4">
            <Text>
              <Text className="font-semibold">Name:{"\t\t\t\t\t\t\t"}</Text>
              <Text>{item?.name}</Text>
            </Text>
            <Text>
              <Text className="font-semibold">UPC:{"\t\t\t\t\t\t\t\t\t"}</Text>
              <Text>{item?.upc}</Text>
            </Text>
            <Text>
              <Text className="font-semibold">Description:{"\t\t"}</Text>
              <Text>{item?.description}</Text>
            </Text>
            <Text>
              <Text className="font-semibold">Weight:{"\t\t\t\t\t\t"}</Text>
              <Text>{weightDisplay}</Text>
            </Text>
            {imageUrl ? (
              <Image
                className="bg-slate-900 self-center w-60 h-60 mt-6"
                source={{ uri: imageUrl }}
              />
            ) : (
              <Text>Loading Image...</Text>
            )}
          </SafeAreaView>
        ) : (
          <Text>Loading...</Text>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
