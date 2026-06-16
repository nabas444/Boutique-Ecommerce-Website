const fetch = global.fetch || require("node-fetch");
const path = require("path");
const fs = require("fs");
// Load .env manually if DATABASE_URL not set
if (!process.env.DATABASE_URL) {
  const envPath = path.resolve(__dirname, "..", "..", ".env");
  try {
    const envRaw = fs.readFileSync(envPath, "utf8");
    envRaw.split(/\r?\n/).forEach((line) => {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (m) {
        const key = m[1];
        let val = m[2] || "";
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        if (!(key in process.env)) process.env[key] = val;
      }
    });
  } catch (e) {
    // ignore - will error later if DB not configured
  }
}
// If DATABASE_URL still not set, construct using POSTGRES_* with localhost
if (!process.env.DATABASE_URL) {
  const user = process.env.POSTGRES_USER || process.env.POSTGRES_USER;
  const pass = process.env.POSTGRES_PASSWORD || process.env.POSTGRES_PASSWORD;
  const dbname = process.env.POSTGRES_DB || process.env.POSTGRES_DB;
  if (user && pass && dbname) {
    process.env.DATABASE_URL = `postgresql://${user}:${pass}@localhost:5432/${dbname}`;
  }
}
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

const API = "http://localhost:4000/api";

async function login(email, password) {
  const res = await fetch(API + "/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

(async () => {
  try {
    const cust = await login("customer@example.com", "Customer@1234");
    if (!cust.success) {
      console.error("cust login failed", cust);
      process.exit(1);
    }
    const custToken = cust.data.accessToken;

    const roomRes = await fetch(API + "/chat/rooms", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer " + custToken,
      },
      body: JSON.stringify({ subject: "Customer Support" }),
    });
    const roomJson = await roomRes.json();
    const roomId = roomJson.data.id;
    console.log("roomId", roomId);

    const adm = await login("admin@boutique.com", "Admin@1234");
    if (!adm.success) {
      console.error("admin login failed", adm);
      process.exit(1);
    }
    const adminId = adm.data.user.id;
    console.log("adminId", adminId);

    // insert chat message as admin via Prisma
    const message = await db.chatMessage.create({
      data: {
        roomId,
        senderId: adminId,
        body: "Test admin message via Prisma",
        isAdmin: true,
      },
    });
    console.log("inserted message id", message.id);

    // check unread-count as customer
    const unreadRes = await fetch(API + "/chat/unread-count", {
      headers: { authorization: "Bearer " + custToken },
    });
    const unreadJson = await unreadRes.json();
    console.log("unread count for customer:", unreadJson);

    await db.$disconnect();
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
