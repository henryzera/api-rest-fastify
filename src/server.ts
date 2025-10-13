import fastify from "fastify";
import { db } from "./database.js";
import crypto from 'node:crypto'
import { env } from "../env/index.js";

const app = fastify();

app.get("/hello", async () => {
  const transactions = await db('transactions')
    .where('amount', 1000)
    .select('*')

  return transactions
});

app.listen({ port: env.PORT }).then(() => {
  console.log("HTTP Server Running!");
});
