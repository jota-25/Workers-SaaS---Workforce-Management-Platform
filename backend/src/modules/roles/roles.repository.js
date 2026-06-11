import { prisma } from "../../lib/prisma.js";
import {redis} from "../../lib/redis.js";

export const roleRepository = {

  async findById(id) {

    const cacheKey = `role:id:${id}`;
    const cachedRole = await redis.get(cacheKey);

    if (cachedRole) {
      console.log(`Redis hit -> ${cacheKey}`);
      return cachedRole;
    }
    console.log(`Redis miss -> ${cacheKey}`);

    const role = await prisma.role.findUnique({
      where: {
        id,
      },
    });
    if (role){
      await redis.set(
        cacheKey,
        role,
        {
          EX: 3600, // Expira en 1 hora
        }
      );
    }
    return role;
  },

  async findByName(name) {

    const cacheKey = `role:name:${name}`;
    const cachedRole = await redis.get(cacheKey);

    if (cachedRole) {
      console.log(`Redis hit -> ${cacheKey}`);
      return cachedRole;
    }
    console.log(`Redis miss -> ${cacheKey}`);
    
    const role= await prisma.role.findUnique({
      where: {
        name,
      },
    });
   if (role) {
    await redis.set(cacheKey,role, {

      EX: 3600, // Expira en 1 hora
    }
  );

   }
  return role;
 },
};