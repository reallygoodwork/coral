import * as z from "zod";

/**
 * Represents a type of a component property.
 * Can be one of the following: string, number, boolean, array, object, null, undefined, function.
 */
export const zCoralTSTypes = z.nullable(
  z.union([
    z.literal("string"),
    z.literal("number"),
    z.literal("boolean"),
    z.literal("array"),
    z.literal("object"),
    z.literal("null"),
    z.literal("undefined"),
    z.literal("function"),
  ])
);

export type CoralTSTypes = z.infer<typeof zCoralTSTypes>;
