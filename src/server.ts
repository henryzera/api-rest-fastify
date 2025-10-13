import fastify from "fastify";
import { db } from "./database.js";
import crypto from 'node:crypto'
import { env } from "../env/index.js";
import { transactionsRoutes } from "./routes/transaction.js";

const app = fastify();

app.register(transactionsRoutes)

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
  console.log("HTTP Server Running!");
});
