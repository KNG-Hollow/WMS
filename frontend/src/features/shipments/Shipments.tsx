// SPDX-License-Identifier: GPL-3.0

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import type { Shipment } from "@/app/models";
import { GetShipments } from "@/services/shipmentApi";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { selectUserState } from "../accounts/accountSlice";
import { selectAppActive } from "../appSlice";
import { insertError, selectErrorActive } from "../errors/errorSlice";

// TODO Color-code ETA Outputs
export default function Shipments() {
  const appActive = useAppSelector(selectAppActive);
  const errorActive = useAppSelector(selectErrorActive);
  const userState = useAppSelector(selectUserState);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [allShipments, setAllShipments] = useState<Shipment[] | null>(null);

  useEffect(() => {
    if (!appActive) {
      navigate("/login");
    }
    if (errorActive) {
      navigate("/error");
    }

    const fetchShipments = async () => {
      let successful = false;

      try {
        const [fetchSuccessful, fetchedShipments] =
          await GetShipments(userState);
        successful = fetchSuccessful;
        if (!successful) {
          throw new Error("Failed to get Shipment array");
        }
        setAllShipments(fetchedShipments);
      } catch (err) {
        console.error("Failed to get shipment array: " + err);
        alert("Failed To Get Shipments");
        dispatch(
          insertError({
            header: "Failed To Get Shipments",
            message: `Failed To Return An Acceptable Shipment Array :: ${err}`,
            errorActive: true,
          }),
        );
      }
    };
    fetchShipments();
  }, [appActive, dispatch, errorActive, navigate, userState]);

  const fmtTimestamp = (time: string) => {
    const date = new Date(time);
    return date.toISOString().split("T")[0];
  };

  return (
    <div className="flex flex-1 justify-center">
      <div className="flex flex-col items-center my-20 gap-y-10 w-5/6 p-20 border-3 border-cyan-600 bg-gray-900">
        <div className="text-2xl font-bold text-cyan-400">
          <h1>Shipment Manager</h1>
        </div>
        <div className="flex flex-col gap-y-5">
          <div className="flex justify-center">
            <div className="flex space-x-2 font-semibold">
              <h2>Entries:</h2>
              <p className="text-cyan-200">
                {allShipments === null ? 0 : allShipments?.length}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-y-2">
            {userState.role === "ADMIN" ? (
              <button onClick={() => navigate("./create")}>
                Create Shipment
              </button>
            ) : null}
            <button onClick={() => navigate(-1)}>Back</button>
          </div>
        </div>
        <div className="w-full border border-cyan-400">
          <table className="w-full">
            <thead className="border-b border-cyan-400">
              <tr>
                <th>Supplier</th>
                <th>ETA</th>
                <th>Payload</th>
              </tr>
            </thead>
            <tbody>
              {allShipments?.map((mapShip: Shipment) => (
                <tr
                  key={mapShip.id}
                  className="border-b text-center font-semibold border-cyan-500"
                >
                  <td>{mapShip.supplier}</td>
                  <td>{fmtTimestamp(mapShip.eta.toLocaleString())}</td>
                  <td>
                    {mapShip.payload.reduce(
                      (prev, curr) => prev + curr.count,
                      0,
                    )}
                  </td>
                  <td>
                    <Link
                      to={`./${mapShip.id}`}
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
