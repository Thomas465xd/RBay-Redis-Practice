import type { Item } from '$services/types';
import { DateTime } from 'luxon';

export const deserialize = (id: string, item: { [key: string]: string }): Item => {

    const { name, imageUrl, description, highestBidUserId, ownerId,views, likes, bids, price } = item

    return {
        id, 
        name, 
        description,
        imageUrl,
        highestBidUserId, 
        ownerId, 
        createdAt: DateTime.fromMillis(parseInt(item.createdAt)), 
        endingAt: DateTime.fromMillis(parseInt(item.endingAt)), 
        views: parseInt(views), 
        likes: parseInt(likes), 
        bids: parseInt(bids), 
        price: parseFloat(price)
    }
};

/**
 * name: string;
    imageUrl: string;
    description: string;
    createdAt: DateTime;
    endingAt: DateTime;
    ownerId: string;
    highestBidUserId: string;
    status: string;
 */
