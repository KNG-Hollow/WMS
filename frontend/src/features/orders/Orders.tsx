// SPDX-License-Identifier: GPL-3.0

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import type { Order } from "@/app/models";
import { GetAllOrders } from "@/services/orderApi";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { selectUserState } from "../accounts/accountSlice";
import { selectAppActive } from "../appSlice";
import { insertError, selectErrorActive } from "../errors/errorSlice";

export default function Orders() {
  const appActive = useAppSelector(selectAppActive);
  const errorActive = useAppSelector(selectErrorActive);
  const userState = useAppSelector(selectUserState);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [allOrders, setAllOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    if (!appActive) {
      navigate("/login");
    }
    if (errorActive) {
      navigate("/error");
    }

    const fetchOrders = async () => {
      let successful = false;

      try {
        const [fetchSuccessful, fetchedOrders] = await GetAllOrders(userState);
        successful = fetchSuccessful;
        if (!successful) {
          throw new Error("Failed to get Order array");
        }
        setAllOrders(fetchedOrders);
      } catch (err) {
        console.error("Failed to get order array: " + err);
        alert("Failed To Get Orders");
        dispatch(
          insertError({
            header: "Failed To Get Orders",
            message: `Failed To Return An Acceptable Orders Array ::\n${err}`,
            errorActive: true,
          }),
        );
      }
    };
    fetchOrders();
  }, [appActive, dispatch, errorActive, navigate, userState]);

  const fmtTimestamp = (time: string) => {
    const date = new Date(time);
    return date.toISOString().split("T")[0];
  };

  return (
    <div className="flex flex-1 justify-center">
      <div className="flex flex-col rounded items-center my-20 p-20 border-3 bg-gray-900 border-cyan-600 w-5/6 gap-y-10">
        <div className="text-cyan-500 text-center text-2xl font-semibold">
          <h1>Order Manager</h1>
        </div>
        <div className="flex flex-col gap-y-5">
          <div className="flex justify-center">
            <div className="flex space-x-1">
              <h2>Entries:</h2>
              <p className="text-cyan-200">
                {allOrders === null ? 0 : allOrders?.length}
              </p>
            </div>
          </div>
          <div className="flex flex-col space-y-1 justify-center">
            {userState.role === "ADMIN" && (
              <button onClick={() => navigate("./create")}>New Order</button>
            )}
          </div>
        </div>
        <div className="w-full border border-cyan-400">
          <table className="w-full">
            <thead className="border-b border-cyan-400">
              <tr>
                <th>Customer</th>
                <th>Piece Count</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {// TODO Limit 10 Entries Per View
              allOrders?.map((mapOrder: Order) => (
                <tr
                  key={mapOrder.id}
                  className="border-b text-center font-semibold border-cyan-400"
                >
                  <td className="">{mapOrder.customer.username}</td>
                  <td>
                    {mapOrder.payload.reduce(
                      (prev, curr) => prev + curr.count,
                      0,
                    )}
                  </td>
                  <td>{fmtTimestamp(mapOrder.timeOrdered.toLocaleString())}</td>
                  <td className="border-l border-cyan-400">
                    <Link
                      to={`./${mapOrder.id}`}
                      className="text-cyan-500 hover:text-green-500"
                    >
                      {`>`}
                    </Link>
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
