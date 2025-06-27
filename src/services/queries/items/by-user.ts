import { itemsIndexKey } from "$services/keys";
import { client } from "$services/redis";
import { deserialize } from "./deserialize";

interface QueryOpts {
	page: number;
	perPage: number;
	sortBy: string;
	direction: string;
}

export const itemsByUser = async (userId: string, opts: QueryOpts) => {
    // Destructure opts elements
    const { page, perPage, sortBy, direction } = opts

    // Get all products created by the logged user
    const query = `@ownerId:{${userId}}`

    // If a sortBy and a direction argument is passed, then add those options to the search
    const sortCriteria = sortBy && direction && {
        BY: sortBy, DIRECTION: direction
    }

    //
    const { total, documents } = await client.ft.search(
        itemsIndexKey(), 
        query, 
        {
            ON: "HASH", 
            SORTBY: sortCriteria, 
            LIMIT: {
                from: page * perPage, 
                size: perPage
            }
        } as any
    )

    console.log(total, documents)

    return {
        totalPages: Math.ceil(total / perPage), 
        items: documents.map( ( { id, value } ) => {
            return deserialize(id.replace("items#", ""), value as any)
        })
    }
};
