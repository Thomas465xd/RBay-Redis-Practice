import { randomBytes } from "crypto"
import { client } from "./client";

export const withLock = async (key: string, callback: (redisClient: Client, signal: { expired: boolean }) => any) => {
    // Initialize variables to control retry behavior
    const retryDelayMs = 100; 
    const timeoutMs = 2000;
    let retries = 20; 

    // Generate a random value to store at the lock key & then create the Lock key
    const token = randomBytes(6).toString("hex");
    const lockKey = `lock:${key}`

    // Set up a while loop to implement the retry behavior
    while (retries >= 0) {
        retries--;

        // Try to do a SETNX Operation
        const setted = await client.set(lockKey, token, {
            NX: true, 
            PX: 2000
        });

        if(!setted) {
            // Else brief pause (retryDelaysMS) and then retry
            await pause(retryDelayMs);
            continue;
        }

        // If the SETNX is successful, then run the callback
        try {
            const signal = { expired: false }; 
            setTimeout(() => {
                signal.expired = true
            }, timeoutMs)

            const proxiedClient = buildClientProxy(timeoutMs)

            const result = await callback(proxiedClient, signal); 
            return result
        } finally {
            // Unset the lock key
            await client.unlock(lockKey, token)
        }
    }
};

type Client = typeof client

const buildClientProxy = (timeoutMs: number) => {
    const startTime = Date.now();

    const handler = {
        get(target: Client, prop: keyof Client) {
            if(Date.now() >= startTime + timeoutMs) {
                throw new Error("Lock has expired")
            }

            const value = target[prop];
            return typeof value === "function" ? value.bind(target) : value; 
        }
    }

    return new Proxy(client, handler) as Client; 
};

const pause = (duration: number) => {
	return new Promise((resolve) => {
		setTimeout(resolve, duration);
	});
};
