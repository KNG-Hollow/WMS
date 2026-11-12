// SPDX-License-Identifier: GPL-3.0

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import type { Box, ItemInfo } from "@/app/models";
import { DeleteBox, GetAllBoxes } from "@/services/boxApi";
import { GetItemsList } from "@/services/itemApi";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { selectRole, selectUserState } from "../accounts/accountSlice";
import { selectAppActive } from "../appSlice";
import { insertError, selectErrorActive } from "../errors/errorSlice";

// TODO Replace item_id With Item's Name

export default function Boxes() {
  const userRole = useAppSelector(selectRole);
  const userState = useAppSelector(selectUserState);
  const appActive = useAppSelector(selectAppActive);
  const errorActive = useAppSelector(selectErrorActive);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [allBoxes, setAllBoxes] = useState<Box[]>([]);
  const [allItemInfo, setItemInfo] = useState<ItemInfo[]>([]);

  useEffect(() => {
    if (!appActive) {
      navigate("/login");
    }
    if (errorActive) {
      navigate("/error");
    }

    const fetchBoxes = async () => {
      let successful = false;

      try {
        const [fetchSuccessful, fetchedBoxes] = await GetAllBoxes(userState);
        successful = fetchSuccessful;
        if (!successful) {
          throw new Error("Failed to get boxes array");
        }
        setAllBoxes(fetchedBoxes);
      } catch (err) {
        console.error("Failed to get boxes array: " + err);
        alert("Failed to get boxes");
        dispatch(
          insertError({
            header: "Failed To Get Boxes",
            message: `Failed To Return An Acceptable Boxes Array ::\n${err}`,
            errorActive: true,
          }),
        );
      }
    };

    const fetchItemList = async () => {
      let successful = false;

      try {
        const [fetchSuccessful, fetchedInfo] = await GetItemsList(userState);
        successful = fetchSuccessful;

        if (!successful) {
          throw new Error("Failed to get Item List!");
        }
        setItemInfo(fetchedInfo);
      } catch (err) {
        console.error("Failed to get item list: " + err);
        alert("Failed To Get Item List!");
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
    fetchBoxes();
  }, [appActive, dispatch, errorActive, navigate, userRole, userState]);

  const handleDelete = async (id: number) => {
    let success: boolean;
    let responseId: number;

    console.log("Attempting to delete item...");
    try {
      [success, responseId] = await DeleteBox(userState, id);
      if (!success || responseId === null) {
        console.error(
          `success: ${success ? "True" : "False"} , item: ${responseId}`,
        );
        throw new Error("Delete Item Had Unexpected Response Values!");
      }
      console.log(
        `success: ${success ? "True" : "False"} , item: ${responseId}`,
      );
      navigate(-1);
    } catch (err) {
      console.error("ApiService Failed To Delete Item: " + err);
      dispatch(
        insertError({
          header: "Api Service Failure",
          message: `Failed To Delete From Database And Get A Successful Response ::\n${err}`,
          errorActive: true,
        }),
      );
    }
  };

  return (
    <div className="flex flex-1 justify-center">
      <div className="flex flex-col my-20 w-5/6 border-3 border-cyan-600 rounded bg-gray-900 p-20 items-center gap-y-20">
        <div className="font-bold text-center text-xl text-cyan-500">
          <h1>Boxes Manager</h1>
        </div>
        <div className="flex flex-col gap-y-10 w-full">
          <div
            id="boxes-info-container"
            className="rounded-2xl flex flex-col items-center border-2 border-cyan-500 py-5 gap-y-3"
          >
            <div id="boxes-info" className="">
              <div className="flex space-x-1">
                <h2>Boxes:</h2>
                <p className="text-cyan-200">{allBoxes.length}</p>
              </div>
            </div>
            <div id="boxes-info-buttons" className="flex flex-row gap-x-2">
              <button onClick={() => navigate(-1)}>Back</button>
              <button onClick={() => navigate("/boxes/create")}>New Box</button>
            </div>
          </div>
          <div
            id="table-container"
            className="flex flex-col gap-y-5 w-full rounded border-2 border-cyan-500 py-5 items-center"
          >
            <div
              id="table-text"
              className="flex border-2 w-4/5 justify-center border-cyan-500 py-3"
            >
              <h2 className="font-semibold text-center">All Boxes:</h2>
            </div>
            <div className="w-full">
              <table className="w-full">
                <thead>
                  <tr>
                    <th>UPC:</th>
                    <th>Item:</th>
                    <th>Dimensions:</th>
                    <th>Count:</th>
                  </tr>
                </thead>
                <tbody>
                  {allBoxes.map((mapBox: Box) => (
                    <tr
                      key={mapBox.id}
                      className="border-2 border-cyan-400 text-center"
                    >
                      <td>{mapBox.upc}</td>
                      <td key={mapBox.id}>
                        <Link
                          to={`../items/${mapBox.item_id}`}
                          className="hover:text-cyan-400"
                        >
                          {
                            allItemInfo
                              .filter((v) => v.id === mapBox.item_id)
                              .at(0)?.name
                          }
                        </Link>
                      </td>
                      <td>{mapBox.dimensions}</td>
                      <td>{mapBox.count}</td>
                      {userRole === "ADMIN" || userRole === "MANAGER" ? (
                        <td className="flex gap-x-1 justify-center border-l-2 border-cyan-500">
                          <button
                            className="w-1/2"
                            onClick={() => navigate(`./${mapBox.id}/edit`)}
                          >
                            Edit
                          </button>
                          <button
                            className="w-1/2"
                            onClick={() => handleDelete(mapBox.id!)}
                          >
                            Delete
                          </button>
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
