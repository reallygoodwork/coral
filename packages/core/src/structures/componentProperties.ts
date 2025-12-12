import * as z from "zod";

import { zCoralNameSchema } from "./name";
import { zCoralTSTypes } from "./TSTypes";

/**
 * Represents a generic value that can be any valid type.
 * Uses z.unknown() instead of z.any() for type safety - TypeScript will
 * require type narrowing before use, preventing unsafe operations.
 */
const genericValue = z.unknown();

/**
 * Represents the type definition for a component property.
 * Can be a single type or an array of types used as a union (OR).
 */
const propertyType = z.union([
  zCoralTSTypes,
  z.array(zCoralTSTypes).describe("An array of types used as or"),
]);

/**
 * Component property with type, options, and default value.
 * Used for properties that have configuration options.
 */
const propertyWithOptions = z.object({
  type: propertyType,
  options: z
    .record(z.string(), genericValue)
    .nullish()
    .describe("The options of the variant"),
  defaultValue: genericValue.describe("The default value of the component property"),
});

/**
 * Component property with type and value.
 * Used for properties that have a fixed value.
 */
const propertyWithValue = z.object({
  type: propertyType,
  value: genericValue.describe("The value of the variant property"),
});

export const zCoralComponentPropertySchema = z
  .record(
    zCoralNameSchema.describe("The name of the component property"),
    z.union([
      genericValue,
      propertyWithOptions,
      propertyWithValue,
    ])
  )
  .describe("The properties passed to the component");

export type CoralComponentPropertyType = z.infer<
  typeof zCoralComponentPropertySchema
>;
