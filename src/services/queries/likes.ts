import { itemsKey, userLikesKey } from "$services/keys";
import { client } from "$services/redis";
import { getItems } from "./items";

export const userLikesItem = async (itemId: string, userId: string) => {
    return client.sIsMember(userLikesKey(userId), itemId)
};

export const likedItems = async (userId: string) => {
    // Fetch all the item Id's from this user's liked set
    const ids = await client.sMembers(userLikesKey(userId));

    // Fetch all the item hashes with those ids and return as arrays
    return getItems(ids);
};

export const likeItem = async (itemId: string, userId: string) => {
    const inserted = await client.sAdd(userLikesKey(userId), itemId); // will be 1 if like was added and 0 if it was not

    if(inserted) {
        // Get the item hash and increment likes attribute by 1 
        return await client.hIncrBy(itemsKey(itemId), "likes", 1) 
    }
};

export const unlikeItem = async (itemId: string, userId: string) => {
    const removed = await client.sRem(userLikesKey(userId), itemId) // returns 1 if value is removed and 0 if it does not

    if(removed) {
        // Get the item hash and decrement likes attribute by 1 
        return await client.hIncrBy(itemsKey(itemId), "likes", -1)
    }
};

export const commonLikedItems = async (userOneId: string, userTwoId: string) => {
    const ids = await client.sInter([userLikesKey(userOneId), userLikesKey(userTwoId)]);

    return getItems(ids)
};
