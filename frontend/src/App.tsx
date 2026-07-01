import { useState } from "react";
import ChatThread from "./components/ChatThread";
import EngineReadout from "./components/EngineReadout";
import Sidebar from "./components/Sidebar";
import { ConversationProvider } from "./state/conversations";
import type { Provider } from "./types";

export default function App() {
  return (
    <ConversationProvider>
      <AppShell />
    </ConversationProvider>
  );
}

function AppShell() {
  const [provider, setProvider] = useState<Provider>("gemini");
  const [lastLatency, setLastLatency] = useState<number | null>(null);

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="app-main">
        <EngineReadout active={provider} onChange={setProvider} lastLatencyMs={lastLatency} />
        <ChatThread provider={provider} onLatency={setLastLatency} />
      </main>
    </div>
  );
}
