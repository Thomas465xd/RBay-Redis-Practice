import { bidHistoryKey, itemsKey, itemsPriceKey } from '$services/keys';
import { client } from '$services/redis';
import type { CreateBidAttrs, Bid } from '$services/types';
import { DateTime } from 'luxon';
import { getItem } from './items';

export const createBid = async (attrs: CreateBidAttrs) => {
    // Destructure elements from attrs
    const { itemId, amount, createdAt, userId } = attrs;

    return client.executeIsolated(async (isolatedClient) => {
        // Set up WATCH statement
        await isolatedClient.watch(itemsKey(itemId))

        // Get the item
        const item = await getItem(itemId)

        if(!item) {
            throw new Error("Item does not exists");
        }

        if(item.price >= amount) {
            throw new Error("Bid too low")
        }

        if(item.endingAt.diff(DateTime.now()).toMillis() < 0) {
            throw new Error("The auction already closed!")
        }

        const serialized = serializeHistory(
            amount, 
            createdAt.toMillis(), 
        )

        return isolatedClient
            .multi()
            .rPush(bidHistoryKey(itemId), serialized)
            .hSet(itemsKey(item.id), {
                bids: item.bids + 1, 
                price: amount,
                highestBidUserId: userId
            })
            .zAdd(itemsPriceKey(), {
                value: item.id, 
                score: amount
            })
            .exec()

        /** 
        return Promise.all([
            client.rPush(bidHistoryKey(itemId), serialized),
            client.hSet(itemsKey(item.id), {
                bids: item.bids + 1, 
                price: amount,
                highestBidUserId: userId
            })
        ])
        */
    })
};

export const getBidHistory = async (itemId: string, offset = 0, count = 10): Promise<Bid[]> => {
    const startIndex = -1 * offset - count;
    const endIndex = -1 - offset; 

    const range = await client.lRange(
        bidHistoryKey(itemId),
        startIndex, 
        endIndex
    )

    return range.map(bid => deserializeHistory(bid))
};

const serializeHistory = (amount: number, createdAt: number) => {
    return `${amount}:${createdAt}`
}

const deserializeHistory = (stored: string) => {
    const [ amount, createdAt ] = stored.split(":");

    return {
        amount: parseFloat(amount), 
        createdAt: DateTime.fromMillis(parseInt(createdAt))
    }
}