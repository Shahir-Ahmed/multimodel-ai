import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { ConversationProvider, deriveTitle, useConversations } from "../conversations";
import type { ChatMessage } from "../../types";

function setup() {
  return renderHook(() => useConversations(), { wrapper: ConversationProvider });
}

beforeEach(() => {
  localStorage.clear();
});

describe("conversation store", () => {
  it("starts with a single empty conversation", () => {
    const { result } = setup();

    expect(result.current.conversations).toHaveLength(1);
    expect(result.current.activeConversation?.messages).toHaveLength(0);
  });

  it("keeps a conversation's messages after switching away and back (the original bug)", () => {
    const { result } = setup();
    const firstId = result.current.activeConversation!.id;
    const message: ChatMessage = { id: "m1", role: "user", content: "hello" };

    act(() => result.current.addMessage(firstId, message));
    act(() => result.current.newConversation());

    // Simulate "switching to a different conversation" - the first one's
    // messages must still be there, not wiped just because it's not active.
    const firstConversation = result.current.conversations.find((c) => c.id === firstId);
    expect(firstConversation?.messages).toEqual([message]);

    act(() => result.current.selectConversation(firstId));
    expect(result.current.activeConversation?.messages).toEqual([message]);
  });

  it("creates a new conversation and makes it active", () => {
    const { result } = setup();
    const originalId = result.current.activeConversation!.id;

    act(() => result.current.newConversation());

    expect(result.current.conversations).toHaveLength(2);
    expect(result.current.activeConversation?.id).not.toBe(originalId);
    expect(result.current.activeConversation?.messages).toHaveLength(0);
  });

  it("combines plain chat and document conversations in one list", () => {
    const { result } = setup();
    const chatId = result.current.activeConversation!.id;

    act(() => result.current.newConversation());
    const docId = result.current.activeConversation!.id;
    act(() => result.current.attachDocument(docId, { docId: "doc-1", name: "report.pdf", charCount: 1200 }));

    const ids = result.current.conversations.map((c) => c.id);
    expect(ids).toContain(chatId);
    expect(ids).toContain(docId);
    expect(result.current.conversations.find((c) => c.id === docId)?.document?.name).toBe("report.pdf");
  });

  it("falls back to another conversation when the active one is deleted", () => {
    const { result } = setup();
    const firstId = result.current.activeConversation!.id;
    act(() => result.current.newConversation());
    const secondId = result.current.activeConversation!.id;

    act(() => result.current.deleteConversation(secondId));

    expect(result.current.conversations).toHaveLength(1);
    expect(result.current.activeConversation?.id).toBe(firstId);
  });

  it("always leaves at least one conversation, even after deleting the last one", () => {
    const { result } = setup();
    const onlyId = result.current.activeConversation!.id;

    act(() => result.current.deleteConversation(onlyId));

    expect(result.current.conversations).toHaveLength(1);
    expect(result.current.activeConversation?.id).not.toBe(onlyId);
  });
});

describe("deriveTitle", () => {
  it("falls back to 'New chat' with no messages or document", () => {
    expect(deriveTitle({ id: "1", createdAt: 0, updatedAt: 0, messages: [] })).toBe("New chat");
  });

  it("uses the document name when no messages exist yet", () => {
    const title = deriveTitle({
      id: "1",
      createdAt: 0,
      updatedAt: 0,
      messages: [],
      document: { docId: "d1", name: "research.pdf", charCount: 500 },
    });
    expect(title).toBe("research.pdf");
  });

  it("uses the first user message, truncated, once one exists", () => {
    const longMessage = "What's the weather going to be like today in Tokyo this week?";
    const title = deriveTitle({
      id: "1",
      createdAt: 0,
      updatedAt: 0,
      messages: [{ id: "m1", role: "user", content: longMessage }],
    });

    expect(title.startsWith(longMessage.slice(0, 42))).toBe(true);
    expect(title.endsWith("…")).toBe(true);
    expect(title.length).toBe(43);
  });
});
