import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, FileSearch, MessageSquare, ArrowRight } from "lucide-react";
import { ResponsibleAiNotice } from "@/components/ui-kit";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Workplace Productivity Assistant" },
      { name: "description", content: "Draft emails, summarise research and chat with a workplace AI assistant — no sign-up needed." },
      { property: "og:title", content: "AI Workplace Productivity Assistant" },
      { property: "og:description", content: "Draft emails, summarise research and chat with a workplace AI assistant." },
    ],
  }),
  component: Dashboard,
});

const tools = [
  {
    to: "/email" as const,
    icon: Mail,
    title: "Smart Email Generator",
    desc: "Write professional workplace emails in seconds with formal, friendly, or persuasive tones.",
  },
  {
    to: "/research" as const,
    icon: FileSearch,
    title: "AI Research Assistant",
    desc: "Turn topics, questions, or articles into concise summaries, insights, and recommendations.",
  },
  {
    to: "/chat" as const,
    icon: MessageSquare,
    title: "AI Chatbot",
    desc: "Talk through work challenges, plan your day, and get quick answers from your AI assistant.",
  },
];

function Dashboard() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-12">
      <section className="animate-fade-up rounded-2xl border border-border bg-card p-7 md:p-10">
        <p className="text-sm font-medium text-muted-foreground">{greeting} 👋</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
          Welcome to your AI workplace assistant
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">
          Get more done with less effort. Pick a tool below to draft emails,
          digest research, or chat through your next task.
        </p>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-3">
        {tools.map((t, i) => (
          <Link
            key={t.to}
            to={t.to}
            className="group animate-fade-up flex flex-col rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-ring/40 hover:bg-accent/40"
            style={{ animationDelay: `${(i + 1) * 80}ms` }}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-foreground">
              <t.icon className="h-5 w-5" />
            </div>
            <h2 className="mt-5 text-lg font-semibold">{t.title}</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{t.desc}</p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
              Open tool
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </section>

      <ResponsibleAiNotice className="mt-8" />
    </div>
  );
}
