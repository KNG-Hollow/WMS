// SPDX-License-Identifier: GPL-3.0

import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectAppActive } from "../appSlice";
import { insertError, selectErrorActive } from "../errors/errorSlice";
import { selectRole, selectUserState } from "../accounts/accountSlice";
import { CreateItem } from "../../services/itemApi";
import type { Item } from "../../app/models";
import DOMPurify from "dompurify";

export default function CreateItemForm() {
  const userRole = useAppSelector(selectRole);
  const appActive = useAppSelector(selectAppActive);
  const errorActive = useAppSelector(selectErrorActive);
  const userState = useAppSelector(selectUserState);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [upcIn, setUpcValue] = useState<string>("");
  const [nameIn, setNameValue] = useState<string>("");
  const [descriptionIn, setDescriptionValue] = useState<string>("");
  const [weightIn, setWeightValue] = useState<number>(0);
  const [imageIn, setImageValue] = useState<File | null>(null);
  const [imgBinIn, setImgBinValue] = useState<Uint8Array>();

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
  }, [appActive, dispatch, errorActive, navigate, userRole]);

  const convertToBytea = (data: Uint8Array): string => {
    return `\\x${Array.from(data)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("")}`;
  };

  const readImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const buffer = new Uint8Array(arrayBuffer);
      console.log(buffer);
      setImgBinValue(buffer);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleCreate = async () => {
    let success: boolean;
    let responseItem: Item;

    if (imageIn) {
      readImageFile(imageIn);
    } else {
      alert("Image file cannot be empty!");
      return;
    }

    if (upcIn.trim() === "") {
      alert("UPC cannot be empty!");
      return;
    }
    if (nameIn.trim() === "") {
      alert("Name cannot be empty!");
      return;
    }
    if (descriptionIn.trim() === "") {
      alert("Username cannot be empty!");
      return;
    }
    if (weightIn === 0) {
      alert("Weight cannot be nothing!");
      return;
    }

    const updatedItem: Item = {
      id: null,
      upc: upcIn,
      name: nameIn,
      description: descriptionIn,
      weight: weightIn,
      image: { name: "", data: convertToBytea(imgBinIn!), valid: true },
    };

    console.log("Attempting to create item...");
    try {
      [success, responseItem] = await CreateItem(
        userState,
        null,
        updatedItem.upc,
        updatedItem.name,
        updatedItem.description,
        updatedItem.weight,
        updatedItem.image!,
      );
      if (!success || responseItem === null) {
        console.error(
          `success: ${success ? "True" : "False"} , item: ${responseItem}`,
        );
        throw new Error("Create Item Had Unexpected Response Values!");
      }
      console.log(
        `success: ${success ? "True" : "False"} , item: ${responseItem}`,
      );
      navigate(-1);
    } catch (err) {
      console.error("ApiService Failed To Create Item: " + err);
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
          <h1>Create Item</h1>
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
              value={upcIn}
              onChange={(e) => {
                const sanitizedValue = DOMPurify.sanitize(e.target.value);
                setUpcValue(sanitizedValue);
              }}
            />
          </div>
          <div id="input-name">
            <label htmlFor="password-area" className="relative right-2">
              Name:
            </label>
            <input
              className="border-2 rounded"
              type="name"
              aria-label="name"
              value={nameIn}
              onChange={(e) => {
                const sanitizedValue = DOMPurify.sanitize(e.target.value);
                setNameValue(sanitizedValue);
              }}
            />
          </div>
          <div id="input-description">
            <label
              htmlFor="description-area"
              className="text-center relative right-2"
            >
              Description:
            </label>
            <textarea
              className="border-2 rounded text-center"
              rows={5}
              cols={60}
              aria-label="description"
              value={descriptionIn}
              onChange={(e) => {
                const sanitizedValue = DOMPurify.sanitize(e.target.value);
                setDescriptionValue(sanitizedValue);
              }}
            />
          </div>
          <div id="input-weight">
            <label htmlFor="weight-area" className="relative right-2">
              Weight:
            </label>
            <input
              className="border-2 rounded text-center"
              type="number"
              aria-label="weight"
              value={weightIn}
              onChange={(e) => {
                setWeightValue(e.target.valueAsNumber);
              }}
            />
          </div>
          <div id="input-image" className="flex flex-col">
            <div className="flex">
              <label htmlFor="image-area" className="relative right-2">
                Image:
              </label>
              <input
                className="hidden"
                type="file"
                accept="image/png"
                id="image"
                name="image"
                onChange={(e) => {
                  if (e.target.files) {
                    setImageValue(e.target.files[0]);
                  }
                }}
              />
              <label
                htmlFor="image"
                className="hover:border-2 border-cyan-200 rounded p-1 bg-cyan-700 font-semibold"
              >
                Select File
              </label>
            </div>
            {imageIn && (
              <div className="text-center border p-2 space-y-2 mt-5">
                <h3 className="font-semibold">File details:</h3>
                <ul>
                  <li>Name: {imageIn.name}</li>
                  <li>Type: {imageIn.type}</li>
                  <li>Size: {imageIn.size} bytes</li>
                </ul>
              </div>
            )}
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
