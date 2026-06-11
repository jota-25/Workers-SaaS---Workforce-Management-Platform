import {Redis} from "@upstash/redis";


export const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});



export async function connectRedis()
 { try { await redis.set("connection_test", "ok");
   console.log("Redis conectado correctamente"

   );
   } 
   catch (error) { 
    console.error("Error conectando Redis:", error);
     throw error; 
  } 
} 