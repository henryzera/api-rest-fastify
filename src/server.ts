import fastify from "fastify";
import { db } from "./database.js";
import crypto from 'node:crypto'

const app = fastify();

app.get("/hello", async () => {
  const transactions = await db('transactions')
    .where('amount', 1000)
    .select('*')

  return transactions
});

app.listen({ port: 3000 }).then(() => {
  console.log("HTTP Server Running!");
});
