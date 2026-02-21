// SPDX-License-Identifier: GPL-3.0

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectAppActive } from "../appSlice";
import { insertError, selectErrorActive } from "../errors/errorSlice";
import { selectUserState } from "../accounts/accountSlice";
import type { Item } from "../../app/models";
import { GetItems } from "../../services/itemApi";

export default function Items() {
  const appActive = useAppSelector(selectAppActive);
  const errorActive = useAppSelector(selectErrorActive);
  const userState = useAppSelector(selectUserState);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [allItems, setAllItems] = useState<Item[] | null>(null);

  useEffect(() => {
    if (!appActive) {
      navigate("/login");
    }
    if (errorActive) {
      navigate("/error");
    }

    const fetchItems = async () => {
      let successful = false;

      try {
        const [fetchSuccessful, fetchedItems] = await GetItems(userState);
        successful = fetchSuccessful;
        if (!successful) {
          throw new Error("Failed to get Item array");
        }
        setAllItems(fetchedItems);
      } catch (err) {
        console.error("Failed to get item array: " + err);
        alert("Failed To Get Items");
        dispatch(
          insertError([
            "Failed To Get Items",
            `Failed To Return An Acceptable Item Array :: ${err}`,
            true,
          ]),
        );
      }
    };
    fetchItems();
  }, [appActive, dispatch, errorActive, navigate, userState]);

  return (
    <div className="py-20 flex justify-center">
      <div className="flex flex-col items-center gap-y-5 w-11/12 justify-center p-20 border-3 border-cyan-600 bg-gray-900">
        <div className="text-2xl font-bold text-cyan-400">
          <h1>Item Manager</h1>
        </div>
        <div className="mt-5 flex flex-col gap-y-2">
          <div className="flex justify-center">
            <div className="flex space-x-1">
              <h2>Entries:</h2>
              <p className="text-cyan-200">
                {allItems === null ? 0 : allItems?.length}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-y-1 mt-2">
            <button onClick={() => navigate(-1)}>Back</button>
            <button onClick={() => navigate("./create")}>Create Item</button>
          </div>
        </div>
        <div className="mt-5 w-full border border-cyan-400">
          <table className="w-full">
            <thead className="border-b border-cyan-400">
              <tr>
                <th>UPC</th>
                <th>Name</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {allItems?.map((mapItem: Item) => (
                <tr
                  key={mapItem.id}
                  className="border-b text-center font-semibold border-cyan-500"
                >
                  <td>{mapItem.upc}</td>
                  <td key={mapItem.id} className="hover:underline">
                    <Link
                      to={`../items/${mapItem.id}`}
                      className="hover:text-cyan-400"
                    >
                      {mapItem.name}
                    </Link>
                  </td>
                  <td>{mapItem.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
