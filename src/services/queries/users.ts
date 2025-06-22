import { usernamesKey, usernamesUniqueKey, usersKey } from '$services/keys';
import { client } from '$services/redis';
import type { CreateUserAttrs } from '$services/types';
import { genId } from '$services/utils';

export const getUserByUsername = async (username: string) => {
    // Use the username argument to look up the persons User ID
    // With the usernames sorted set
    const base10Id = await client.zScore(usernamesKey(), username);

    // Make sure we actually got an ID from the lookup 
    if(!base10Id) {
        throw new Error ("User does not exists")
    }

    // Take the id and convert it back to hex
    const id = base10Id.toString(16);

    // Use the id to look up the user's hash
    const user = await client.hGetAll(usersKey(id))

    // Deserialize and return the hash
    return deserialize(id, user)
};

export const getUserById = async (id: string) => {
    const user = await client.hGetAll(usersKey(id)); 

    return deserialize(id, user)
};

export const createUser = async (attrs: CreateUserAttrs) => {
    // Generate unique user id to prevent hash table colissions
    const id = genId(); 

    // See if the username is already in the set of usernames, if so throw an error
    const usernameExists = await client.sIsMember(usernamesUniqueKey(), attrs.username)

    if(usernameExists) {
        throw new Error("Username is already in use")
    }

    // Use node-redis client to create te hash table
    Promise.allSettled([
        client.hSet(usersKey(id), serialize(attrs)),
        client.sAdd(usernamesUniqueKey(), attrs.username), 
        client.zAdd(usernamesKey(), {
            value: attrs.username, 
            score: parseInt(id, 16) // convert id (base 10) into base 16 so there are only numbers
        })
    ])

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