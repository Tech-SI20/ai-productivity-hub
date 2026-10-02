import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { draftEmail } from "@/lib/ai.functions";

type EmailTone = "Formal" | "Friendly" | "Persuasive";
import {
  Card,
  CopyButton,
  FieldLabel,
  GenerateButton,
  RegenerateButton,
  ResponsibleAiNotice,
  inputClass,
} from "@/components/ui-kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — AI Workplace Assistant" },
      { name: "description", content: "Generate formal, friendly or persuasive workplace emails instantly." },
      { property: "og:title", content: "Smart Email Generator" },
      { property: "og:description", content: "Generate formal, friendly or persuasive workplace emails instantly." },
    ],
  }),
  component: EmailPage,
});

const tones: EmailTone[] = ["Formal", "Friendly", "Persuasive"];

function EmailPage() {
  const [purpose, setPurpose] = useState("");
  const [recipient, setRecipient] = useState("");
  const [tone, setTone] = useState<EmailTone>("Formal");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const draft = useServerFn(draftEmail);
  const run = async () => {
    if (!purpose.trim()) {
      setError("Please describe the purpose of your email.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const r = await draft({ data: { purpose, recipient, tone } });
      setOutput(r.text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-12">
      <PageHeader icon={Mail} title="Smart Email Generator" desc="Describe what you need and get a polished, ready-to-send draft." />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="animate-fade-up space-y-5 lg:col-span-2">
          <div>
            <FieldLabel>Purpose / context</FieldLabel>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              rows={5}
              placeholder="e.g. Request a project deadline extension by one week"
              className={cn(inputClass, "resize-none")}
            />
            {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
          </div>
          <div>
            <FieldLabel>Recipient</FieldLabel>
            <input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="e.g. Sarah (Project Manager)"
              className={inputClass}
            />
          </div>
          <div>
            <FieldLabel>Tone</FieldLabel>
            <div className="grid grid-cols-3 gap-2 rounded-lg bg-background p-1">
              {tones.map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={cn(
                    "rounded-md py-2 text-sm font-medium transition-all",
                    tone === t
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <GenerateButton onClick={run} loading={loading} label="Generate email" />
        </Card>

        <OutputPanel
          className="lg:col-span-3"
          value={output}
          onChange={setOutput}
          loading={loading}
          onRegenerate={run}
          emptyText="Your generated email will appear here. You can edit it before copying."
        />
      </div>
    </div>
  );
}

export function PageHeader({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <div className="mb-8 flex items-start gap-4 animate-fade-up">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-secondary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

export function OutputPanel({
  value,
  onChange,
  loading,
  onRegenerate,
  emptyText,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  loading: boolean;
  onRegenerate: () => void;
  emptyText: string;
  className?: string;
}) {
  return (
    <Card className={cn("animate-fade-up flex flex-col", className)}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">AI output</h2>
        {value && !loading && (
          <div className="flex gap-2">
            <CopyButton text={value} />
            <RegenerateButton onClick={onRegenerate} loading={loading} />
          </div>
        )}
      </div>
      {loading ? (
        <div className="flex-1 space-y-3 rounded-lg border border-border bg-background p-4">
          {[90, 75, 95, 60, 85, 40].map((w, i) => (
            <div key={i} className="h-3 animate-pulse rounded bg-muted" style={{ width: `${w}%` }} />
          ))}
        </div>
      ) : value ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(inputClass, "min-h-[360px] flex-1 resize-y leading-relaxed")}
        />
      ) : (
        <div className="flex min-h-[360px] flex-1 items-center justify-center rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          {emptyText}
        </div>
      )}
      <ResponsibleAiNotice className="mt-4" />
    </Card>
  );
}
