import {randomUUID} from 'node:crypto';
import type { FastifyInstance } from "fastify";
import {z} from 'zod'
import { db } from "../database.js";

export async function transactionsRoutes(app: FastifyInstance){
    app.post("/", async (req, res) => {
        const createTransactionBodySchema = z.object({
            title: z.string(),
            amount: z.number(),
            type: z.enum(['credit', 'debit'])
        })

        const { title, amount, type} = createTransactionBodySchema.parse(req.body)

        const transaction = await db('transactions')
            .insert({
                id: randomUUID(),
                title,
                amount: type === 'credit' ? amount : amount * -1,
            })
        return res.status(201).send()
    });
}
