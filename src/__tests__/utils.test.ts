import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn utility function", () => {
  it("should merge class names correctly", () => {
    expect(cn("btn", "btn-primary")).toBe("btn btn-primary");
  });

  it("should handle conditional classes", () => {
    expect(cn("btn", false && "btn-disabled", "btn-primary")).toBe("btn btn-primary");
  });

  it("should merge tailwind classes without duplicates", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("px-4 py-1");
  });

  it("should handle empty inputs", () => {
    expect(cn()).toBe("");
  });
});
