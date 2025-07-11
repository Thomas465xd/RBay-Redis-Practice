import { itemsEndingAtKey, itemsKey, itemsPriceKey, itemsViewsKey } from '$services/keys';
import { client } from '$services/redis';
import type { CreateItemAttrs } from '$services/types';
import { genId } from '$services/utils';
import { deserialize } from './deserialize';
import { serialize } from './serialize';

export const getItem = async (id: string) => {
    const item = await client.hGetAll(itemsKey(id));

    if(Object.keys(item).length === 0) {
        console.log("Item not found")
        return null; 
    }

    return deserialize(id, item);
};

export const getItems = async (ids: string[]) => {
    const commands = ids.map((id) => {
        return client.hGetAll(itemsKey(id))
    })

    const results = await Promise.all(commands)

    const items = results.map((result, index) => {
        if (Object.keys(result).length === 0) {
            return null;
        }

        return deserialize(ids[index], result);
    });

    return items;
};

export const createItem = async (attrs: CreateItemAttrs, userId: string) => {
    const id = genId(); 

    const serialized = serialize(attrs)

    await Promise.all([
        client.hSet(itemsKey(id), serialized),
        client.zAdd(itemsViewsKey(),  {
            value: id, // value = member
            score: 0
        }), 
        client.zAdd(itemsEndingAtKey(), {
            value: id, // value = member
            score: attrs.endingAt.toMillis()
        }), 
        client.zAdd(itemsPriceKey(), { // Create item prices sorted set
            value: id, // Member
            score: 0
        })
    ])

    return id; 
};

