import { z } from 'zod';

export const listActivitySchema = z.object({
  query: z.object({
    limit: z
      .string()
      .transform((value) => Number(value))
      .refine((value) => Number.isFinite(value) && value > 0 && value <= 20, {
        message: 'limit must be between 1 and 20',
      })
      .optional(),
  }),
});

