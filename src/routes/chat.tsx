import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { MessageSquare, Send, Sparkles, User } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { chatReply } from "@/lib/ai.functions";
import { ResponsibleAiNotice } from "@/components/ui-kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chatbot — AI Workplace Assistant" },
      { name: "description", content: "Chat with an AI assistant about planning, writing and workplace challenges." },
      { property: "og:title", content: "AI Workplace Chatbot" },
      { property: "og:description", content: "Chat with an AI assistant about planning, writing and workplace challenges." },
    ],
  }),
  component: ChatPage,
});

type Msg = { role: "user" | "ai"; text: string };

const suggestions = [
  "How do I prioritise a busy week?",
  "Tips for running a better meeting",
  "Help me write a follow-up email",
];

function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const reply = useServerFn(chatReply);
  const send = async (text: string) => {
    const t = text.trim();
    if (!t || loading) return;
    const next: Msg[] = [...messages, { role: "user", text: t }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const r = await reply({
        data: {
          messages: next.slice(-30).map((m) => ({ role: m.role === "ai" ? "assistant" : "user", content: m.text })),
        },
      });
      setMessages((m) => [...m, { role: "ai", text: r.text }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "ai", text: `⚠ ${e instanceof Error ? e.message : "Something went wrong. Please try again."}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col px-4 py-6 md:px-8">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
          <MessageSquare className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">AI Chatbot</h1>
          <p className="text-xs text-muted-foreground">Your interactive workplace assistant</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto rounded-xl border border-border bg-card p-4 md:p-6">
        {messages.length === 0 && !loading ? (
          <div className="flex h-full flex-col items-center justify-center text-center animate-fade-up">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">How can I help you today?</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Ask anything about planning, writing, or workplace challenges.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-border bg-secondary px-4 py-2 text-xs font-medium transition-colors hover:bg-accent"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {messages.map((m, i) => (
              <Bubble key={i} msg={m} />
            ))}
            {loading && (
              <div className="flex items-start gap-3 animate-fade-up">
                <Avatar role="ai" />
                <div className="flex gap-1 rounded-2xl rounded-tl-sm bg-secondary px-4 py-3.5">
                  {[0, 150, 300].map((d) => (
                    <span
                      key={d}
                      className="h-1.5 w-1.5 animate-typing-dot rounded-full bg-muted-foreground"
                      style={{ animationDelay: `${d}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="mt-4 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message…"
          className="flex-1 rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="flex items-center justify-center rounded-xl bg-primary px-4 text-primary-foreground transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
          aria-label="Send"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
      <ResponsibleAiNotice className="mt-3" />
    </div>
  );
}

function Avatar({ role }: { role: Msg["role"] }) {
  return (
    <div
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
        role === "ai" ? "bg-secondary text-foreground" : "bg-primary text-primary-foreground"
      )}
    >
      {role === "ai" ? <Sparkles className="h-4 w-4" /> : <User className="h-4 w-4" />}
    </div>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={cn("flex items-start gap-3 animate-fade-up", isUser && "flex-row-reverse")}>
      <Avatar role={msg.role} />
      <div
        className={cn(
          "max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "rounded-tr-sm bg-primary text-primary-foreground"
            : "rounded-tl-sm bg-secondary text-secondary-foreground"
        )}
      >
        {msg.text}
      </div>
    </div>
  );
}
