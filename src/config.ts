import { connect } from "mongoose";

export async function startMongoClient() {
    connect("mongodb://localhost:27017/miguelodev")
        .then(() => console.log('DB connection successful!'))
        .catch(() => console.error.bind(console, 'connection error:'));
}