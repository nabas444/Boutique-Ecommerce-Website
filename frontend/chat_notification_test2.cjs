const io = require("socket.io-client");
const fetch = global.fetch || require("node-fetch");

const BASE = process.env.BASE || "http://backend:4000";
const API = BASE + "/api";

async function login(email, password) {
  const res = await fetch(API + "/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

(async () => {
  try {
    console.log("Logging in as customer...");
    const cust = await login("customer@example.com", "Customer@1234");
    if (!cust.success) {
      console.error("Customer login failed", cust);
      process.exit(1);
    }
    const custToken = cust.data.accessToken;

    // ensure chat room exists
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
    console.log("Room id:", roomId);

    // connect customer socket
    const socketUrl = BASE;
    console.log("Connecting customer socket...");
    const custSocket = io(socketUrl, {
      auth: { token: custToken },
      transports: ["websocket", "polling"],
    });
    custSocket.on("connect", () => console.log("Customer socket connected"));
    custSocket.on("disconnect", () =>
      console.log("Customer socket disconnected"),
    );
    custSocket.on("chat:notification", (p) =>
      console.log("Customer received chat:notification", p),
    );
    custSocket.on("chat:message", (m) =>
      console.log("Customer received chat:message", m.id, m.body),
    );

    // wait for customer socket to connect
    await sleep(1000);

    console.log("Logging in as admin...");
    const adm = await login("admin@boutique.com", "Admin@1234");
    if (!adm.success) {
      console.error("Admin login failed", adm);
      process.exit(1);
    }
    const admToken = adm.data.accessToken;

    console.log("Connecting admin socket...");
    const adminSocket = io(socketUrl, {
      auth: { token: admToken },
      transports: ["websocket", "polling"],
    });
    adminSocket.on("connect", async () => {
      console.log("Admin socket connected, sending message to room...");
      adminSocket.emit("chat:message", {
        roomId,
        body: "Test admin -> user notification",
      });
    });
    adminSocket.on("chat:message", (m) =>
      console.log("Admin received chat:message", m.id),
    );

    // wait to receive notification
    await sleep(3000);

    // cleanup
    adminSocket.disconnect();
    custSocket.disconnect();
    console.log("Done");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
