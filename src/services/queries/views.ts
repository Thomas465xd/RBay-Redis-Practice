//import { itemsKey, itemsUniqueViewsKey, itemsViewsKey } from "$services/keys";
import { client } from "$services/redis";

export const incrementView = async (itemId: string, userId: string) => {
    //? Implement lua Script
    //** keys i need to access
    // 1) itemsViewsKey
    // 2) itemsKey
    // 3) itemsByViewsKey
    //  EVALSHA ID 3 (3 because the script is going to work with 3 different keys)
    //  */

    /** Arguments i need to accept
     * 1) itemId
     * 2) userId
     */

    //!  Call Lua Script
    return client.incrementView(itemId, userId)

    /**
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
    
     */
};
