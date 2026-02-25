// SPDX-License-Identifier: GPL-3.0

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectAppActive } from "../appSlice";
import { insertError, selectErrorActive } from "../errors/errorSlice";
import type { Box } from "../../app/models";
import { selectRole, selectUserState } from "../accounts/accountSlice";
import { DeleteBox, GetAllBoxes } from "../../services/boxApi";

export default function Boxes() {
  const userRole = useAppSelector(selectRole);
  const userState = useAppSelector(selectUserState);
  const appActive = useAppSelector(selectAppActive);
  const errorActive = useAppSelector(selectErrorActive);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [allBoxes, setAllBoxes] = useState<Box[]>([]);

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
          insertError([
            "Failed To Get Boxes",
            `Failed To Return An Acceptable Boxes Array ::\n${err}`,
            true,
          ]),
        );
      }
    };
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
        insertError([
          "Api Service Failure",
          `Failed To Delete From Database And Get A Successful Response ::\n${err}`,
          true,
        ]),
      );
    }
  };

  return (
    <div className="flex w-full py-20 justify-center">
      <div className="mt-10 w-11/12 border-3 border-cyan-600 rounded bg-gray-900 p-20 items-center gap-y-2 flex flex-col">
        <div className="font-extrabold mb-10 text-center text-xl text-cyan-500">
          <h1>Boxes Manager</h1>
        </div>
        <div className="mt-10 mb-20 flex w-11/12 flex-col self-center">
          <div id="boxes-container">
            <div
              id="boxes-info-container"
              className="rounded-2xl flex flex-col items-center border-2 border-cyan-500 py-5"
            >
              <div id="boxes-info" className="mb-3">
                <div className="flex space-x-1">
                  <h2>Boxes:</h2>
                  <p className="text-cyan-200">{allBoxes.length}</p>
                </div>
              </div>
              <div
                id="boxes-info-buttons"
                className="flex flex-row justify-center gap-x-5"
              >
                <button onClick={() => navigate(-1)}>Back</button>
                <button onClick={() => navigate("/boxes/create")}>
                  New Box
                </button>
              </div>
            </div>
            <div
              id="table-container"
              className="mt-10 mb-10 rounded-l border-2 border-cyan-500 py-5"
            >
              <div>
                <div className="flex flex-col items-center justify-center">
                  <div
                    id="table-text"
                    className="w-11/12 border-2 border-cyan-500 py-3"
                  >
                    <h2 className="font-bold text-center">All Boxes:</h2>
                  </div>
                </div>
                <div className="mt-5 flex flex-col items-center justify-center">
                  <table className="w-11/12">
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
                          className="border-2 border-cyan-400"
                        >
                          <td>{mapBox.upc}</td>
                          <td key={mapBox.id}>
                            <Link
                              to={`../items/${mapBox.item.id}`}
                              className="hover:text-cyan-400"
                            >
                              {mapBox.item.name}
                            </Link>
                          </td>
                          <td>{mapBox.dimensions}</td>
                          <td>{mapBox.count}</td>
                          {userRole === "ADMIN" || userRole === "MANAGER" ? (
                            <td className="flex">
                              <button
                                onClick={() => navigate(`./${mapBox.id}/edit`)}
                              >
                                Edit
                              </button>
                              <button onClick={() => handleDelete(mapBox.id!)}>
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
      </div>
    </div>
  );
}
