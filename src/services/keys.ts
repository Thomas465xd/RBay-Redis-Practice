export const pageCacheKey = (id: string) => `pagecache#${id}`

// Auth keys
export const usersKey = (userId: string) => `users#${userId}`
export const sessionsKey = (sessionId: string) => `sessions#${sessionId}`
export const usernamesUniqueKey = () => `usernames:unique#`
export const usernamesKey = () => `usernames`

// Like keys
export const userLikesKey = (userId: string) => `users:likes#${userId}`

// Item keys
export const itemsKey = (itemId: string) => `items#${itemId}`
export const itemsViewsKey = () => `items:views`; // Items sorted set
export const itemsEndingAtKey = () => `items:endingAt`; // Items Ending At sorted Set