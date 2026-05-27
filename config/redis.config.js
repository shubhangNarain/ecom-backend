import dotenv from "dotenv";

dotenv.config({ path: "./env/.env" });

let client = null;
let isConnected = false;

export async function connectRedis() {
  if (client) return client;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.log("UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set. Redis caching will be disabled.");
    return null;
  }

  // Define client methods
  client = {
    async get(key) {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(["GET", key]),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        return data.result; // This is the string/null
      } catch (err) {
        console.error(`[redis client] get error for key ${key}:`, err.message);
        throw err;
      }
    },

    async setEx(key, ttl, value) {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(["SET", key, value, "EX", ttl]),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        return data.result;
      } catch (err) {
        console.error(`[redis client] setEx error for key ${key}:`, err.message);
        throw err;
      }
    },

    async keys(pattern) {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(["KEYS", pattern]),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        return data.result || [];
      } catch (err) {
        console.error(`[redis client] keys error for pattern ${pattern}:`, err.message);
        throw err;
      }
    },

    async del(keys) {
      try {
        const keysArray = Array.isArray(keys) ? keys : [keys];
        if (keysArray.length === 0) return 0;
        const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(["DEL", ...keysArray]),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        return data.result;
      } catch (err) {
        console.error(`[redis client] del error for keys:`, err.message);
        throw err;
      }
    }
  };

  try {
    // Perform PING to verify connection
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["PING"]),
    });
    if (!response.ok) {
      throw new Error(`PING HTTP status ${response.status}`);
    }
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    if (data.result === "PONG") {
      console.log("[upstash/redis] : Upstash Redis connected (HTTP REST API)");
      isConnected = true;
    } else {
      throw new Error(`Unexpected PING response: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    console.error("Failed to connect to Upstash Redis. Caching will be disabled.", err.message);
    client = null;
    isConnected = false;
  }

  return client;
}

export function getRedisClient() {
  if (!client || !isConnected) return null;
  return client;
}

export default { connectRedis, getRedisClient };
