import 'dotenv/config';
import { client } from '../src/services/redis';

const run = async () => {
    await client.hSet("car", {
        name: "Toyota", 
        year: 1950 
    })

    const car = await client.hGetAll("car#320398820398");

    if(Object.keys(car).length === 0) {
        console.error("Car not found, server responded with a 404 status")
        return; 
    }

    console.log(car)

    // HSET color name "Thomas" age 22
};

run();
