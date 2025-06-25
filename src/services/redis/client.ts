import { createClient, defineScript } from 'redis';
import { itemsKey, itemsUniqueViewsKey, itemsViewsKey } from "$services/keys";

const client = createClient({
	socket: {
		host: process.env.REDIS_HOST,
		port: parseInt(process.env.REDIS_PORT)
	},
	password: process.env.REDIS_PW, 
    scripts: {
        addOneAndStore: defineScript({
            NUMBER_OF_KEYS: 1, 
            SCRIPT: `
                local keyToAssignIncrementedNumberTo = KEYS[1]

                return redis.call("SET", keyToAssignIncrementedNumberTo, 1 + tonumber(ARGV[1]))
            `, 
            transformArguments(key: string, value: number) {
                return [key, value.toString()]
            }, 
            transformReply(reply) {
                return reply
            },
        }), 
        incrementView: defineScript({
            NUMBER_OF_KEYS: 3, 
            SCRIPT: `
                local itemsUniqueViewsKey = KEYS[1]
                local itemsKey = KEYS[2]
                local  itemsViewsKey = KEYS[3]

                local itemId = ARGV[1]
                local userId = ARGV[2]

                local viewed = redis.call("PFADD", itemsUniqueViewsKey, userId)
                
                if viewed == 1 then
                    redis.call("HINCRBY", itemsKey, "views", 1)
                    redis.call("ZINCRBY", itemsViewsKey, 1, itemId)
                end
            `,
            transformArguments(itemId: string, userId: string) {
                return [
                    itemsUniqueViewsKey(itemId), 
                    itemsKey(itemId), 
                    itemsViewsKey(), 
                    itemId, 
                    userId
                ]
            }, 
            transformReply() {
                return
            }
        }), 
        unlock: defineScript({
            NUMBER_OF_KEYS: 1, 
            SCRIPT: `
                if redis.call("GET", KEYS[1]) == ARGV[1] then
                    return redis.call("DEL", KEYS[1])
                end
            `,
            transformArguments(key: string, token: string) {
                return [key, token]
            }, 
            transformReply(reply) {
                return 
            }
        })
    }
});

client.on('error', (err) => console.error(err));
client.connect();

export { client };
