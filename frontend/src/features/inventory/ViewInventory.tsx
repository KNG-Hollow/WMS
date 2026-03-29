// SPDX-License-Identifier: GPL-3.0

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import type { Inventory, LocationData } from "@/app/models";
import { GetInventory } from "@/services/inventoryApi";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { selectUserState } from "../accounts/accountSlice";
import { selectAppActive } from "../appSlice";
import { insertError, selectErrorActive } from "../errors/errorSlice";

export default function ViewInventory() {
  const appActive = useAppSelector(selectAppActive);
  const errorActive = useAppSelector(selectErrorActive);
  const userState = useAppSelector(selectUserState);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { state } = useLocation() as {
    state?: {
      id?: number | string;
      itemId?: number | string;
      itemName?: string;
      itemUPC?: string;
    };
  };
  const urlId = useParams().id;
  const itemId = state?.itemId;
  const itemName = state?.itemName;
  const itemUPC = state?.itemUPC;
  const [entry, setEntry] = useState<Inventory>();

  useEffect(() => {
    if (!appActive) {
      navigate("/login");
    }
    if (errorActive) {
      navigate("/error");
    }

    const fetchInv = async (id: number) => {
      let successful = false;

      try {
        const [fetchSuccessful, fetchedInv] = await GetInventory(userState, id);
        successful = fetchSuccessful;
        if (!successful || fetchedInv === null) {
          throw new Error("Failed to get Inventory Entry");
        }
        setEntry(fetchedInv);
      } catch (err) {
        console.error(`Failed to get inventory entry ${id}: ` + err);
        alert(`Failed To Get Inventory Entry: ${id}`);
        dispatch(
          insertError({
            header: "Failed To Get Inventory Entry!",
            message: `Failed To Return An Acceptable Inventory Entry Object With ID [${id}]:\n${err}`,
            errorActive: true,
          }),
        );
      }
    };
    fetchInv(+urlId!);
  }, [appActive, dispatch, errorActive, navigate, urlId, userState]);

  return (
    <div className="flex flex-1 justify-center">
      <div className="flex flex-col border-3 w-5/6 gap-y-10 my-20 rounded border-cyan-600 p-20 bg-gray-900 items-center">
        <div className="flex text-xl font-bold text-cyan-500 gap-x-3">
          <Link id="item_link" to={`/items/${itemId}`} className="">
            <h3 className="hover:underline">{itemName}</h3>
          </Link>
          <h1 className="text-white">::</h1>
          <Link id="item_link" to={`/items/${itemId}`} className="">
            <h3 className="hover:underline">{itemUPC}</h3>
          </Link>
        </div>
        <div className="flex flex-col gap-y-5 w-1/2 items-center">
          <div className="flex gap-x-2 font-semibold">
            <h3>Total:</h3>
            <h3 className="text-cyan-500">{entry?.total}</h3>
          </div>
          <div className="">
            <button className="w-full" onClick={() => navigate("./edit")}>
              Edit
            </button>
            <button className="w-full" onClick={() => navigate(-1)}>
              Back
            </button>
          </div>
        </div>
        <div className="w-full">
          <table className="w-full">
            <thead>
              <tr>
                <th>Area</th>
                <th>Count</th>
              </tr>
            </thead>
            {entry && (
              <tbody>
                {entry.locations.map((mapLoc: LocationData) => (
                  <tr
                    key={mapLoc.area}
                    className="text-center border-2 border-cyan-400"
                  >
                    <td className="font-semibold">{mapLoc.area}</td>
                    <td>{mapLoc.count}</td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
