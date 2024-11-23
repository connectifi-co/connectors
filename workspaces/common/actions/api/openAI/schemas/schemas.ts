import { z } from 'zod';

export const FDC3ContextSchema = z.object({
  type: z.string(),
  id: z.object({}),
  //name: z.optional(z.string())
});

export const FDC3InstrumentSchema = z.object({
  type: z.literal('fdc3.instrument'),
  id: z.object({
    ticker: z.string(),
  })
});

export const FDC3ContactSchema = FDC3ContextSchema.extend({
  id: z.object({
    email: z.optional(z.string()),
    FDS_ID: z.optional(z.string()),
  }),
});

export const FDC3InstrumentListSchema = z.object({
  contexts: z.array(FDC3InstrumentSchema)
});
export const FDC3ContextListSchema = z.object({
  contexts: z.array(FDC3ContextSchema)
}) 
export const FDC3ContactListSchema = z.object({
  contexts: z.array(FDC3ContactSchema)
});
