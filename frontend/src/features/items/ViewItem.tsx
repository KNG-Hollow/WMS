// SPDX-License-Identifier: GPL-3.0

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectAppActive } from "../appSlice";
import { insertError, selectErrorActive } from "../errors/errorSlice";
import { GetItem } from "../../services/itemApi";
import { selectUserState } from "../accounts/accountSlice";
import type { Item } from "../../app/models";

export default function ViewItem() {
  const appActive = useAppSelector(selectAppActive);
  const errorActive = useAppSelector(selectErrorActive);
  const userState = useAppSelector(selectUserState);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const [item, setItem] = useState<Item | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // TODO Convert image Blob data into base64 and display into view
  const convertToBase64 = (imageData: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(imageData);
      fileReader.onload = () => {
        resolve(fileReader.result as string);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  useEffect(() => {
    if (!appActive) {
      navigate("/login");
    }
    if (errorActive) {
      navigate("/error");
    }

    const fetchItem = async (id: number) => {
      let successful = false;

      try {
        const [fetchSuccessful, fetchedItem] = await GetItem(userState, id);
        successful = fetchSuccessful;
        if (!successful || fetchedItem === null) {
          throw new Error("Failed to get item");
        }
        if (fetchedItem.image) {
          convertToBase64(fetchedItem.image.data).then((base64) => {
            setImageUrl(base64);
          });
        }
        setItem(fetchedItem);
      } catch (err) {
        console.error(`Failed to get item ${id}: ` + err);
        alert(`Failed To Get Item: ${id}`);
        dispatch(
          insertError([
            "Failed To Get Item!",
            `Failed To Return An Acceptable Item Object With ID: ${id}`,
            true,
          ]),
        );
      }
    };
    fetchItem(+id!);

    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [appActive, dispatch, errorActive, id, imageUrl, navigate, userState]);

  return (
    <div className="py-20 flex justify-center">
      <div className="flex flex-col gap-y-5 p-20 bg-gray-900 border-3 border-cyan-600">
        <div className="text-xl font-bold">
          <h1>{item?.name}</h1>
        </div>
        <div className="flex gap-x-2">
          <h2>UPC:</h2>
          <h2>{item?.upc}</h2>
        </div>
        <div className="flex gap-x-2">
          <h2>Description:</h2>
          <h2>{item?.description}</h2>
        </div>
        <div className="flex gap-x-2">
          <h2>Weight:</h2>
          <h2>{item?.weight}</h2>
        </div>
        <div className="flex flex-col gap-x-2">
          <h2>Image:</h2>
          <div>
            <input type="file" accept=".png" />
            {imageUrl && <img src={imageUrl} alt="Loading..." />}
          </div>
        </div>
      </div>
    </div>
  );
}
