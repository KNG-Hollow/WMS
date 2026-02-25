// SPDX-License-Identifier: GPL-3.0

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectAppActive } from "../appSlice";
import { insertError, selectErrorActive } from "../errors/errorSlice";
import { selectRole, selectUserState } from "../accounts/accountSlice";
import type { Inventory, Item, ItemInfo, LocationData } from "../../app/models";
import { GetItem, GetItemsList } from "../../services/itemApi";
import {
  DeleteInventory,
  GetInventory,
  UpdateInventory,
} from "../../services/inventoryApi";
import DOMPurify from "dompurify";

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
        insertError([
          "Unauthorized!",
          "You do not have the proper credentials to access this information",
          true,
        ]),
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
          insertError([
            "Failed To Get Item Info!",
            "Failed To Return An Acceptable Item Information Array.",
            true,
          ]),
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
          insertError([
            "Failed To Get Inventory Entry!",
            `Failed To Return An Acceptable Entry Object With ID [${entry?.id}] :: ${err}`,
            true,
          ]),
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
      <div id="search-dropdown" className="flex">
        <label htmlFor="item-area" className="relative right-2">
          Item:
        </label>
        <div>
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
              className="mt-0.5 text-center bg-gray-800 group:relative"
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
        insertError([
          "Api Service Failure",
          `Failed To Get A Successful Response ::\n${err}`,
          true,
        ]),
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
        insertError([
          "Api Service Failure",
          `Failed To Get A Successful Response ::\n${err}`,
          true,
        ]),
      );
    }

    const updatedEntry: Inventory = {
      id: +id!,
      item: item!,
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
        insertError([
          "Api Service Failure",
          `Failed To Update The Database And Get A Successful Response ::\n${err}`,
          true,
        ]),
      );
    }
  };

  return (
    <div className="flex pt-20 pb-20 flex-col items-center">
      <div
        id="form-container"
        className="border-3 items-center border-cyan-600 rounded bg-gray-900 p-20 gap-y-2 flex flex-col"
      >
        <div className="font-bold text-xl mb-5 text-cyan-500">
          <h1>{entry?.item.name}</h1>
        </div>
        <SearchDropdown options={allItemInfo!} />
        <div id="input-total">
          <label htmlFor="total-area" className="relative right-2">
            Total:
          </label>
          <p>{total}</p>
        </div>
        <div id="input-locations" className="flex flex-row">
          <label
            htmlFor="locations-area"
            className="text-center relative right-2"
          >
            Locations:
          </label>
          <div className="flex">
            <label htmlFor="area-area" className="text-center relative right-2">
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
            <label
              htmlFor="count-area"
              className="text-center relative right-2"
            >
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
          <button onClick={() => handleLocationUpdate()}>Add Location</button>
        </div>
        {locationsIn && (
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
        )}
        <div className="mt-5 flex flex-col gap-y-2">
          <button onClick={() => handleUpdate()}>Submit</button>
          <button onClick={() => handleDelete()}>Delete</button>
          <button onClick={() => navigate(-1)}>Back</button>
        </div>
      </div>
    </div>
  );
}
