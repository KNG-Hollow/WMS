// SPDX-License-Identifier: GPL-3.0

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import type { Inventory, Item, ItemInfo, LocationData } from "@/app/models";
import {
  DeleteInventory,
  GetInventory,
  UpdateInventory,
} from "@/services/inventoryApi";
import { GetItem, GetItemsList } from "@/services/itemApi";
import DOMPurify from "dompurify";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { selectRole, selectUserState } from "../accounts/accountSlice";
import { selectAppActive } from "../appSlice";
import { insertError, selectErrorActive } from "../errors/errorSlice";

// TODO Replace Header item_id with Item's Name

export default function EditInventory() {
  const userRole = useAppSelector(selectRole);
  const appActive = useAppSelector(selectAppActive);
  const errorActive = useAppSelector(selectErrorActive);
  const userState = useAppSelector(selectUserState);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [item, setItem] = useState<Item>();
  const [itemNameIn, setItemNameValue] = useState<string>("");
  const [allItemInfo, setAllItemInfo] = useState<ItemInfo[]>();
  const [itemInfo, setItemInfo] = useState<ItemInfo>();
  const [total, setTotal] = useState<number>(0);
  const [areaIn, setAreaValue] = useState<string>("");
  const [countIn, setCountValue] = useState<number>(0);
  const [locationsIn, setLocationsValue] = useState<LocationData[]>();
  const [entry, setEntry] = useState<Inventory>();
  const { id } = useParams();

  useEffect(() => {
    if (userRole !== "MANAGER" && userRole !== "ADMIN") {
      dispatch(
        insertError({
          header: "Unauthorized!",
          message:
            "You do not have the proper credentials to access this information",
          errorActive: true,
        }),
      );
    }
    if (!appActive) {
      navigate("/login");
    }
    if (errorActive) {
      navigate("/error");
    }

    const fetchItemList = async () => {
      let successful = false;

      try {
        const [fetchSuccessful, fetchedInfo] = await GetItemsList(userState);
        successful = fetchSuccessful;
        if (!successful || fetchedInfo === null) {
          throw new Error("Failed to get item names");
        }
        setAllItemInfo(fetchedInfo);
      } catch (err) {
        console.error(`Failed to get item names: \n${err}`);
        alert("Failed Item Names!");
        dispatch(
          insertError({
            header: "Failed To Get Item Info!",
            message: "Failed To Return An Acceptable Item Information Array.",
            errorActive: true,
          }),
        );
      }
    };

    const fetchEntry = async (id: number) => {
      let successful = false;

      try {
        const [fetchSuccessful, fetchedEntry] = await GetInventory(
          userState,
          id,
        );
        successful = fetchSuccessful;
        if (!successful || fetchedEntry === null) {
          throw new Error("Failed to get box");
        }
        setTotal(fetchedEntry.total);
        setLocationsValue(fetchedEntry.locations);
        setEntry(fetchedEntry);
      } catch (err) {
        console.error(`Failed To Get Inventory Entry ${id}: ` + err);
        alert(`Failed To Get Box: ${id}`);
        dispatch(
          insertError({
            header: "Failed To Get Inventory Entry!",
            message: `Failed To Return An Acceptable Entry Object With ID [${entry?.id}] :: ${err}`,
            errorActive: true,
          }),
        );
      }
    };

    fetchItemList();
    fetchEntry(+id!);
  }, [
    appActive,
    dispatch,
    entry?.id,
    errorActive,
    id,
    navigate,
    userRole,
    userState,
  ]);

  // TODO Remove List When Click Focus Is Removed From Dropdown
  const SearchDropdown: React.FC<{ options: ItemInfo[] }> = ({ options }) => {
    const [nameIn, setNameValue] = useState<string>("");
    const [filteredOptions, setFilteredOptions] = useState<ItemInfo[]>(options);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setNameValue(value);
      setFilteredOptions(
        options.filter((option) =>
          option.name.toLowerCase().includes(value.toLowerCase()),
        ),
      );
    };

    return (
      <div id="search-dropdown" className="flex flex-col gap-x-2 items-center">
        <div>
          <label htmlFor="item-area" className="font-semibold">
            Item:
          </label>
        </div>
        <div className="flex items-center left-13 gap-x-5 relative">
          <div className="">
            <input
              className="text-center border-2 group rounded mt-0.5 bg-gray-800"
              type="text"
              value={nameIn}
              onChange={handleChange}
              placeholder="Search..."
            />
            {nameIn && (
              <ul
                id="dropdown"
                className="mt-0.5 absolute w-4/6 text-center bg-gray-800 group:relative z-10"
              >
                {filteredOptions.map((option, index) => (
                  <li
                    key={index}
                    className="cursor-pointer"
                    onClick={() => setItemNameValue(option.name)}
                  >
                    {option.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            onClick={() => {
              setItemInfo(
                filteredOptions
                  .filter((ent) => ent.name.includes(itemNameIn))
                  .at(0),
              );
            }}
          >
            Commit
          </button>
        </div>
      </div>
    );
  };

  const handleLocationUpdate = async () => {
    if (countIn < 1) {
      alert("Location Count Cannot Be Less Than 1!");
      return;
    }
    setTotal(total + countIn);
    const newLocations = locationsIn!.concat({ area: areaIn, count: countIn });
    setLocationsValue(newLocations);
  };

  const handleDelete = async () => {
    let success: boolean;
    let responseId: number;

    try {
      [success, responseId] = await DeleteInventory(userState, +id!);
      if (!success || responseId === null) {
        console.error("Failed to delete inventory entry!");
        throw new Error("Delete Inventory Had Unexpected Response Values!");
      }
      console.log(
        `success: ${success ? "True" : "False"} , entry ID: ${responseId}`,
      );
    } catch (err) {
      console.error("ApiService Failed To Delete Entry: " + err);
      dispatch(
        insertError({
          header: "Api Service Failure",
          message: `Failed To Get A Successful Response ::\n${err}`,
          errorActive: true,
        }),
      );
    }
  };

  const handleUpdate = async () => {
    let success: boolean;
    let responseItem: Item;
    let responseEntry: Inventory;

    if (itemNameIn === "") {
      alert("Item Cannot Be Empty!");
      return;
    }
    if (locationsIn === null) {
      alert("Locations Cannot Be Empty!");
      return;
    }
    if (total === 0) {
      alert("Locations Empty Or Count Failed To Convert!");
      return;
    }

    try {
      [success, responseItem] = await GetItem(userState, itemInfo!.id);
      if (!success || responseItem === null) {
        console.error(
          `success: ${success ? "True" : "False"} , item: ${responseItem}`,
        );
        throw new Error("Get Item Had Unexpected Response Values!");
      }
      console.log(
        `success: ${success ? "True" : "False"} , item: ${responseItem}`,
      );
      setItem(responseItem);
    } catch (err) {
      console.error("ApiService Failed To Get Item: " + err);
      dispatch(
        insertError({
          header: "Api Service Failure",
          message: `Failed To Get A Successful Response ::\n${err}`,
          errorActive: true,
        }),
      );
    }

    const updatedEntry: Inventory = {
      id: +id!,
      item_id: item!.id!,
      total: total,
      locations: locationsIn!,
    };

    console.log("Attempting to update inventory entry...");
    try {
      [success, responseEntry] = await UpdateInventory(
        +id!,
        userState,
        updatedEntry,
      );
      if (!success || responseEntry === null) {
        console.error(
          `success: ${success ? "True" : "False"} , entry: ${responseEntry}`,
        );
        throw new Error("Update Inventory Had Unexpected Response Values!");
      }
      console.log(
        `success: ${success ? "True" : "False"} , entry: ${responseEntry}`,
      );
      navigate(-1);
    } catch (err) {
      console.error("ApiService Failed To Create Inventory Entry: " + err);
      dispatch(
        insertError({
          header: "Api Service Failure",
          message: `Failed To Update The Database And Get A Successful Response ::\n${err}`,
          errorActive: true,
        }),
      );
    }
  };

  return (
    <div className="flex flex-1 flex-col justify-center items-center">
      <div
        id="form-container"
        className="border-3 items-center my-20 w-5/6 border-cyan-600 rounded bg-gray-900 p-20 gap-y-10 flex flex-col"
      >
        <div className="font-bold text-xl text-cyan-500">
          <h1>
            {allItemInfo?.filter((v) => v.id === entry?.item_id).at(0)?.name}
          </h1>
        </div>
        <div className="border-2 rounded border-cyan-600 flex flex-col items-center p-10 gap-y-5">
          <div id="input-total" className="flex gap-x-2 font-semibold">
            <label htmlFor="total-area">Total:</label>
            <p className="text-cyan-500">{total}</p>
          </div>
          <SearchDropdown options={allItemInfo!} />
          <div
            id="input-locations"
            className="flex flex-col items-center gap-y-5"
          >
            <label htmlFor="locations-area" className="font-semibold">
              Insert Location:
            </label>
            <div className="flex gap-x-4">
              <div className="flex items-center gap-x-2">
                <label htmlFor="area-area" className="font-semibold">
                  Area:
                </label>
                <input
                  className="border-2 rounded text-center"
                  type="text"
                  aria-label="area"
                  placeholder="area"
                  onChange={(e) => {
                    const sanitizedValue = DOMPurify.sanitize(e.target.value);
                    setAreaValue(sanitizedValue);
                  }}
                />
              </div>
              <div className="flex items-center gap-x-2">
                <label htmlFor="count-area" className="font-semibold">
                  Count:
                </label>
                <input
                  className="border-2 rounded text-center"
                  type="number"
                  aria-label="count"
                  placeholder="count"
                  onChange={(e) => {
                    setCountValue(e.target.valueAsNumber);
                  }}
                />
              </div>
            </div>
            <button onClick={() => handleLocationUpdate()}>Add Location</button>
          </div>
          {locationsIn && (
            /*
            <div className="text-center border p-2 space-y-2 mt-5">
              <h3 className="font-semibold">Details:</h3>
              <ul>
                {locationsIn.map((mapLocation: LocationData) => (
                  <li>
                    Area: {mapLocation.area}, Location: {mapLocation.count}
                  </li>
                ))}
              </ul>
            </div>
            */
            <div className="border-2 rounded border-cyan-500 w-full">
              <table className="w-full">
                <thead className="border-b-2 border-cyan-500">
                  <th>Area</th>
                  <th>Location</th>
                </thead>
                {locationsIn.map((mapLocation: LocationData) => (
                  <tr className="text-center border-b-2 border-cyan-500">
                    <td>{mapLocation.area}</td>
                    <td>{mapLocation.count}</td>
                  </tr>
                ))}
              </table>
            </div>
          )}
          <div className="mt-5 flex flex-col gap-y-2">
            <button onClick={() => handleUpdate()}>Submit</button>
            <button onClick={() => handleDelete()}>Delete</button>
            <button onClick={() => navigate(-1)}>Back</button>
          </div>
        </div>
      </div>
    </div>
  );
}
