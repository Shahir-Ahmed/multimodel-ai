import { createContext, useContext, useEffect, useReducer, type ReactNode } from "react";
import type { ChatMessage, Conversation, DocumentMeta } from "../types";

const STORAGE_KEY = "multimodel-ai:conversations";

interface State {
  conversations: Conversation[];
  activeId: string;
}

type Action =
  | { type: "NEW_CONVERSATION" }
  | { type: "SELECT"; id: string }
  | { type: "DELETE"; id: string }
  | { type: "ADD_MESSAGE"; conversationId: string; message: ChatMessage }
  | { type: "ATTACH_DOCUMENT"; conversationId: string; document: DocumentMeta }
  | { type: "DETACH_DOCUMENT"; conversationId: string };

function createConversation(): Conversation {
  const now = Date.now();
  return { id: crypto.randomUUID(), createdAt: now, updatedAt: now, messages: [] };
}

function loadInitialState(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as State;
      if (parsed.conversations?.length && parsed.activeId) {
        return parsed;
      }
    }
  } catch {
    // Corrupt or inaccessible storage - fall back to a fresh conversation
    // rather than crashing the app on load.
  }
  const first = createConversation();
  return { conversations: [first], activeId: first.id };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "NEW_CONVERSATION": {
      const conversation = createConversation();
      return { conversations: [conversation, ...state.conversations], activeId: conversation.id };
    }

    case "SELECT":
      return { ...state, activeId: action.id };

    case "DELETE": {
      const remaining = state.conversations.filter((c) => c.id !== action.id);
      if (remaining.length === 0) {
        const fresh = createConversation();
        return { conversations: [fresh], activeId: fresh.id };
      }
      const activeId = state.activeId === action.id ? remaining[0].id : state.activeId;
      return { conversations: remaining, activeId };
    }

    case "ADD_MESSAGE":
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.conversationId
            ? { ...c, messages: [...c.messages, action.message], updatedAt: Date.now() }
            : c,
        ),
      };

    case "ATTACH_DOCUMENT":
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.conversationId ? { ...c, document: action.document, updatedAt: Date.now() } : c,
        ),
      };

    case "DETACH_DOCUMENT":
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.conversationId ? { ...c, document: undefined, updatedAt: Date.now() } : c,
        ),
      };

    default:
      return state;
  }
}

interface ConversationContextValue {
  conversations: Conversation[];
  activeConversation: Conversation | undefined;
  newConversation: () => void;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  addMessage: (conversationId: string, message: ChatMessage) => void;
  attachDocument: (conversationId: string, document: DocumentMeta) => void;
  detachDocument: (conversationId: string) => void;
}

const ConversationContext = createContext<ConversationContextValue | null>(null);

export function ConversationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitialState);

  // Persist after every change so a page reload doesn't lose history either -
  // the in-memory fix alone would only survive until the tab closes.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage full/unavailable (e.g. private browsing) - history just
      // won't survive a reload. Not worth failing the app over.
    }
  }, [state]);

  const value: ConversationContextValue = {
    conversations: state.conversations,
    activeConversation: state.conversations.find((c) => c.id === state.activeId),
    newConversation: () => dispatch({ type: "NEW_CONVERSATION" }),
    selectConversation: (id) => dispatch({ type: "SELECT", id }),
    deleteConversation: (id) => dispatch({ type: "DELETE", id }),
    addMessage: (conversationId, message) => dispatch({ type: "ADD_MESSAGE", conversationId, message }),
    attachDocument: (conversationId, document) => dispatch({ type: "ATTACH_DOCUMENT", conversationId, document }),
    detachDocument: (conversationId) => dispatch({ type: "DETACH_DOCUMENT", conversationId }),
  };

  return <ConversationContext.Provider value={value}>{children}</ConversationContext.Provider>;
}

export function useConversations() {
  const ctx = useContext(ConversationContext);
  if (!ctx) {
    throw new Error("useConversations must be used within a ConversationProvider");
  }
  return ctx;
}

/** Conversations don't store a title - it's derived so it's always in sync
 * with whatever actually happened in the thread, with nothing to forget to update. */
export function deriveTitle(conversation: Conversation): string {
  const firstUserMessage = conversation.messages.find((m) => m.role === "user")?.content;
  const base = firstUserMessage ?? conversation.document?.name ?? "New chat";
  return base.length > 42 ? `${base.slice(0, 42)}…` : base;
}
