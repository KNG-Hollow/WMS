// SPDX-License-Identifier: GPL-3.0

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectAppActive } from "../appSlice";
import { insertError, selectErrorActive } from "../errors/errorSlice";
import { selectRole, selectUserState } from "../accounts/accountSlice";
import DOMPurify from "dompurify";
import type { Dimensions, Box, Item, ItemInfo } from "../../app/models";
import { CreateBox } from "../../services/boxApi";
import { GetItem, GetItemsList } from "../../services/itemApi";

// TODO Add box api and dropdown of item-names for selecting item into box
export default function CreateBoxForm() {
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

  const handleCreate = async () => {
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
      id: null,
      upc: upcIn,
      item: item!,
      dimensions: "",
      count: countIn,
    };

    console.log("Attempting to create Box...");
    try {
      [success, responseBox] = await CreateBox(
        userState,
        null,
        updatedBox.upc,
        updatedBox.item,
        dimensionsIn!,
        updatedBox.count,
      );
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
          <h1>Create Box</h1>
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
              placeholder="..."
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
                placeholder="length"
                onChange={(e) => {
                  setLengthValue(e.target.valueAsNumber);
                }}
              />
              <h2>x</h2>
              <input
                className="border-2 rounded text-center"
                type="number"
                aria-label="width"
                placeholder="width"
                onChange={(e) => {
                  setWidthValue(e.target.valueAsNumber);
                }}
              />
              <h2>x</h2>
              <input
                className="border-2 rounded text-center"
                type="number"
                aria-label="height"
                placeholder="height"
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
            <button onClick={() => handleCreate()}>Submit</button>
            <button onClick={() => navigate(-1)}>Back</button>
          </div>
        </div>
      </div>
    </div>
  );
}
