// SPDX-License-Identifier: GPL-3.0

import { GetAccount } from "@/utility/ApiServices";
import { GlobalContext } from "@/utility/GlobalContext";
import { Account } from "@/utility/Models";
import { router } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Text } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function ViewAccount() {
  const [account, setAccount] = useState<Account>();
  const globalCtx = useContext(GlobalContext);
  const userId = globalCtx?.userData?.id;

  useEffect(() => {
    if (globalCtx === null || !globalCtx?.appActive) {
      alert("Not Logged In!");
      router.navigate("/");
    }

    const fetchAccount = async (id: number) => {
      let successful = false;

      try {
        const [fetchSuccessful, fetchedAccount] = await GetAccount(id);
        successful = fetchSuccessful;
        if (!successful || fetchedAccount === null) {
          throw new Error("Failed to get account");
        }
        setAccount(fetchedAccount);
      } catch (err) {
        globalCtx?.insertError({
          title: `Failed To Fetch Account: ${userId}`,
          message: `${err}`,
          active: true,
        });
      }
    };

    fetchAccount(userId!);
  }, [globalCtx, userId]);

  function capitalize(str: string | undefined): string {
    if (str === undefined) {
      return "";
    } else {
      return str?.charAt(0).toUpperCase() + str?.slice(1);
    }
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex flex-1 justify-center items-center">
        <SafeAreaView>
          <Text className="font-semibold text-lg mb-20">{`${capitalize(account?.firstname)} ${capitalize(account?.lastname)}`}</Text>
        </SafeAreaView>
        <SafeAreaView className="gap-y-4">
          <Text>
            <Text className="font-semibold">Username: {"\t\t"}</Text>
            <Text>{account?.username}</Text>
          </Text>
          <Text>
            <Text className="font-semibold">Email: {"\t\t\t\t\t\t"}</Text>
            <Text>{account?.email}</Text>
          </Text>
          <Text>
            <Text className="font-semibold">Phone: {"\t\t\t\t\t"}</Text>
            <Text>{account?.phone}</Text>
          </Text>
          <Text>
            <Text className="font-semibold">Role: {"\t\t\t\t\t\t\t"}</Text>
            <Text>{account?.role.Value}</Text>
          </Text>
          <Text>
            <Text className="font-semibold">Created: {"\t\t\t\t"}</Text>
            <Text>{account?.created.toString()}</Text>
          </Text>
        </SafeAreaView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
