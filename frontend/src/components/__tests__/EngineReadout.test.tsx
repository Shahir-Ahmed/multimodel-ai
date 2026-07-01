import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import EngineReadout from "../EngineReadout";

describe("EngineReadout", () => {
  it("marks the active engine with aria-pressed", () => {
    render(<EngineReadout active="gemini" onChange={vi.fn()} lastLatencyMs={null} />);

    expect(screen.getByRole("button", { name: /gemini/i })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /groq/i })).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onChange with the clicked provider", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<EngineReadout active="gemini" onChange={onChange} lastLatencyMs={null} />);

    await user.click(screen.getByRole("button", { name: /groq/i }));

    expect(onChange).toHaveBeenCalledWith("groq");
  });

  it("shows a placeholder until a latency value is available", () => {
    const { rerender } = render(<EngineReadout active="gemini" onChange={vi.fn()} lastLatencyMs={null} />);
    expect(screen.getByText("—")).toBeInTheDocument();

    rerender(<EngineReadout active="gemini" onChange={vi.fn()} lastLatencyMs={612} />);
    expect(screen.getByText("612ms")).toBeInTheDocument();
  });
});
