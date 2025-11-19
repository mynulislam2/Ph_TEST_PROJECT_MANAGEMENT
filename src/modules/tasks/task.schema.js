import { z } from 'zod';

const priorityEnum = z.enum(['Low', 'Medium', 'High']);
const statusEnum = z.enum(['Pending', 'In Progress', 'Done']);

export const createTaskSchema = z.object({
  body: z.object({
    projectId: z.string().uuid(),
    title: z.string().min(2),
    description: z.string().optional(),
    memberId: z.string().uuid().nullable().optional(),
    priority: priorityEnum.default('Medium'),
    status: statusEnum.default('Pending'),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    taskId: z.string().uuid(),
  }),
  body: z
    .object({
      projectId: z.string().uuid().optional(),
      title: z.string().min(2).optional(),
      description: z.string().optional(),
      memberId: z.string().uuid().nullable().optional(),
      priority: priorityEnum.optional(),
      status: statusEnum.optional(),
    })
    .refine((val) => Object.keys(val).length > 0, {
      message: 'At least one field required',
    }),
});

export const listTaskSchema = z.object({
  query: z.object({
    projectId: z.string().uuid().optional(),
    memberId: z.string().uuid().optional(),
    status: statusEnum.optional(),
  }),
});

export const autoAssignSchema = z.object({
  body: z.object({
    projectId: z.string().uuid(),
  }),
});

