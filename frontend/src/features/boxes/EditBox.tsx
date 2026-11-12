// SPDX-License-Identifier: GPL-3.0

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import type { Box, Dimensions, Item, ItemInfo } from "@/app/models";
import { ConvertDimensions, GetBox, UpdateBox } from "@/services/boxApi";
import { GetItem, GetItemsList } from "@/services/itemApi";
import DOMPurify from "dompurify";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { selectRole, selectUserState } from "../accounts/accountSlice";
import { selectAppActive } from "../appSlice";
import { insertError, selectErrorActive } from "../errors/errorSlice";

// TODO Replace Dropdown item_id With Item's Name

export default function EditBox() {
  const userRole = useAppSelector(selectRole);
  const appActive = useAppSelector(selectAppActive);
  const errorActive = useAppSelector(selectErrorActive);
  const userState = useAppSelector(selectUserState);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [upcIn, setUpcValue] = useState<string>("");
  const [itemNameIn, setItemNameValue] = useState<string>("");
  const [allItemInfo, setAllItemInfo] = useState<ItemInfo[]>();
  const [itemInfo, setItemInfo] = useState<ItemInfo>();
  const [dimensionsIn, setDimensionsValue] = useState<Dimensions>();
  const [countIn, setCountValue] = useState<number>(0);
  const [lengthIn, setLengthValue] = useState<number>(0);
  const [widthIn, setWidthValue] = useState<number>(0);
  const [heightIn, setHeightValue] = useState<number>(0);
  const [item, setItem] = useState<Item>();
  const [box, setBox] = useState<Box>();
  const { id } = useParams();

  useEffect(() => {
    if (userRole !== "ADMIN") {
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

    const fetchBox = async (id: number) => {
      let successful = false;

      try {
        const [fetchSuccessful, fetchedBox] = await GetBox(userState, id);
        successful = fetchSuccessful;
        if (!successful || fetchedBox === null) {
          throw new Error("Failed to get box");
        }
        setCountValue(fetchedBox.count);
        setBox(fetchedBox);
      } catch (err) {
        console.error(`Failed To Get Box ${id}: ` + err);
        alert(`Failed To Get Box: ${id}`);
        dispatch(
          insertError({
            header: "Failed To Get Box!",
            message: `Failed To Return An Acceptable Box Object With ID [${box?.id}] :: ${err}`,
            errorActive: true,
          }),
        );
      }
    };

    fetchItemList();
    fetchBox(+id!);
  }, [
    appActive,
    box?.id,
    dispatch,
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

  const handleUpdate = async () => {
    let success: boolean;
    let responseItem: Item;
    let responseBox: Box;

    if (upcIn.trim() === "") {
      alert("UPC cannot be empty!");
      return;
    }
    if (itemNameIn == "") {
      alert("Item cannot be empty!");
      return;
    }
    if (dimensionsIn === null) {
      alert("Dimensions cannot be empty!");
      return;
    }
    if (countIn === 0) {
      alert("Count cannot be nothing!");
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

    const updatedBox: Box = {
      id: +id!,
      upc: upcIn,
      dimensions: ConvertDimensions(dimensionsIn!),
      count: countIn,
      item_id: item!.id!,
    };

    console.log("Attempting to create Box...");
    try {
      [success, responseBox] = await UpdateBox(+id!, userState, updatedBox);
      if (!success || responseBox === null) {
        console.error(
          `success: ${success ? "True" : "False"} , box: ${responseBox}`,
        );
        throw new Error("Create Box Had Unexpected Response Values!");
      }
      console.log(
        `success: ${success ? "True" : "False"} , box: ${responseBox}`,
      );
      navigate(-1);
    } catch (err) {
      console.error("ApiService Failed To Create Box: " + err);
      dispatch(
        insertError({
          header: "Api Service Failure",
          message: `Failed To Populate The Database And Get A Successful Response ::\n${err}`,
          errorActive: true,
        }),
      );
    }
  };

  return (
    <div className="flex flex-1 justify-center">
      <div
        id="form-container"
        className="border-3 items-center border-cyan-600 rounded bg-gray-900 p-20 gap-y-20 flex flex-col w-5/6 my-20"
      >
        <div className="font-semibold text-xl text-cyan-500">
          <h1>Edit Box</h1>
        </div>
        <div id="form" className="flex gap-y-10 flex-col items-center">
          <div id="input-upc" className="flex gap-x-4 self-start">
            <label htmlFor="upc-area" className="font-semibold">
              UPC:
            </label>
            <input
              className="border-2 rounded text-center"
              type="text"
              aria-label="UPC"
              placeholder={box?.upc}
              value={upcIn}
              onChange={(e) => {
                const sanitizedValue = DOMPurify.sanitize(e.target.value);
                setUpcValue(sanitizedValue);
              }}
            />
          </div>
          <SearchDropdown options={allItemInfo!} />
          <div
            id="input-dimensions"
            className="flex flex-col items-center gap-y-5"
          >
            <div>
              <label htmlFor="dimensions-area" className="font-semibold">
                Dimensions:
              </label>
            </div>
            <div className="flex gap-x-2">
              <input
                className="border-2 rounded text-center w-24"
                type="number"
                aria-label="length"
                placeholder={box?.dimensions.split("x").at(0)}
                onChange={(e) => {
                  setLengthValue(e.target.valueAsNumber);
                }}
              />
              <h2 className="font-bold">x</h2>
              <input
                className="border-2 rounded text-center w-24"
                type="number"
                aria-label="width"
                placeholder={box?.dimensions.split("x").at(1)}
                onChange={(e) => {
                  setWidthValue(e.target.valueAsNumber);
                }}
              />
              <h2 className="font-bold">x</h2>
              <input
                className="border-2 rounded text-center w-24"
                type="number"
                aria-label="height"
                placeholder={box?.dimensions.split("x").at(2)}
                onChange={(e) => {
                  setHeightValue(e.target.valueAsNumber);
                }}
              />
            </div>
            <div className="flex items-center">
              <button
                className=""
                onClick={() =>
                  setDimensionsValue({
                    length: lengthIn,
                    width: widthIn,
                    height: heightIn,
                  })
                }
              >
                Save Dimensions
              </button>
              {dimensionsIn ? (
                <span className="bg-green-700 px-1 relative left-5">
                  &#10003;
                </span>
              ) : null}
            </div>
          </div>
          <div id="input-count" className="flex gap-x-2 self-start">
            <label htmlFor="weight-area" className="font-semibold">
              Count:
            </label>
            <input
              className="border-2 rounded text-center"
              type="number"
              aria-label="count"
              value={countIn}
              onChange={(e) => {
                setCountValue(e.target.valueAsNumber);
              }}
            />
          </div>
          <div className="mt-5 flex flex-col gap-y-2">
            <button onClick={() => handleUpdate()}>Submit</button>
            <button onClick={() => navigate(-1)}>Back</button>
          </div>
        </div>
      </div>
    </div>
  );
}
