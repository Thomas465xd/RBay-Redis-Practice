import { itemsEndingAtKey, itemsKey } from "$services/keys";
import { client } from "$services/redis";
import { deserialize } from "./deserialize";

export const itemsByEndingTime = async (
	order: 'DESC' | 'ASC' = 'DESC',
	offset = 0,
	count = 10
) => {
    // Get the different item id's from the sorted set of endingAt 
    const ids = await client.zRange(
        itemsEndingAtKey(),
        Date.now(), // No need to format it to UNIX timestamp
        "+inf", 
        {
            BY: "SCORE", 
            LIMIT: {
                offset, 
                count
            }
        }
    )

    // Get all items that match the endingAt criteria from above
    const results = await Promise.all(ids.map(id => {
        return client.hGetAll((itemsKey(id)))
    }))

    // Deserialize the items query results 
    return results.map((item, index) => deserialize(ids[index], item))
};
