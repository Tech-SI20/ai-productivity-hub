import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const draftEmail = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        purpose: z.string().min(1).max(4000),
        recipient: z.string().max(300),
        tone: z.enum(["Formal", "Friendly", "Persuasive"]),
      })
      .parse(d)
  )
  .handler(async ({ data }) => {
    const { runAI } = await import("./ai.server");
    const text = await runAI(
      "You are an expert workplace communication writer. Draft polished, professional emails. Output only the email in plain text (no markdown): first line 'Subject: ...', a blank line, then greeting, body and sign-off. End with '[Your name]' as the signature placeholder. Keep it concise (under 250 words) and do not invent specific facts like dates or figures that were not provided — use [placeholders] instead.",
      [
        {
          role: "user",
          content: `Purpose / context: ${data.purpose}\nRecipient: ${data.recipient || "not specified"}\nTone: ${data.tone}\n\nWrite the email. Each draft should be fresh and well-crafted.`,
        },
      ]
    );
    return { text };
  });

const URL_RE = /https?:\/\/[^\s<>"')\]]+/gi;

export const analyseResearch = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ input: z.string().min(1).max(30000) }).parse(d))
  .handler(async ({ data }) => {
    const { runAI, fetchPageText } = await import("./ai.server");
    const urls = Array.from(new Set(data.input.match(URL_RE) ?? [])).slice(0, 10);
    const pages = await Promise.all(urls.map(async (u) => ({ url: u, text: await fetchPageText(u) })));
    const sources = pages.length
      ? `\n\nContent of the provided links:\n${pages.map((p, i) => `--- Source ${i + 1}: ${p.url}\n${p.text}`).join("\n\n")}`
      : "";
    const text = await runAI(
      "You are a careful research assistant for professionals. Analyse the user's topic, question, text and any provided link contents. Output plain text (no markdown symbols like ** or #) with exactly these sections:\nSUMMARY\n(a concise paragraph)\n\nKEY INSIGHTS\n• (3-6 bullet insights)\n\nRECOMMENDATIONS\n1. (3-5 numbered, actionable recommendations)\n\nIf links were provided, add a final section SOURCES listing each link with a one-line note on what it contained, and clearly say if a link could not be opened. The link contents below were fetched live by the app from each URL. Base claims on the provided material where available.",
      [{ role: "user", content: `${data.input}${sources}` }]
    );
    return { text, linksOpened: pages.filter((p) => !p.text.startsWith("[Could not")).length, linksTotal: urls.length };
  });

export const chatReply = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        messages: z
          .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(8000) }))
          .min(1)
          .max(40),
      })
      .parse(d)
  )
  .handler(async ({ data }) => {
    const { runAI } = await import("./ai.server");
    const text = await runAI(
      "You are a friendly, practical workplace productivity assistant. Help with planning, writing, prioritising, meetings and workplace challenges. Answer clearly and concisely in plain text (short paragraphs or simple numbered lists, no markdown symbols).",
      data.messages
    );
    return { text };
  });
