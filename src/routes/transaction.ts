import {randomUUID} from 'node:crypto';
import type { FastifyInstance } from "fastify";
import {z} from 'zod'
import { db } from "../database.js";
import { checkSessionIdExists } from '../middlewares/check-session-id-exists.js';

export async function transactionsRoutes(app: FastifyInstance){
    
    app.get("/",
    {
        preHandler: [checkSessionIdExists]
    },
    async (req, res)=>{

        const sessionId = req.cookies.sessionId

        const transactions = await db('transactions')
            .where('session_id', sessionId)
            .select()

        return { transactions }
    });

    app.get("/:id", {
        preHandler: [checkSessionIdExists]
    }, 
    async (req, res)=>{
        const getTransactionParamsSchema = z.object({
            id : z.string().uuid(),
        })

        const { id } = getTransactionParamsSchema.parse(req.params)
        
        const { sessionId } = req.cookies

        const transaction = await db('transactions')
            .where({
                'session_id': sessionId,
                id
            })
            .first()

        if(!transaction){
            res.send('Página inacessível...')
        }

        return transaction
    })

    app.get('/sumary', {
        preHandler: [checkSessionIdExists]
    }, async(req, res)=>{

        const {sessionId} = req.cookies

        const sumary = await db('transactions')
            .where('session_id', sessionId)
            .sum('amount', { as: 'amount'})
            .first()

        return {sumary}
    })
    
    app.post("/", async (req, res) => {
        const createTransactionBodySchema = z.object({
            title: z.string(),
            amount: z.number(),
            type: z.enum(['credit', 'debit'])
        })

        const { title, amount, type} = createTransactionBodySchema.parse(req.body)

        let sessionId = req.cookies.sessionId

        if(!sessionId){
            sessionId = randomUUID()

            res.cookie('sessionId', sessionId, {
                path: '/',
                maxAge: 1 * 60 * 60 * 24 // 1 day
            })
        }

        await db('transactions').insert({
            id: randomUUID(),
            title,
            amount: type === 'credit' ? amount : -1 * amount,
            session_id: sessionId
        })

        return res.status(201).send()
    });
}
