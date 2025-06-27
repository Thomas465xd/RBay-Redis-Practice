import { itemsIndexKey } from "$services/keys";
import { client } from "$services/redis";
import { deserialize } from "./deserialize";

export const searchItems = async (term: string, size: number = 5) => {
    // Parse user input
    const cleaned = term
        .replaceAll(/[^a-zA-Z0-9 ]/g, "")
        .trim() // Clena white spaces in the input
        .split(" ") // Split user input if so (Ej. "fast car" = ["fast", "car"])
        .map((word) => word ? `%${word}%` : "")
        .join(" ") // Join the array into one simple string ([%word1%, %word2%] = %word1% %word2%)

    //? Look at cleaned and make sure it is valid
    if(cleaned === "") {
        return []
    }

    //? Add weight to "name" field
    const query = `(@name:(${cleaned}) => { $weight: 5.0 }) | (@description:(${cleaned}))`

    //? Use the client to do an actual search
    const results = await client.ft.search(itemsIndexKey(), query, {
        LIMIT: {
            from: 0, 
            size
        }
    })

    // Results will give something like: { id: 'items#6456c2', value: [Object: null prototype] }

    //? Deserialize and return the search results
    return results.documents.map( ( {id, value} ) => deserialize(id, value as any))
};
