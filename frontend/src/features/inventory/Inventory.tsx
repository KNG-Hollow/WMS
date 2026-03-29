// SPDX-License-Identifier: GPL-3.0

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import type { Inventory, ItemInfo, LocationData } from "@/app/models";
import { GetAllInventory } from "@/services/inventoryApi";
import { GetItemsList } from "@/services/itemApi";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { selectUserState } from "../accounts/accountSlice";
import { selectAppActive } from "../appSlice";
import { insertError, selectErrorActive } from "../errors/errorSlice";

// TODO Link Location Data To Edit Mode
export default function Inventory() {
  const appActive = useAppSelector(selectAppActive);
  const errorActive = useAppSelector(selectErrorActive);
  const userState = useAppSelector(selectUserState);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [allInventory, setAllInventory] = useState<Inventory[] | null>(null);
  const [itemList, setItemList] = useState<ItemInfo[] | null>(null);

  useEffect(() => {
    if (!appActive) {
      navigate("/login");
    }
    if (errorActive) {
      navigate("/error");
    }

    const fetchInventory = async () => {
      let successful = false;

      try {
        const [fetchSuccessful, fetchedInventory] =
          await GetAllInventory(userState);
        successful = fetchSuccessful;
        if (!successful) {
          throw new Error("Failed to get Inventory array");
        }
        setAllInventory(fetchedInventory);
      } catch (err) {
        console.error("Failed to get inventory array: " + err);
        alert("Failed To Get Inventory");
        dispatch(
          insertError({
            header: "Failed To Get Accounts",
            message: `Failed To Return An Acceptable Inventory Array ::\n${err}`,
            errorActive: true,
          }),
        );
      }
    };

    const fetchItemList = async () => {
      let successful = false;

      try {
        const [fetchSuccessful, fetchedList] = await GetItemsList(userState);
        successful = fetchSuccessful;
        if (!successful) {
          throw new Error("Failed to get item list!");
        }
        setItemList(fetchedList);
      } catch (err) {
        alert("Failed To Get Item List");
        dispatch(
          insertError({
            header: "Failed To Get Item List",
            message: `Failed To Return An Acceptable ItemInfo Array ::\n${err}`,
            errorActive: true,
          }),
        );
      }
    };

    fetchItemList();
    fetchInventory();
  }, [appActive, dispatch, errorActive, navigate, userState]);

  return (
    <div className="flex flex-1 justify-center">
      <div className="flex flex-col rounded items-center my-20 p-20 border-3 bg-gray-900 border-cyan-600 w-5/6 gap-y-10">
        <div className="text-cyan-500 text-center text-2xl font-semibold">
          <h1>Inventory Manager</h1>
        </div>
        <div className="flex flex-col gap-y-5">
          <div className="flex justify-center">
            <div className="flex space-x-1">
              <h2>Entries:</h2>
              <p className="text-cyan-200">
                {allInventory === null ? 0 : allInventory?.length}
              </p>
            </div>
          </div>
          <div className="flex flex-col space-y-1 justify-center">
            <button onClick={() => navigate("./create")}>Add Inventory</button>
            <div className="space-x-2">
              <button onClick={() => navigate("/boxes")}>Box Manager</button>
              <button onClick={() => navigate("/items")}>Item Manager</button>
            </div>
          </div>
        </div>
        <div className="w-full border border-cyan-400">
          <table className="w-full">
            <thead className="border-b border-cyan-400">
              <tr>
                <th>Item</th>
                <th>Total Count</th>
                <th>Locations</th>
              </tr>
            </thead>
            <tbody>
              {allInventory?.map((mapInventory: Inventory) => (
                <tr
                  key={mapInventory.id}
                  className="border-b text-center font-semibold border-cyan-400"
                >
                  <td key={mapInventory.item_id} className="hover:underline">
                    <Link
                      to={`../items/${mapInventory.item_id}`}
                      className="hover:text-cyan-400"
                    >
                      {
                        itemList
                          ?.filter((v) => v.id === mapInventory.item_id)
                          .at(0)?.name
                      }
                    </Link>
                  </td>
                  <td>{mapInventory.total}</td>
                  <td>
                    {mapInventory.locations.map((entry: LocationData) => (
                      <p>
                        {entry.area} : {entry.count}
                      </p>
                    ))}
                  </td>
                  <td className="border-l border-cyan-400">
                    <button
                      onClick={() => {
                        const iteminfo = itemList
                          ?.filter((v) => v.id === mapInventory.item_id)
                          .at(0);
                        if (iteminfo === undefined) {
                          alert("Filter did not work");
                          return;
                        }
                        navigate(`./${mapInventory.id}`, {
                          state: {
                            id: mapInventory.id,
                            itemId: iteminfo.id,
                            itemName: iteminfo.name,
                            itemUPC: iteminfo.upc,
                          },
                        });
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
