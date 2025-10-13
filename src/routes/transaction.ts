import type { FastifyInstance } from "fastify";
import { db } from "../database.js";

export async function transactionsRoutes(app: FastifyInstance){
   app.get("/hello", async () => {
     const transactions = await db('transactions')
       .where('amount', 1000)
       .select('*')
   
     return transactions
   });

   
}

