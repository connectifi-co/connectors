import { z } from 'zod';

export const FDC3ContextSchema = z.object({
  type: z.string(),
  id: z.any(),
});

export const FDC3ContextListSchema = z.object({
  contexts: z.array(FDC3ContextSchema),
});
