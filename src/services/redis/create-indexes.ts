import { itemsIndexKey, itemsKey } from "$services/keys";
import { client } from "./client";
import { SchemaFieldTypes } from "redis";

export const createIndexes = async () => {
    const indexes = await client.ft._list(); 
    const exists = indexes.find( index => index === itemsIndexKey())

    if(exists) {
        return; // If the index already exists, don't create a new index
    }

    return client.ft.create(
        itemsIndexKey(),
        {
            name: { 
                type: SchemaFieldTypes.TEXT,
                sortable: true
            }, 
            description: { 
                type: SchemaFieldTypes.TEXT,
                sortable: false
            }, 
            ownerId: {
                type: SchemaFieldTypes.TAG, 
                sortable: false
            }, 
            endingAt: {
                type: SchemaFieldTypes.NUMERIC, 
                sortable: true
            }, 
            bids: {
                type: SchemaFieldTypes.NUMERIC, 
                sortable: true
            }, 
            views: {
                type: SchemaFieldTypes.NUMERIC, 
                sortable: true
            }, 
            price: {
                type: SchemaFieldTypes.NUMERIC, 
                sortable: true
            }, 
            likes: {
                type: SchemaFieldTypes.NUMERIC, 
                sortable: true
            }
        } as any, 
        {
            ON: "HASH", 
            PREFIX: itemsKey("")
        }
    )
};
