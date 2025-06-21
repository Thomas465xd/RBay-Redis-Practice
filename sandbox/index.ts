import 'dotenv/config';
import { client } from '../src/services/redis';

const run = async () => {
    await client.hSet("car1", {
        name: "Toyota", 
        year: 1952 
    })

    await client.hSet("car2", {
        name: "Ferrari", 
        year: 1954 
    })

    await client.hSet("car3", {
        name: "Tesla", 
        year: 1956 
    })

    const commands = [1, 2, 3].map((id) => {
        return client.hGetAll(`car${id}`)
    })

    const results = await Promise.all(commands)

    console.log(results)

    /*
        if(Object.keys(car).length === 0) {
            console.error("Car not found, server responded with a 404 status")
            return; 
        } 

        console.log(car)
    */


    // HSET color name "Thomas" age 22
};

run();
