// Mock AI layer — swap these functions with real API calls later.
// Each returns a Promise so the UI already handles async/loading states.

export type EmailTone = "Formal" | "Friendly" | "Persuasive";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export async function generateEmail(
  purpose: string,
  recipient: string,
  tone: EmailTone
): Promise<string> {
  await delay(1200 + Math.random() * 800);

  const name = recipient.trim() || "there";
  const topic = purpose.trim() || "the matter we discussed";

  const openings: Record<EmailTone, string[]> = {
    Formal: [
      `I hope this message finds you well. I am writing regarding ${topic}.`,
      `Thank you for your time. I wanted to reach out concerning ${topic}.`,
    ],
    Friendly: [
      `Hope you're doing well! I wanted to touch base about ${topic}.`,
      `I hope your week is going great. Quick note about ${topic}.`,
    ],
    Persuasive: [
      `I know your time is valuable, so I'll keep this brief — ${topic} is worth your attention.`,
      `I wanted to share an opportunity around ${topic} that I think you'll find compelling.`,
    ],
  };

  const bodies: Record<EmailTone, string[]> = {
    Formal: [
      `After careful consideration, I believe the most effective path forward is to align on the key priorities and establish a clear timeline. I would appreciate the opportunity to discuss this at your earliest convenience and address any questions you may have.`,
      `To ensure we move forward efficiently, I have outlined the relevant details below for your review. Please let me know if any additional information would be helpful, and I will be glad to provide it promptly.`,
    ],
    Friendly: [
      `I think we're in a great spot to make this happen. Nothing too formal — just want to make sure we're on the same page and figure out the best next steps together. Let me know what works for you!`,
      `It should be pretty straightforward from here. If anything is unclear or you'd like to chat it through, I'm always happy to jump on a quick call.`,
    ],
    Persuasive: [
      `Teams that act on this early consistently see stronger results and fewer roadblocks down the line. By moving forward now, we position ourselves ahead of the curve — and I'd hate for us to miss that window.`,
      `The benefits here are clear: less friction, faster outcomes, and a measurable impact on our goals. I'm confident this is the right move, and I'd love to show you exactly why.`,
    ],
  };

  const closings: Record<EmailTone, string[]> = {
    Formal: ["Kind regards,", "Sincerely,", "Best regards,"],
    Friendly: ["Cheers,", "Talk soon,", "Best,"],
    Persuasive: ["Looking forward to your thoughts,", "Let's make this happen,", "Best,"],
  };

  const cta: Record<EmailTone, string> = {
    Formal: "Could we schedule a brief meeting this week to discuss further?",
    Friendly: "Want to grab 15 minutes this week to chat about it?",
    Persuasive: "Can I count you in? A quick reply is all it takes to get started.",
  };

  return `Subject: ${topic.charAt(0).toUpperCase() + topic.slice(1)}

Hi ${name},

${pick(openings[tone])}

${pick(bodies[tone])}

${cta[tone]}

${pick(closings[tone])}
[Your name]`;
}

export interface ResearchResult {
  summary: string;
  insights: string[];
  recommendations: string[];
}

export async function generateResearch(input: string): Promise<ResearchResult> {
  await delay(1500 + Math.random() * 900);

  const topic = input.trim().slice(0, 200) || "your topic";
  const short = topic.length > 60 ? topic.slice(0, 60) + "…" : topic;

  return {
    summary: pick([
      `Based on the material provided on "${short}", the central theme revolves around improving how teams plan, communicate, and execute. The evidence points toward structured processes and clear ownership as the strongest drivers of consistent outcomes, while ad-hoc approaches correlate with delays and duplicated effort.`,
      `The content around "${short}" highlights a shift toward data-informed decision making. Key patterns suggest that organisations adopting iterative feedback loops outperform those relying on infrequent, large-scale reviews. Overall, the material supports a pragmatic, measured approach to adoption.`,
    ]),
    insights: [
      `Clear ownership and defined accountability consistently emerge as the top predictor of successful outcomes related to ${short}.`,
      "Teams that break work into smaller, reviewable increments reduce risk and surface problems earlier.",
      "Communication quality — not volume — is the differentiator: concise, well-timed updates beat frequent status noise.",
      pick([
        "Adoption barriers are usually cultural rather than technical; change management matters as much as tooling.",
        "Measuring leading indicators (cycle time, review latency) gives earlier warning than lagging metrics alone.",
      ]),
    ],
    recommendations: [
      `Start with a small pilot focused on ${short}, with explicit success criteria and a 2–4 week review checkpoint.`,
      "Assign a single accountable owner and document decisions in a shared, searchable place.",
      "Schedule a recurring retrospective to capture lessons and adjust the approach before scaling.",
    ],
  };
}

export async function generateChatReply(message: string): Promise<string> {
  await delay(900 + Math.random() * 900);
  const m = message.toLowerCase();

  if (/\b(hi|hello|hey|good morning|good afternoon)\b/.test(m)) {
    return "Hello! I'm your workplace AI assistant. I can help you draft emails, summarise research, brainstorm ideas, plan your week, or talk through a tricky work situation. What's on your mind?";
  }
  if (m.includes("email")) {
    return "Happy to help with email. For a polished draft, try the Smart Email Generator in the sidebar — tell it the purpose, recipient, and tone, and it will produce a ready-to-edit draft. If you'd rather brainstorm the message here first, just tell me what you need to say.";
  }
  if (m.includes("meeting")) {
    return "For meetings, I'd suggest: 1) a clear agenda sent in advance, 2) a single decision-owner per topic, and 3) notes with action items shared within an hour afterwards. Want me to help draft an agenda or a follow-up note?";
  }
  if (m.includes("priorit") || m.includes("busy") || m.includes("overwhelmed") || m.includes("time")) {
    return "A practical approach: list everything on your plate, mark each item by impact and urgency, then time-box your top three for today. Protect one focus block of 60–90 minutes with notifications off. Would you like help turning your task list into a plan?";
  }
  if (m.includes("summar") || m.includes("research")) {
    return "For deeper summaries, the AI Research Assistant in the sidebar is purpose-built — paste a topic, question, or article text and it returns a summary, key insights, and recommendations. You can also paste a short excerpt here and I'll give you a quick take.";
  }
  if (m.includes("thank")) {
    return "You're welcome! Anything else I can help with — drafting, planning, or summarising?";
  }
  if (m.endsWith("?")) {
    return `Good question. Based on what you've described, my suggestion is to break it into two parts: what you can decide now, and what needs more input. Tackle the first immediately, and set a specific time to gather the rest. If you share a bit more context, I can give a more tailored answer.`;
  }
  return pick([
    "Got it. Here's a practical way forward: define the outcome you want, identify the single next action, and schedule it. If you'd like, tell me more about the context and I'll help you think it through step by step.",
    "Thanks for sharing that. My take: keep it simple — clarify the goal, communicate it to the people involved, and set a checkpoint to review progress. Want me to help draft the message or plan?",
    "Understood. A few thoughts: focus on what you can control, document the key decisions, and keep stakeholders updated with short, regular notes. Happy to go deeper on any part of this.",
  ]);
}
