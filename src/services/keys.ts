export const pageCacheKey = (id: string) => `pagecache#${id}`

// Auth keys
export const usersKey = (userId: string) => `users#${userId}`
export const sessionsKey = (sessionId: string) => `sessions#${sessionId}`
export const usernamesKey = () => `usernames:unique#`

// Like keys
export const userLikesKey = (userId: string) => `users:likes#${userId}`

// Item keys
export const itemsKey = (itemId: string) => `items#${itemId}`