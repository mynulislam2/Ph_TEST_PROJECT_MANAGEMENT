import { z } from 'zod';

export const createTeamSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    description: z.string().optional(),
  }),
});

export const addMemberSchema = z.object({
  params: z.object({
    teamId: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(2),
    role: z.string().min(2),
    capacity: z.number().int().min(0).max(5),
  }),
});

