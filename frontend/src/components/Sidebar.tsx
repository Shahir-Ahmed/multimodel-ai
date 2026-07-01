import { deriveTitle, useConversations } from "../state/conversations";
import Icon from "./Icon";

export default function Sidebar() {
  const { conversations, activeConversation, newConversation, selectConversation, deleteConversation } =
    useConversations();

  const sorted = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <nav className="sidebar" aria-label="Conversations">
      <div className="sidebar-brand">
        <Icon name="spark" size={20} />
        <span>Multimodel AI</span>
      </div>

      <button type="button" className="new-chat-button" onClick={newConversation}>
        <Icon name="plus" size={16} />
        New chat
      </button>

      <ul className="history-list">
        {sorted.map((conversation) => {
          const isActive = conversation.id === activeConversation?.id;
          const title = deriveTitle(conversation);
          return (
            <li key={conversation.id} className={`history-item${isActive ? " is-active" : ""}`}>
              <button
                type="button"
                className="history-item-button"
                aria-current={isActive ? "true" : undefined}
                onClick={() => selectConversation(conversation.id)}
              >
                <Icon name={conversation.document ? "file" : "chat"} size={14} />
                <span className="history-item-title">{title}</span>
              </button>
              <button
                type="button"
                className="history-item-delete"
                aria-label={`Delete conversation: ${title}`}
                onClick={() => deleteConversation(conversation.id)}
              >
                <Icon name="close" size={12} />
              </button>
            </li>
          );
        })}
      </ul>

      <style>{`
        .sidebar {
          width: 260px;
          flex-shrink: 0;
          background: var(--bg-surface);
          border-right: 1px solid var(--border-hairline);
          padding: var(--space-5) var(--space-3) var(--space-3);
          display: flex;
          flex-direction: column;
          min-height: 0;
        }
        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: 0 var(--space-3) var(--space-5);
          font-weight: 500;
          font-size: 14px;
          color: var(--text-primary);
        }
        .new-chat-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          padding: var(--space-3);
          margin-bottom: var(--space-4);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-strong);
          background: var(--bg-surface-raised);
          color: var(--text-primary);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }
        .new-chat-button:hover {
          border-color: var(--text-secondary);
        }
        .history-list {
          list-style: none;
          margin: 0;
          padding: 0;
          overflow-y: auto;
          flex: 1;
          min-height: 0;
        }
        .history-item {
          display: flex;
          align-items: center;
          gap: var(--space-1);
        }
        .history-item-button {
          flex: 1;
          min-width: 0;
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-md);
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-size: 13px;
          text-align: left;
          cursor: pointer;
        }
        .history-item-title {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .history-item-button:hover {
          background: var(--bg-surface-raised);
          color: var(--text-primary);
        }
        .history-item.is-active .history-item-button {
          background: var(--bg-surface-raised);
          color: var(--text-primary);
        }
        .history-item-delete {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          display: none;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: var(--radius-sm);
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
        }
        .history-item:hover .history-item-delete {
          display: flex;
        }
        .history-item-delete:hover {
          color: var(--danger);
        }

        @media (max-width: 640px) {
          .sidebar {
            width: 100%;
            max-height: 40vh;
            border-right: none;
            border-bottom: 1px solid var(--border-hairline);
          }
        }
      `}</style>
    </nav>
  );
}
