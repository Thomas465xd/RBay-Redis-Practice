import { sessionsKey } from '$services/keys';
import { client } from '$services/redis';
import type { Session } from '$services/types';

export const getSession = async (id: string) => {
    const session = await client.hGetAll(sessionsKey(id));

    if(Object.keys(session).length === 0) {
        return null; 
    }

    return deserialize(id, session)
};

//*
export const saveSession = async (session: Session) => {
    return client.hSet(
        sessionsKey(session.id), 
        serialize(session)
    )
};

//? Serialize function (like a sanitation function to pass the data to redis in a specified format)
const serialize  = (session: Session) => {
    // Destructure attributes 
    const { userId, username } = session

    return {
        userId,
        username, 
    }
}

//? Deserialize function (used when retrieving unformatted data from the redis DB to format it in an useful way)
const deserialize = ( id: string, session: { [key: string]: string } ) => {
    // Destructure data
    const { userId, username } = session; 

    return {
        id, 
        userId, 
        username
    }
}