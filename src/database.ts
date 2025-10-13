import knex from "knex";
import type { Knex } from "knex";
import 'dotenv/config' //process.env

if(!process.env.DATABASE_URL){
  throw new Error('DATABASE_URL env not found.')
}

export const config: Knex.Config = {
  client: "sqlite3",
  connection: {
    filename: process.env.DATABASE_URL
  },
  useNullAsDefault: true,
  migrations: {
    extension: "ts",
    directory: "./db/migrations",
  },
};

export const db = knex(config);
