// SPDX-License-Identifier: GPL-3.0

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import type { Inventory, Item, ItemInfo, LocationData } from "@/app/models";
import { CreateInventory } from "@/services/inventoryApi";
import { GetItem, GetItemsList } from "@/services/itemApi";
import DOMPurify from "dompurify";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { selectRole, selectUserState } from "../accounts/accountSlice";
import { selectAppActive } from "../appSlice";
import { insertError, selectErrorActive } from "../errors/errorSlice";

export default function CreateInventoryForm() {
  const userRole = useAppSelector(selectRole);
  const appActive = useAppSelector(selectAppActive);
  const errorActive = useAppSelector(selectErrorActive);
  const userState = useAppSelector(selectUserState);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [item, setItem] = useState<Item>();
  const [itemNameIn, setItemNameValue] = useState<string>("");
  const [allItemInfo, setAllItemInfo] = useState<ItemInfo[]>([]);
  const [itemInfo, setItemInfo] = useState<ItemInfo>();
  const [total, setTotal] = useState<number>(0);
  const [areaIn, setAreaValue] = useState<string>("");
  const [countIn, setCountValue] = useState<number>(0);
  const [locationsIn, setLocationsValue] = useState<LocationData[]>([]);

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
    fetchItemList();
  }, [appActive, dispatch, errorActive, navigate, userRole, userState]);

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
    //let newLocations: LocationData[] = [];
    //newLocations = locationsIn!.concat({ area: areaIn, count: countIn });
    setTotal((t) => t + countIn);
    setLocationsValue((prev) => prev.concat({ area: areaIn, count: countIn }));
  };

  const handleCreate = async () => {
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
        throw new Error("Get Box Had Unexpected Response Values!");
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
      id: null,
      item_id: item!.id!,
      total: total,
      locations: locationsIn!,
    };

    console.log("Attempting to create inventory entry...");
    try {
      [success, responseEntry] = await CreateInventory(
        userState,
        null,
        updatedEntry.item_id,
        updatedEntry.total,
        updatedEntry.locations,
      );
      if (!success || responseEntry === null) {
        console.error(
          `success: ${success ? "True" : "False"} , entry: ${responseEntry}`,
        );
        throw new Error("Create Inventory Had Unexpected Response Values!");
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
          message: `Failed To Populate The Database And Get A Successful Response ::\n${err}`,
          errorActive: true,
        }),
      );
    }
  };

  const handleRemove = async (loc: LocationData) => {
    setLocationsValue(locationsIn.filter((v) => v !== loc));
    setTotal((t) => t - loc.count);
  };

  return (
    <div className="flex flex-1 flex-col justify-center items-center">
      <div
        id="form-container"
        className="border-3 my-20 items-center w-5/6 border-cyan-600 rounded bg-gray-900 p-20 gap-y-10 flex flex-col"
      >
        <div className="font-semibold text-xl text-cyan-500">
          <h1>Create Entry</h1>
        </div>
        <SearchDropdown options={allItemInfo!} />
        <div id="input-total" className="flex gap-x-2 font-semibold">
          <label htmlFor="total-area">Total:</label>
          <p className="text-cyan-500">{total}</p>
        </div>
        <div
          id="input-locations"
          className="flex flex-col items-center gap-y-10"
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
                value={areaIn}
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
                value={countIn}
                onChange={(e) => {
                  setCountValue(e.target.valueAsNumber);
                }}
              />
            </div>
          </div>
          <button
            onClick={() => {
              handleLocationUpdate();
              setAreaValue("");
              setCountValue(0);
            }}
          >
            Add Location
          </button>
        </div>
        {locationsIn.length > 0 && (
          <div className="text-center border-2 p-5 space-y-2">
            <h3 className="font-semibold border-b-2">Details:</h3>
            {locationsIn.map((mapLocation: LocationData) => (
              <ul className="flex gap-x-10">
                <li>Area: {mapLocation.area}</li>
                <li>Count: {mapLocation.count}</li>
                <li
                  className="text-red-600 underline font-medium cursor-pointer"
                  onClick={() => handleRemove(mapLocation)}
                >
                  Remove
                </li>
              </ul>
            ))}
          </div>
        )}
        <div className="flex flex-col gap-y-2">
          <button onClick={() => handleCreate()}>Submit</button>
          <button onClick={() => navigate(-1)}>Back</button>
        </div>
      </div>
    </div>
  );
}
