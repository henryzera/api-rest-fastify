import {it, expect, beforeAll, afterAll, describe, beforeEach} from 'vitest'
import request from 'supertest'
import { app } from '../src/app.js'
import { execSync } from 'child_process'

describe('Transactions routes', () => {
    beforeAll(async ()=>{
        await app.ready()
    })

    afterAll(async ()=>{
        await app.close()
    })

    beforeEach(() => {
        execSync('npm run knex migrate:rollback --all')
        execSync('npm run knex migrate:latest')
    })

    it('should be able to create a new transaction', async () => {
        await request(app.server)
            .post('/transactions')
            .send({
                title: 'New transactions',
                amount: 5000,
                type: 'credit'
            })
            .expect(201)
    })

    it('should be able to list all transactions', async () =>{
        const createTransactionsResponse = await request(app.server)
            .post('/transactions')
            .send({
                title: 'New transaction',
                amount: 5000,
                type: 'credit'
            })
            .expect(201)

        const cookies = createTransactionsResponse.get('Set-Cookie')

        const listTransactionsResponse = await request(app.server)
            .get('/transactions')
            .set('Cookie', cookies!)
            .expect(200)

        expect(listTransactionsResponse.body.transactions).toEqual([
            expect.objectContaining({
                title: 'New transaction',
                amount: 5000
            })
        ])
        
    })

    it('should be able to sum transactions amount', async ()=>{
        const createTransactionsResponse = await request(app.server)
            .post('/transactions')
            .send({
                title: 'New transaction',
                amount: 5000,
                type: 'credit'
            })
            .expect(201) 

        const cookie = createTransactionsResponse.get('set-cookie')
        
        await request(app.server)
            .post('/transactions')
            .set('Cookie', cookie!)
            .send({
                title: 'New transaction',
                amount: 6000,
                type: 'credit'
            })
            .expect(201)

        const sumaryResponse = await request(app.server)
            .get('/transactions/sumary')
            .set('Cookie', cookie!)
            .expect(200)

        expect(sumaryResponse.body.sumary).toEqual({
            amount: 11000
        })
    })
})

//{ sumary: { amount: 11000 } }