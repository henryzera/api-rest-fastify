import fastify from "fastify";
import { db } from "./database.js";

const app = fastify();

app.get("/hello", async () => {
  const tables = await db('sqlite_schema').select('*')

  return tables
});

app.listen({ port: 3000 }).then(() => {
  console.log("HTTP Server Running!");
});
