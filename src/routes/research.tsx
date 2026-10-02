import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileSearch } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { analyseResearch } from "@/lib/ai.functions";
import { Card, FieldLabel, GenerateButton, inputClass } from "@/components/ui-kit";
import { OutputPanel, PageHeader } from "./email";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — AI Workplace Assistant" },
      { name: "description", content: "Summaries, key insights and recommendations from any topic or article." },
      { property: "og:title", content: "AI Research Assistant" },
      { property: "og:description", content: "Summaries, key insights and recommendations from any topic or article." },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyse = useServerFn(analyseResearch);
  const [note, setNote] = useState("");
  const run = async () => {
    if (!input.trim()) {
      setError("Please enter a topic, question, or article text.");
      return;
    }
    setError("");
    setLoading(true);
    setNote("");
    try {
      const r = await analyse({ data: { input } });
      setOutput(r.text);
      if (r.linksTotal) setNote(`Opened ${r.linksOpened} of ${r.linksTotal} link${r.linksTotal > 1 ? "s" : ""}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-12">
      <PageHeader icon={FileSearch} title="AI Research Assistant" desc="Get a concise summary, key insights, and recommendations." />
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="animate-fade-up space-y-5 lg:col-span-2">
          <div>
            <FieldLabel>Topic, question, or article text</FieldLabel>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={12}
              placeholder="e.g. How can hybrid teams improve collaboration? — or paste an article or links here"
              className={cn(inputClass, "resize-none")}
            />
            {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
            {note && <p className="mt-1.5 text-xs text-muted-foreground">{note}</p>}
            <p className="mt-1.5 text-xs text-muted-foreground">Include links (https://…) and the assistant will open and read them.</p>
          </div>
          <GenerateButton onClick={run} loading={loading} label="Analyse" />
        </Card>
        <OutputPanel
          className="lg:col-span-3"
          value={output}
          onChange={setOutput}
          loading={loading}
          onRegenerate={run}
          emptyText="Your summary, insights, and recommendations will appear here."
        />
      </div>
    </div>
  );
}
