"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// env/index.ts
var import_dotenv = require("dotenv");
var import_zod = require("zod");
if (process.env.NODE_ENV === "test") {
  (0, import_dotenv.config)({ path: ".env.test" });
} else {
  (0, import_dotenv.config)();
}
var envSchema = import_zod.z.object({
  NODE_ENV: import_zod.z.enum(["development", "test", "production"]).default("production"),
  DATABASE_URL: import_zod.z.string(),
  PORT: import_zod.z.number().default(3333)
});
var _env = envSchema.safeParse(process.env);
if (_env.success === false) {
  console.error("\u26A0\uFE0F Invalid enviroment variables!", _env.error.format());
  throw new Error("Invalid enviroment variables.");
}
var env = _env.data;

// src/routes/transaction.ts
var import_node_crypto = require("crypto");
var import_zod2 = require("zod");

// src/database.ts
var import_knex = __toESM(require("knex"), 1);
var config2 = {
  client: "sqlite3",
  connection: {
    filename: env.DATABASE_URL
  },
  useNullAsDefault: true,
  migrations: {
    extension: "ts",
    directory: "./db/migrations"
  }
};
var db = (0, import_knex.default)(config2);

// src/middlewares/check-session-id-exists.ts
async function checkSessionIdExists(req, res) {
  const sessionId = req.cookies.sessionId;
  if (!sessionId) {
    res.status(401).send({
      error: "Unauthorized"
    });
  }
}

// src/routes/transaction.ts
async function transactionsRoutes(app2) {
  app2.get(
    "/",
    {
      preHandler: [checkSessionIdExists]
    },
    async (req, res) => {
      const sessionId = req.cookies.sessionId;
      const transactions = await db("transactions").where("session_id", sessionId).select();
      return { transactions };
    }
  );
  app2.get(
    "/:id",
    {
      preHandler: [checkSessionIdExists]
    },
    async (req, res) => {
      const getTransactionParamsSchema = import_zod2.z.object({
        id: import_zod2.z.string().uuid()
      });
      const { id } = getTransactionParamsSchema.parse(req.params);
      const { sessionId } = req.cookies;
      const transaction = await db("transactions").where({
        "session_id": sessionId,
        id
      }).first();
      if (!transaction) {
        res.send("P\xE1gina inacess\xEDvel...");
      }
      return { transaction };
    }
  );
  app2.get("/sumary", {
    preHandler: [checkSessionIdExists]
  }, async (req, res) => {
    const { sessionId } = req.cookies;
    const sumary = await db("transactions").where("session_id", sessionId).sum("amount", { as: "amount" }).first();
    return { sumary };
  });
  app2.post("/", async (req, res) => {
    const createTransactionBodySchema = import_zod2.z.object({
      title: import_zod2.z.string(),
      amount: import_zod2.z.number(),
      type: import_zod2.z.enum(["credit", "debit"])
    });
    const { title, amount, type } = createTransactionBodySchema.parse(req.body);
    let sessionId = req.cookies.sessionId;
    if (!sessionId) {
      sessionId = (0, import_node_crypto.randomUUID)();
      res.cookie("sessionId", sessionId, {
        path: "/",
        maxAge: 1 * 60 * 60 * 24
        // 1 day
      });
    }
    await db("transactions").insert({
      id: (0, import_node_crypto.randomUUID)(),
      title,
      amount: type === "credit" ? amount : -1 * amount,
      session_id: sessionId
    });
    return res.status(201).send();
  });
}

// src/app.ts
var import_fastify = __toESM(require("fastify"), 1);
var import_cookie = __toESM(require("@fastify/cookie"), 1);
var app = (0, import_fastify.default)();
app.register(import_cookie.default);
app.register(transactionsRoutes, {
  prefix: "transactions"
});

// src/server.ts
app.listen({
  port: env.PORT
}).then(() => {
  console.log("HTTP Server Running!");
});
