import { z } from "zod";

export const createWorkerSchema = z.object({
  name: z.string().min(3).max(100),
  email: z.string().email(),
  position: z.string().min(2)
});

export const updateWorkerSchema = z.object({
  name: z.string().min(3).optional(),
  email: z.string().email().optional(),
  position: z.string().min(2).optional()
});

 export const idSchema = z.object({
  id: z.coerce.number()
});