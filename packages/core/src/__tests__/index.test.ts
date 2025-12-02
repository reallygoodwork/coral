import { hello } from "../index";

describe("hello", () => {
  it("should return a greeting message", () => {
    expect(hello()).toBe("Hello, World!");
  });

  it("should return a string", () => {
    expect(typeof hello()).toBe("string");
  });
});
