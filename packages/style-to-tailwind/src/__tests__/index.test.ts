import { greet } from "../index";

describe("greet", () => {
  it("should return a greeting with the provided name", () => {
    expect(greet("World")).toBe("Hello, World!");
  });

  it("should return a string", () => {
    expect(typeof greet("Test")).toBe("string");
  });
});
