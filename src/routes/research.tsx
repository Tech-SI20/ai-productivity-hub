import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileSearch } from "lucide-react";
import { generateResearch, type ResearchResult } from "@/lib/mock-ai";
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

const format = (r: ResearchResult) =>
  `SUMMARY\n${r.summary}\n\nKEY INSIGHTS\n${r.insights.map((i) => `• ${i}`).join("\n")}\n\nRECOMMENDATIONS\n${r.recommendations
    .map((x, i) => `${i + 1}. ${x}`)
    .join("\n")}`;

function ResearchPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const run = async () => {
    if (!input.trim()) {
      setError("Please enter a topic, question, or article text.");
      return;
    }
    setError("");
    setLoading(true);
    setOutput(format(await generateResearch(input)));
    setLoading(false);
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
              placeholder="e.g. How can hybrid teams improve collaboration? — or paste an article here"
              className={cn(inputClass, "resize-none")}
            />
            {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
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
