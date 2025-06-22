import { itemsEndingAtKey, itemsKey } from "$services/keys";
import { client } from "$services/redis";

export const itemsByEndingTime = async (
	order: 'DESC' | 'ASC' = 'DESC',
	offset = 0,
	count = 10
) => {
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

    const results = await Promise.all(ids.map(id => {
        return client.hGetAll((itemsKey(id)))
    }))

    console.log(results)
};
