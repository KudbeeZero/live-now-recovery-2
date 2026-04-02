import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { useCanisterState, useIsAdmin } from "../hooks/useQueries";

type Message = { role: "user" | "bot"; text: string };

const QUICK_REPLIES = [
  "Find a live provider",
  "How does Proof of Presence work?",
  "What is Cost Plus Drugs?",
  "I need help now",
];

const BOT_RESPONSES: Record<string, string> = {
  "Find a live provider":
    "Check the live map on the homepage — teal pins show currently verified providers. You can also visit /dashboard for real-time status.",
  "How does Proof of Presence work?":
    "A volunteer or peer specialist generates a QR code linked to a ZIP code. When a patient or provider scans it, the system records an anonymous handoff — no names, no PHI. Each verified scan increments the ZIP-level PoP counter.",
  "What is Cost Plus Drugs?":
    "Mark Cuban Cost Plus Drugs offers generic Suboxone (Buprenorphine/Naloxone 8mg/2mg) for $45.37/month vs $185 retail — saving $139.63/month. Transfer your script to NCPDP ID 5755167. Visit costplusdrugs.com.",
  "I need help now":
    "CALL NOW: Ohio MAR NOW 833-234-6343 — available 24/7. You are not alone. Recovery is possible.",
};

export function SentinelChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Hi! I'm the Live Now Recovery assistant. How can I help you today?",
    },
  ]);
  const { data: canisterState } = useCanisterState();
  const { data: isAdmin } = useIsAdmin();

  const send = (text: string) => {
    const userMsg: Message = { role: "user", text };
    const botText =
      BOT_RESPONSES[text] ??
      "I'm here to help! Try one of the quick options below, or call Ohio MAR NOW: 833-234-6343.";
    const botMsg: Message = { role: "bot", text: botText };
    setMessages((prev) => [...prev, userMsg, botMsg]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[2000]" data-ocid="chat.panel">
      {open && (
        <div className="mb-3 w-80 bg-card border border-border rounded-2xl shadow-card flex flex-col overflow-hidden">
          {/* Chat header */}
          <div className="bg-primary/10 border-b border-border px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-primary" />
              <span className="text-foreground font-semibold text-sm">
                Recovery Assistant
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              data-ocid="chat.close_button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-64">
            {messages.map((m, i) => (
              <div
                key={`msg-${i}-${m.role}`}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted text-foreground rounded-tl-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Admin canister state */}
          {isAdmin && canisterState && (
            <div className="px-4 py-2 bg-secondary border-t border-border">
              <p className="text-xs font-semibold text-foreground mb-1">
                Canister State
              </p>
              <p className="text-xs text-muted-foreground">
                Active providers:{" "}
                {canisterState.total_active_providers.toString()} | High-risk:{" "}
                {canisterState.high_risk_window_active ? "YES" : "no"}
              </p>
            </div>
          )}

          {/* Quick replies */}
          <div className="p-3 border-t border-border space-y-1.5">
            {QUICK_REPLIES.map((q) => (
              <button
                type="button"
                key={q}
                onClick={() => send(q)}
                className="w-full text-left text-xs px-3 py-2 rounded-lg bg-amber-recovery/10 hover:bg-amber-recovery/20 text-foreground/80 hover:text-foreground transition-colors min-h-[36px]"
                data-ocid="chat.button"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      <Button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-white shadow-glow"
        data-ocid="chat.open_modal_button"
      >
        {open ? (
          <X className="w-5 h-5" />
        ) : (
          <MessageCircle className="w-5 h-5" />
        )}
      </Button>
    </div>
  );
}
