import IORedis from "ioredis";
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
export const redis = new IORedis(REDIS_URL);
redis.on("error", (err) => { console.error("Redis error", err); });
export default redis;
