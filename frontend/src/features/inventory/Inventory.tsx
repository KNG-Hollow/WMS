// SPDX-License-Identifier: GPL-3.0

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectAppActive } from "../appSlice";
import { insertError, selectErrorActive } from "../errors/errorSlice";
import type { Inventory, LocationData } from "../../app/models";
import { selectUserState } from "../accounts/accountSlice";
import { GetAllInventory } from "../../services/inventoryApi";

// TODO Link Item's Name To Item Data
// TODO Link Location Data To Edit Mode
export default function Inventory() {
  const appActive = useAppSelector(selectAppActive);
  const errorActive = useAppSelector(selectErrorActive);
  const userState = useAppSelector(selectUserState);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [allInventory, setAllInventory] = useState<Inventory[] | null>(null);

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
          insertError([
            "Failed To Get Accounts",
            `Failed To Return An Acceptable Inventory Array ::\n${err}`,
            true,
          ]),
        );
      }
    };
    fetchInventory();
  }, [appActive, dispatch, errorActive, navigate, userState]);

  return (
    <div className="py-20 flex justify-center-safe">
      <div className="flex flex-col rounded items-center p-20 border-3 bg-gray-900 border-cyan-600 w-11/12 gap-y-3">
        <div className="text-cyan-500 text-center text-2xl font-bold">
          <h1>Inventory Manager</h1>
        </div>
        <div className="mt-5 flex flex-col gap-y-2">
          <div className="flex justify-center">
            <div className="flex space-x-1">
              <h2>Entries:</h2>
              <p className="text-cyan-200">
                {allInventory === null ? 0 : allInventory?.length}
              </p>
            </div>
          </div>
          <div className="flex flex-col space-y-1 mt-2 justify-center">
            <button onClick={() => navigate("./create")}>Add Inventory</button>
            <div className="space-x-2">
              <button onClick={() => navigate("/boxes")}>Box Manager</button>
              <button onClick={() => navigate("/items")}>Item Manager</button>
            </div>
          </div>
        </div>
        <div className="mt-5 w-full border border-cyan-400">
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
                  <td key={mapInventory.item.id} className="hover:underline">
                    <Link
                      to={`../items/${mapInventory.item.id}`}
                      className="hover:text-cyan-400"
                    >
                      {mapInventory.item.name}
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
                  <td>
                    <button
                      onClick={() => navigate(`./${mapInventory.id}/edit`)}
                    >
                      Edit
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
