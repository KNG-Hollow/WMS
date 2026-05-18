// SPDX-License-Identifier: GPL-3.0

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import type { ItemGroup, ItemInfo, Shipment } from "@/app/models";
import { GetItemsList } from "@/services/itemApi";
import { GetShipment } from "@/services/shipmentApi";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { selectUserState } from "../accounts/accountSlice";
import { selectAppActive } from "../appSlice";
import { insertError, selectErrorActive } from "../errors/errorSlice";

export default function ViewShipment() {
  const appActive = useAppSelector(selectAppActive);
  const errorActive = useAppSelector(selectErrorActive);
  const userState = useAppSelector(selectUserState);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const [shipment, setShipment] = useState<Shipment>();
  const [itemList, setItemList] = useState<ItemInfo[] | null>(null);

  useEffect(() => {
    if (!appActive) {
      navigate("/login");
    }
    if (errorActive) {
      navigate("/error");
    }

    const fetchShipment = async (id: number) => {
      let successful = false;

      try {
        const [fetchSuccessful, fetchedShipment] = await GetShipment(
          userState,
          id,
        );
        successful = fetchSuccessful;
        if (!successful || fetchedShipment === null) {
          throw new Error("Failed to get Shipment Entry");
        }
        setShipment(fetchedShipment);
      } catch (err) {
        console.error(`Failed to get inventory entry ${id}: ` + err);
        alert(`Failed To Get Shipment Entry: ${id}`);
        dispatch(
          insertError({
            header: "Failed To Get Shipment Entry!",
            message: `Failed To Return An Acceptable Shipment Entry Object With ID [${id}]:\n${err}`,
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
    fetchShipment(+id!);
  }, [appActive, dispatch, errorActive, id, navigate, userState]);

  const fmtTimestamp = (time: string) => {
    const date = new Date(time);
    return date.toISOString().split("T")[0];
  };

  return (
    <div className="flex flex-1 justify-center">
      <div className="flex flex-col border-3 w-5/6 gap-y-10 my-20 rounded border-cyan-600 p-20 bg-gray-900 items-center">
        <div className="flex-col text-xl font-bold text-cyan-500 gap-x-3">
          <div className="flex">
            <h2>Supplier:</h2>
            <p className="text-white relative left-2">{shipment?.supplier}</p>
          </div>
          <div className="flex">
            <h2>ETA:</h2>
            <p className="text-white relative left-2">
              {shipment ? fmtTimestamp(shipment.eta.toLocaleString()) : "..."}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-y-5 w-1/2 items-center">
          <div className="flex gap-x-2 font-semibold">
            <h3>Payload:</h3>
            <h3 className="text-cyan-500">
              {shipment?.payload.reduce((prev, curr) => prev + curr.count, 0)}
            </h3>
          </div>
          <div className="space-y-2 w-full">
            {userState.role === "ADMIN" ? (
              <button className="w-full" onClick={() => navigate("./edit")}>
                Edit
              </button>
            ) : null}
            <button className="w-full" onClick={() => navigate(-1)}>
              Back
            </button>
          </div>
        </div>
        <div className="w-full">
          <table className="w-full">
            <thead>
              <tr>
                <th>Item</th>
                <th>Count</th>
              </tr>
            </thead>
            {shipment && (
              <tbody>
                {shipment.payload.map((ent: ItemGroup) => (
                  <tr
                    key={ent.item_id}
                    className="text-center border-2 border-cyan-400"
                  >
                    <td className="font-semibold">
                      {
                        itemList?.filter((v) => v.id === ent.item_id).at(0)
                          ?.name
                      }
                    </td>
                    <td>{ent.count}</td>
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
