import { usersKey } from '$services/keys';
import { client } from '$services/redis';
import type { CreateUserAttrs } from '$services/types';
import { genId } from '$services/utils';

export const getUserByUsername = async (username: string) => {};

export const getUserById = async (id: string) => {};

export const createUser = async (attrs: CreateUserAttrs) => {
    // Destructure attributes 
    const { username, password } = attrs

    // Generate unique user id to prevent hash table colissions
    const id = genId(); 

    // Use node-redis client to create te hash table
    await client.hSet(usersKey(id), {
        username, 
        password
    })
};

