import * as z from 'zod'

/**
 * Represents a name of a component property.
 * Must be between 1 and 255 characters and can only contain letters, numbers, and underscores.
 */
export const zCoralNameSchema = z
  .string()
  .regex(/^[a-zA-Z_$][0-9a-zA-Z_$]*$/)
  .min(1)
  .max(255)
  .refine(
    (value) => {
      return (
        value.length >= 1 &&
        value.length <= 255 &&
        /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(value)
      )
    },
    {
      message:
        'Name must be between 1 and 255 characters and can only contain letters, numbers, and underscores.',
    },
  )

export type CoralNameType = z.infer<typeof zCoralNameSchema>
