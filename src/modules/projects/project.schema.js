import { z } from 'zod';

export const createProjectSchema = z.object({
  body: z.object({
    teamId: z.string().uuid(),
    name: z.string().min(2),
    description: z.string().optional(),
  }),
});

export const updateProjectSchema = z.object({
  params: z.object({
    projectId: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
  }),
});

