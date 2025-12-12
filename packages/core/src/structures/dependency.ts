import * as z from "zod";

/**
 * Represents a dependency of another Coral document in a Coral Component.
 * Name is the name of the dependency.
 * Version is the version of the dependency.
 * Path is the path to the dependency.
 */
export const zCoralDependencySchema = z.object({
  name: z.string().describe("The name of the dependency"),
  version: z.string().describe("The version of the dependency"),
  path: z.string().describe("The path to the dependency"),
}).describe("An object representing a dependency of another Coral document in a Coral Component");

export type CoralDependencyType = z.infer<typeof zCoralDependencySchema>;