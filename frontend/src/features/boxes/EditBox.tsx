// SPDX-License-Identifier: GPL-3.0

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectAppActive } from "../appSlice";
import { insertError, selectErrorActive } from "../errors/errorSlice";
import type { ItemInfo, Dimensions, Item, Box } from "../../app/models";
import { GetItemsList, GetItem } from "../../services/itemApi";
import { selectRole, selectUserState } from "../accounts/accountSlice";
import { ConvertDimensions, GetBox, UpdateBox } from "../../services/boxApi";
import DOMPurify from "dompurify";

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
          insertError([
            "Failed To Get Box!",
            `Failed To Return An Acceptable Box Object With ID [${box?.id}] :: ${err}`,
            true,
          ]),
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
            placeholder={box?.item.name}
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
        insertError([
          "Api Service Failure",
          `Failed To Get A Successful Response ::\n${err}`,
          true,
        ]),
      );
    }

    const updatedBox: Box = {
      id: +id!,
      upc: upcIn,
      item: item!,
      dimensions: ConvertDimensions(dimensionsIn!),
      count: countIn,
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
        insertError([
          "Api Service Failure",
          `Failed To Populate The Database And Get A Successful Response ::\n${err}`,
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
        <div className="font-bold text-xl text-cyan-500">
          <h1>Edit Box</h1>
        </div>
        <div id="form" className="flex mt-5 gap-y-5 flex-col items-center">
          <div id="input-upc">
            <label htmlFor="upc-area" className="relative right-2">
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
          <div id="input-dimensions" className="flex flex-row">
            <label
              htmlFor="dimensions-area"
              className="text-center relative right-2"
            >
              Dimensions:
            </label>
            <div className="flex">
              <input
                className="border-2 rounded text-center"
                type="number"
                aria-label="length"
                placeholder={box?.dimensions.split("x").at(0)}
                onChange={(e) => {
                  setLengthValue(e.target.valueAsNumber);
                }}
              />
              <h2>x</h2>
              <input
                className="border-2 rounded text-center"
                type="number"
                aria-label="width"
                placeholder={box?.dimensions.split("x").at(1)}
                onChange={(e) => {
                  setWidthValue(e.target.valueAsNumber);
                }}
              />
              <h2>x</h2>
              <input
                className="border-2 rounded text-center"
                type="number"
                aria-label="height"
                placeholder={box?.dimensions.split("x").at(2)}
                onChange={(e) => {
                  setHeightValue(e.target.valueAsNumber);
                }}
              />
            </div>
            <button
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
              <span className="bg-green-700">&#10003;</span>
            ) : null}
          </div>
          <div id="input-count">
            <label htmlFor="weight-area" className="relative right-2">
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
