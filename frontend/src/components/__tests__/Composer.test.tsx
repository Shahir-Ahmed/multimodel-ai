import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Composer from "../Composer";

describe("Composer", () => {
  it("calls onSend with the trimmed text when Enter is pressed", async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();
    render(<Composer placeholder="Send a message" onSend={onSend} />);

    const textarea = screen.getByLabelText("Message");
    await user.type(textarea, "  hello world  {Enter}");

    expect(onSend).toHaveBeenCalledWith("hello world");
    expect(textarea).toHaveValue("");
  });

  it("does not call onSend for empty or whitespace-only input", async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();
    render(<Composer placeholder="Send a message" onSend={onSend} />);

    await user.type(screen.getByLabelText("Message"), "   {Enter}");

    expect(onSend).not.toHaveBeenCalled();
  });

  it("inserts a newline instead of sending on Shift+Enter", async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();
    render(<Composer placeholder="Send a message" onSend={onSend} />);

    const textarea = screen.getByLabelText("Message");
    await user.type(textarea, "line one{Shift>}{Enter}{/Shift}line two");

    expect(onSend).not.toHaveBeenCalled();
    expect(textarea).toHaveValue("line one\nline two");
  });

  it("disables the send button while disabled", () => {
    render(<Composer placeholder="Send a message" disabled onSend={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled();
  });
});
