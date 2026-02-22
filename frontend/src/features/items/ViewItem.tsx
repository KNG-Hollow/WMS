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
        <div className="flex flex-col gap-y-5">
          <div className="text-xl text-center mb-5 font-bold">
            <h1>{item?.name}</h1>
          </div>
          <div className="flex gap-x-2">
            <h2 className="font-bold">UPC:</h2>
            <h2>{item?.upc}</h2>
          </div>
          <div className="flex gap-x-2">
            <h2 className="font-bold">Description:</h2>
            <h2>{item?.description}</h2>
          </div>
          <div className="flex gap-x-2">
            <h2 className="font-bold">Weight:</h2>
            <h2>{weightDisplay}</h2>
          </div>
          <div className="flex items-center flex-col gap-y-7">
            <h2 className="font-bold">Sample Image:</h2>
            <div className="w-1/2 h-1/2 border">
              {imageUrl ? (
                <img src={imageUrl} alt={`${item?.name} image`} />
              ) : (
                <p>Loading...</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-y-1 mt-10 self-center">
          <button onClick={() => navigate("./edit")}>Edit</button>
          <button onClick={() => navigate(-1)}>Back</button>
        </div>
      </div>
    </div>
  );
}
