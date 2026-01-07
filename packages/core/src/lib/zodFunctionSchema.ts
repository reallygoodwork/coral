import * as z from 'zod'

export const functionSchema = <T extends z.core.$ZodFunction>(schema: T) =>
  z.custom<Parameters<T['implement']>[0]>((fn) => {
    try {
      // Type assertion through unknown is safer than any
      // We validate at runtime by attempting to implement the function
      schema.implement(fn as unknown as Parameters<T['implement']>[0])
      return true
    } catch {
      return false
    }
  })

export const createAsyncFunctionSchema = <T extends z.core.$ZodFunction>(
  schema: T,
) =>
  z.custom<Parameters<T['implementAsync']>[0]>((fn) => {
    try {
      // Type assertion through unknown is safer than any
      // We validate at runtime by attempting to implement the function
      schema.implementAsync(fn as unknown as Parameters<T['implementAsync']>[0])
      return true
    } catch {
      return false
    }
  })
