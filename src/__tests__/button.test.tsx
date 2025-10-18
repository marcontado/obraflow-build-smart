import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button Component", () => {
  it("should render button with text", () => {
    const { getByText } = render(<Button>Click me</Button>);
    const button = getByText("Click me");
    expect(button).toBeDefined();
  });

  it("should apply default variant", () => {
    const { getByText } = render(<Button>Default</Button>);
    const button = getByText("Default");
    expect(button.className).toContain("bg-primary");
  });

  it("should apply secondary variant", () => {
    const { getByText } = render(<Button variant="secondary">Secondary</Button>);
    const button = getByText("Secondary");
    expect(button.className).toContain("bg-secondary");
  });

  it("should be disabled when disabled prop is true", () => {
    const { getByText } = render(<Button disabled>Disabled</Button>);
    const button = getByText("Disabled") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });
});
