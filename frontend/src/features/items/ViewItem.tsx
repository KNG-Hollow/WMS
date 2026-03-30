// SPDX-License-Identifier: GPL-3.0

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import type { Item } from "@/app/models";
import { GetItem } from "@/services/itemApi";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { selectUserState } from "../accounts/accountSlice";
import { selectAppActive } from "../appSlice";
import { insertError, selectErrorActive } from "../errors/errorSlice";

export default function ViewItem() {
  const appActive = useAppSelector(selectAppActive);
  const errorActive = useAppSelector(selectErrorActive);
  const userState = useAppSelector(selectUserState);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const [item, setItem] = useState<Item | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [weightDisplay, setWeightDisplay] = useState<string | null>(null);

  const imageToBase64 = (imageData: string) => {
    return `data:image/png;base64,${imageData}`;
  };

  const convertWeight = (input: number) => {
    if (input < 1) {
      setWeightDisplay(`${input} oz.`);
    } else {
      setWeightDisplay(`${input} lb.`);
    }
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
        convertWeight(fetchedItem.weight);
        if (fetchedItem.image) {
          setImageUrl(imageToBase64(fetchedItem.image.data));
        }
        setItem(fetchedItem);
      } catch (err) {
        console.error(`Failed to get item ${id}: ` + err);
        alert(`Failed To Get Item: ${id}`);
        dispatch(
          insertError({
            header: "Failed To Get Item!",
            message: `Failed To Return An Acceptable Item Object With ID: ${id}`,
            errorActive: true,
          }),
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
    <div className="flex flex-1 justify-center">
      <div className="flex flex-col w-5/6 my-20 p-20 gap-y-20 bg-gray-900 border-3 border-cyan-600 items-center">
        <div className="text-xl text-cyan-500 text-center font-bold">
          <h1>{item?.name}</h1>
        </div>
        <div className="flex flex-col gap-y-10">
          <div className="flex space-x-17">
            <h2 className="font-semibold">UPC:</h2>
            <h2>{item?.upc}</h2>
          </div>
          <div className="flex gap-x-3">
            <h2 className="font-semibold">Description:</h2>
            <h2 className="wrap-break-word">{item?.description}</h2>
          </div>
          <div className="flex gap-x-12">
            <h2 className="font-semibold">Weight:</h2>
            <h2>{weightDisplay}</h2>
          </div>
          <div className="flex items-center flex-col gap-y-7">
            <h2 className="font-semibold">Image:</h2>
            <div className="w-1/2 h-1/2 border">
              {imageUrl ? (
                <img src={imageUrl} alt={`${item?.name}.png`} />
              ) : (
                <p>Loading...</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-y-1">
          <button onClick={() => navigate("./edit")}>Edit</button>
          <button onClick={() => navigate(-1)}>Back</button>
        </div>
      </div>
    </div>
  );
}
