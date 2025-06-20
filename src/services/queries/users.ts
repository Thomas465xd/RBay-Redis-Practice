import { usersKey } from '$services/keys';
import { client } from '$services/redis';
import type { CreateUserAttrs } from '$services/types';
import { genId } from '$services/utils';

export const getUserByUsername = async (username: string) => {};

export const getUserById = async (id: string) => {
    const user = await client.hGetAll(usersKey(id)); 

    return deserialize(id, user)
};

export const createUser = async (attrs: CreateUserAttrs) => {
    // Generate unique user id to prevent hash table colissions
    const id = genId(); 

    // Use node-redis client to create te hash table
    await client.hSet(usersKey(id), serialize(attrs))

    return id; 
};

//? Serialize function (like a sanitation function to pass the data to redis in a specified format)
const serialize  = (user: CreateUserAttrs) => {
    // Destructure attributes 
    const { username, password } = user

    return {
        username, 
        password
    }
}

//? Deserialize function (used when retrieving unformatted data from the redis DB to format it in an useful way)
const deserialize = (id: string, user: { [key: string]: string } ) => {
    // Destructure attributes 
    const { username, password } = user

    return {
        id, 
        username, 
        password, 
    }
}