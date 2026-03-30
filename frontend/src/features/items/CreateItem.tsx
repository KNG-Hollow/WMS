// SPDX-License-Identifier: GPL-3.0

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import type { Item } from "@/app/models";
import { CreateItem } from "@/services/itemApi";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DOMPurify from "dompurify";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { selectRole, selectUserState } from "../accounts/accountSlice";
import { selectAppActive } from "../appSlice";
import { insertError, selectErrorActive } from "../errors/errorSlice";

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
        insertError({
          header: "Api Service Failure",
          message: `Failed To Populate The Database And Get A Successful Response ::\n${err}`,
          errorActive: true,
        }),
      );
    }
  };

  return (
    <div className="flex flex-1 justify-center items-center">
      <div
        id="form-container"
        className="border-3 my-20 items-center border-cyan-600 rounded bg-gray-900 p-20 gap-y-20 flex flex-col"
      >
        <div className="font-semibold text-xl text-cyan-500">
          <h1>Create Item</h1>
        </div>
        <div id="form" className="flex gap-y-10 flex-col items-center">
          <div id="input-name" className="space-x-2">
            <label htmlFor="password-area" className="font-semibold">
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
          <div id="input-upc" className="flex gap-x-5">
            <label htmlFor="upc-area" className="font-semibold">
              UPC:
            </label>
            <input
              className="border-2 rounded text-center"
              type="text"
              aria-label="upc"
              value={upcIn}
              onChange={(e) => {
                const sanitizedValue = DOMPurify.sanitize(e.target.value);
                setUpcValue(sanitizedValue);
              }}
            />
          </div>
          <div
            id="input-description"
            className="flex flex-col text-center gap-y-2"
          >
            <label htmlFor="description-area" className="font-semibold">
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
          <div id="input-weight" className="flex gap-x-2">
            <label htmlFor="weight-area" className="font-semibold">
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
          <div id="input-image" className="flex flex-col items-center gap-y-3">
            <div className="flex gap-x-2">
              <label htmlFor="image-area" className="font-semibold">
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
                className="hover:border border-cyan-400 rounded p-1 bg-cyan-700 font-medium"
              >
                Select File
              </label>
            </div>
            {imageIn && (
              <div className="text-center border-2 p-3 space-y-2 mt-5">
                <h3 className="font-semibold">File details:</h3>
                <ul className="space-y-2">
                  <li className="flex gap-x-2">
                    <p className="font-semibold">Name:</p>
                    <p>{imageIn.name}</p>
                  </li>
                  <li className="flex gap-x-2">
                    <p className="font-semibold">Type:</p>
                    <p className="relative left-2">{imageIn.type}</p>
                  </li>
                  <li className="flex gap-x-2">
                    <p className="font-semibold">Size:</p>
                    <p className="relative left-3">{imageIn.size / 1000} KB</p>
                  </li>
                  <li className="mt-5">
                    <FontAwesomeIcon
                      className="cursor-pointer text-red-600"
                      onClick={() => setImageValue(null)}
                      icon={faTrashCan}
                    />
                  </li>
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
