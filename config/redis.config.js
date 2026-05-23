import { createClient } from "redis";

let client = null;
let isConnected = false;

export async function connectRedis() {
  if (client) return client;

  if (!process.env.REDIS_URL) {
    console.log("REDIS_URL not set. Redis caching will be disabled.");
    return null;
  }

  client = createClient({ 
    url: process.env.REDIS_URL,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 3) {
          console.log("Redis reconnection max retries reached. Caching disabled.");
          isConnected = false;
          return false; // stop retrying
        }
        return 1000;
      }
    }
  });

  client.on("error", (err) => {
    console.error("Redis error:", err.message);
    isConnected = false;
  });

  client.on("connect", () => {
    isConnected = true;
  });

  try {
    await client.connect();
    console.log("Redis connected");
  } catch (err) {
    console.error("Failed to connect to Redis. Caching will be disabled.");
    isConnected = false;
  }

  return client;
}

export function getRedisClient() {
  if (!client || !isConnected) return null;
  return client;
}

export default { connectRedis, getRedisClient };
