import * as z from 'zod'

export const zCoralDesignTokenSchema = z.object({
  $type: z.string(),
  $value: z.union([z.number(), z.string(), z.record(z.string(), z.unknown())]),
  $description: z.string().optional(),
})

export type CoralDesignTokenType = z.infer<typeof zCoralDesignTokenSchema>
