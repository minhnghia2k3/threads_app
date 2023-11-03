import mongoose from "mongoose";

let isConnected = false;

export const connectToDB = async () => {
    // Set strict query
    mongoose.set("strictQuery", true);

    if (!process.env.MONGODB_URI) return console.log("Mongoose URI is missing!")
    if (isConnected) return console.log("Database is already connected!")

    try {
        await mongoose.connect(process.env.MONGODB_URI)

        isConnected = true;

        console.log("Connected to DB!")

    } catch (err) {
        console.log("Error when connect to DB: ", err)
    }
}