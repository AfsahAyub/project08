
"use client";

import { useEffect, useRef, useState } from "react";
import rules from "./rules.json";

type Rule = {
  intent: string;
  keywords: string[];
  reply: string;
};

type Message = {
  role: "user" | "bot";
  text: string;
};

const chatbotRules = rules as Rule[];

const greeting =
  "Assalam-o-Alaikum! Welcome to UOS Helpdesk Bot. 🎓\n\nAsk me about admission, fees, eligibility, merit lists, scholarships, library, hostel or university programs.";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getBotReply(message: string): string {
  const question = normalize(message);

  if (!question) {
    return "Please type a question so I can help you.";
  }

  // Match the most specific keyword first.
  // This prevents a general keyword from winning too early.
  const matches = chatbotRules
    .map((rule) => {
      const matchedKeywords = rule.keywords
        .map((keyword) => normalize(keyword))
        .filter((keyword) => {
          return (
            keyword.length > 0 &&
            (` ${question} `).includes(` ${keyword} `)
          );
        });

      return {
        rule,
        matchedKeywords,
        score: matchedKeywords.reduce(
          (total, keyword) => total + keyword.length * keyword.length,
          0
        ),
      };
    })
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score);

  if (matches.length > 0) {
    return matches[0].rule.reply;
  }

  return (
    "Sorry, mujhe is sawal ka verified jawab apne current knowledge rules mein nahi mila. " +
    "Aap sawal ko thora different wording mein pooch sakte hain, ya official UOS website check karein: " +
    "https://www.uos.edu.pk/"
  );
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: greeting },
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function sendMessage(question?: string) {
    const text = (question ?? input).trim();

    if (!text || isTyping) return;

    const reply = getBotReply(text);

    setMessages((previous) => [
      ...previous,
      { role: "user", text },
      { role: "bot", text: reply },
    ]);

    setInput("");
    inputRef.current?.focus();
  }

  const suggestions = [
    "How to apply for admission?",
    "BS Botany fee structure",
    "What documents are required?",
    "How can I apply for a hostel?",
    "Scholarships and financial aid",
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-100 via-violet-100 to-pink-100 p-3 sm:p-8">
      <div className="mx-auto flex h-[90vh] min-h-[600px] max-h-[900px] max-w-3xl flex-col overflow-hidden rounded-3xl border border-white bg-white/95 shadow-2xl">
        <header className="flex items-center gap-3 bg-gradient-to-r from-violet-800 via-purple-700 to-indigo-700 p-5 text-white sm:p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl">
            🎓
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-extrabold sm:text-2xl">
              UOS Helpdesk Bot
            </h1>
            <p className="mt-1 text-sm text-violet-100">
              University of Sargodha · Student Support
            </p>
          </div>

          <span className="rounded-full bg-white/15 px-3 py-2 text-xs">
            ● Online
          </span>
        </header>

        <section
          aria-label="Chat messages"
          aria-live="polite"
          className="flex-1 space-y-5 overflow-y-auto bg-gradient-to-b from-violet-50 to-sky-50 p-4 sm:p-6"
        >
          <div className="mx-auto w-fit rounded-full border border-violet-100 bg-white px-4 py-2 text-xs text-slate-500">
            Student Helpdesk
          </div>

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-end gap-2 ${
                message.role === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              {message.role === "bot" && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-200">
                  🎓
                </div>
              )}

              <div
                className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                  message.role === "user"
                    ? "rounded-br-sm bg-gradient-to-br from-violet-700 to-indigo-600 text-white"
                    : "rounded-bl-sm border border-violet-100 bg-white text-slate-700"
                }`}
              >
                {message.text}
              </div>

              {message.role === "user" && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pink-200">
                  👤
                </div>
              )}
            </div>
          ))}

          <div ref={bottomRef} />
        </section>

        <div className="border-t border-violet-100 bg-white px-4 pt-4 sm:px-6">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
            Try asking
          </p>

          <div className="flex gap-2 overflow-x-auto pb-4">
            {suggestions.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => sendMessage(question)}
                disabled={isTyping}
                className="shrink-0 rounded-full border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-medium text-violet-800 transition hover:bg-violet-100 disabled:opacity-50"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            sendMessage();
          }}
          className="flex items-center gap-3 border-t border-slate-100 bg-white p-4 sm:px-6 sm:py-5"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask your UOS question..."
            aria-label="Ask your UOS question"
            autoComplete="off"
            className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
          />

          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="rounded-2xl bg-gradient-to-r from-violet-700 to-indigo-600 px-5 py-3.5 font-semibold text-white shadow-lg transition hover:shadow-violet-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send ➤
          </button>
        </form>

        <footer className="bg-white pb-3 text-center text-xs text-slate-400">
          UOS Helpdesk Bot · Student Information Assistant
        </footer>
      </div>
    </main>
  );
}
