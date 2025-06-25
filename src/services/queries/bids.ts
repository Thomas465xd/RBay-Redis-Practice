import { bidHistoryKey, itemsKey, itemsPriceKey } from '$services/keys';
import { client, withLock } from '$services/redis';
import type { CreateBidAttrs, Bid } from '$services/types';
import { DateTime } from 'luxon';
import { getItem } from './items';

export const createBid = async (attrs: CreateBidAttrs) => {
    // Destructure elements from attrs
    const { itemId, amount, createdAt, userId } = attrs;

    // First argument is the key that we want to lock the access to 
    // Second argument is a callback function that implements all the logic when the lock is set
    return withLock(itemId, async (lockedClient: typeof client, signal: { expired: boolean }) => {
        // Get the item
        const item = await getItem(itemId)

        //? Validations
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

        // chech if callback has taken too long and invalidate it
        if(signal.expired) {
            throw new Error("Lock expired, can't write any more data :(")
        }

        // 3) Writing some data
        return Promise.all([
            lockedClient.rPush(bidHistoryKey(itemId), serialized),
            lockedClient.hSet(itemsKey(item.id), {
                bids: item.bids + 1, 
                price: amount,
                highestBidUserId: userId
            }),
            lockedClient.zAdd(itemsPriceKey(), {
                value: item.id, 
                score: amount
            })
        ])
    })

    // return client.executeIsolated(async (isolatedClient) => {
    //     // Set up WATCH statement
    //     await isolatedClient.watch(itemsKey(itemId))

    //     // Get the item
    //     const item = await getItem(itemId)

    //     //? Validations
    //     if(!item) {
    //         throw new Error("Item does not exists");
    //     }

    //     if(item.price >= amount) {
    //         throw new Error("Bid too low")
    //     }

    //     if(item.endingAt.diff(DateTime.now()).toMillis() < 0) {
    //         throw new Error("The auction already closed!")
    //     }

    //     const serialized = serializeHistory(
    //         amount, 
    //         createdAt.toMillis(), 
    //     )

    //     return isolatedClient
    //         .multi()
    //         .rPush(bidHistoryKey(itemId), serialized)
    //         .hSet(itemsKey(item.id), {
    //             bids: item.bids + 1, 
    //             price: amount,
    //             highestBidUserId: userId
    //         })
    //         .zAdd(itemsPriceKey(), {
    //             value: item.id, 
    //             score: amount
    //         })
    //         .exec()

    //     /** 
    //     return Promise.all([
    //         client.rPush(bidHistoryKey(itemId), serialized),
    //         client.hSet(itemsKey(item.id), {
    //             bids: item.bids + 1, 
    //             price: amount,
    //             highestBidUserId: userId
    //         })
    //     ])
    //     */
    // })
    
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