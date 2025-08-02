
import {Server} from "http";
import mongoose from "mongoose";
import app from "./app";
import { envVars } from "./app/config/env";
import { seedSuperAdmin } from "./app/Utils/seedSuperAdmin";

let server : Server;



const startServer = async () => {
    try {
         await mongoose.connect(envVars.DB_URL)

console.log("Connected to DB");

server = app.listen(envVars.PORT, () => {
    console.log(`Server is listening to post ${envVars.PORT}`)
})
    } catch (error) {
        console.log(error);
    }
   
}

(async () => {
    await startServer()
    await seedSuperAdmin()
})()

process.on("SIGINT", (err) => {
    console.log("SIGINT signal recieved... Server is shutting down..", err);

    if(server){
        server.close(() => {
            process.exit(1)
        });
    }
     process.exit(1)
})

process.on("unhandledRejection", (err) => {
    console.log("Unhandled Rejecttion detected... Server is shutting down..", err);

    if(server){
        server.close(() => {
            process.exit(1)
        });
    }
    process.exit(1)
})

process.on("uncoughtExeption", (err) => {
    console.log("UncoughtExeption Rejecttion detected... Server is shutting down..", err);

    if(server){
        server.close(() => {
            process.exit(1)
        });
    }
    process.exit(1)
})

//Unhandle exeption error
//Promise.reject(new Error("I forgot to catch the promise"))


process.on("SIGTERM", (err) => {
    console.log("SIGTERM signal recieved... Server is shutting down..", err);

    if(server){
        server.close(() => {
            process.exit(1)
        });
    }
     process.exit(1)
})

