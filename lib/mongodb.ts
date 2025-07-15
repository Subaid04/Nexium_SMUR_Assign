// lib/mongodb.ts
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

export const db = client.db("blogdata"); 
export const fulltexts = db.collection("fulltexts");
