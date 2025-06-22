import { itemsKey, itemsUniqueViewsKey, itemsViewsKey } from "$services/keys";
import { client } from "$services/redis";

export const incrementView = async (itemId: string, userId: string) => {
    //? Use HyperLogLog algorithm to check whether the user has already viewed the item in the past or not
    //* viewed returns either a 0 (false, the value is already registered) or 1 (the value is not registered)
    const viewed = await client.pfAdd(itemsUniqueViewsKey(itemId), userId);

    //* If the value is not registered, then increment item views attribute in the hash table
    if(viewed) {
        return Promise.all([
            client.hIncrBy(itemsKey(itemId), "views", 1), 
            client.zIncrBy(itemsViewsKey(), 1, itemId)
        ])
    }

};
