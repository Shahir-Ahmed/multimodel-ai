import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MessageBubble from "../MessageBubble";
import type { ChatMessage } from "../../types";

describe("MessageBubble", () => {
  it("renders the message content", () => {
    const message: ChatMessage = { id: "1", role: "user", content: "Hello there" };
    render(<MessageBubble message={message} />);

    expect(screen.getByText("Hello there")).toBeInTheDocument();
  });

  it("shows the provider and latency for assistant messages", () => {
    const message: ChatMessage = {
      id: "2",
      role: "assistant",
      content: "Hi! How can I help?",
      provider: "groq",
      latencyMs: 184,
    };
    render(<MessageBubble message={message} />);

    expect(screen.getByText(/groq/i)).toBeInTheDocument();
    expect(screen.getByText(/184ms/)).toBeInTheDocument();
  });

  it("does not show provider metadata for user messages", () => {
    const message: ChatMessage = { id: "3", role: "user", content: "What's the weather?" };
    render(<MessageBubble message={message} />);

    expect(screen.queryByText(/ms/)).not.toBeInTheDocument();
  });
});
