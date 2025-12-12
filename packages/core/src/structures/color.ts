import * as z from "zod";

/**
 * Represents a color with its hex, RGB, and HSL values.
 * Hex must be a valid hex color string.
 * RGB must be between 0 and 255 and must be a number.
 * RGBA must be between 0 and 1 and must be a number.
 * HSL must be between 0 and 360 and must be a number.
 * HSLA must be between 0 and 100 and must be a number.
 */
export const zCoralColorSchema = z.object({
  hex: z.string(),
  rgb: z.object({
    r: z.number().min(0).max(255, { message: 'R must be between 0 and 255' }),
    g: z.number().min(0).max(255, { message: 'G must be between 0 and 255' }),
    b: z.number().min(0).max(255, { message: 'B must be between 0 and 255' }),
    a: z.number().min(0).max(1, { message: 'A must be between 0 and 1' }),
  }),
  hsl: z.object({
    h: z.number().min(0).max(360, { message: 'H must be between 0 and 360' }),
    s: z.number().min(0).max(100, { message: 'S must be between 0 and 100' }),
    l: z.number().min(0).max(100, { message: 'L must be between 0 and 100' }),
    a: z.number().min(0).max(1, { message: 'A must be between 0 and 1' }),
  }),
}).describe("A color with its hex, RGB, and HSL values");

export type CoralColorType = z.infer<typeof zCoralColorSchema>