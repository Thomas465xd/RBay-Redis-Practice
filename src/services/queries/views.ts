import { itemsKey, itemsViewsKey } from "$services/keys";
import { client } from "$services/redis";

export const incrementView = async (itemId: string, userId: string) => {
    return Promise.all([
        client.hIncrBy(itemsKey(itemId), "views", 1), 
        client.zIncrBy(itemsViewsKey(), 1, itemId)
    ])
};
