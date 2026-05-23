import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRightIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { APP_NAME } from "@/constants/app";
import { APP_ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/Button";
import { useFaqTopicsQuery } from "@/hooks/home/useFaqTopicsQuery";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import type { FaqTopic } from "@/type/home";

const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.12, duration: 0.6 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 }
};

function toTopicSlug(value: string) {
  return value.toLowerCase().trim().replace(/\s+/g, "-");
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function collapseFullyRepeatedPrefix(value: string) {
  const normalized = normalizeWhitespace(value);
  if (!normalized) return normalized;

  const words = normalized.split(" ");
  const maxChunkSize = Math.floor(words.length / 2);

  for (let chunkSize = maxChunkSize; chunkSize >= 2; chunkSize -= 1) {
    const phrase = words.slice(0, chunkSize).join(" ");
    let index = 0;
    let repeatCount = 0;

    while (words.slice(index, index + chunkSize).join(" ") === phrase) {
      repeatCount += 1;
      index += chunkSize;
    }

    if (repeatCount > 1 && index === words.length) {
      return phrase;
    }
  }

  return normalized;
}

function cleanQuestionText(value: string) {
  const normalized = normalizeWhitespace(value);
  if (!normalized) return normalized;

  const chunks = normalized
    .split("?")
    .map((chunk) => collapseFullyRepeatedPrefix(chunk))
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  if (chunks.length <= 1) {
    return collapseFullyRepeatedPrefix(normalized);
  }

  const uniq: string[] = [];
  const seen = new Set<string>();
  for (const chunk of chunks) {
    const key = chunk.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    uniq.push(chunk);
  }

  return `${uniq.join("? ")}?`;
}

function cleanAnswerText(value: string) {
  return collapseFullyRepeatedPrefix(normalizeWhitespace(value));
}

function normalizeTopics(topics: FaqTopic[]) {
  return topics.map((topic, topicIndex) => {
    const topicTitle = collapseFullyRepeatedPrefix(
      normalizeTopicTitle(topic, topicIndex)
    );
    const summary = topic.summary
      ? collapseFullyRepeatedPrefix(topic.summary)
      : undefined;

    const seenQuestions = new Set<string>();
    const items = topic.items
      .map((item) => ({
        question: cleanQuestionText(item.question),
        answer: cleanAnswerText(item.answer)
      }))
      .filter((item) => item.question.length > 0 || item.answer.length > 0)
      .filter((item) => {
        const key = item.question.toLowerCase();
        if (!key) return true;
        if (seenQuestions.has(key)) return false;
        seenQuestions.add(key);
        return true;
      });

    return {
      topic: topicTitle,
      summary,
      items
    };
  });
}

function normalizeTopicTitle(topic: FaqTopic, index: number) {
  return topic.topic || `Topik ${index + 1}`;
}

export function FaqPage() {
  useDocumentTitle(`FAQ | ${APP_NAME}`);

  const { data: topics = [], isLoading, isError } = useFaqTopicsQuery();
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const visibleTopics = useMemo(() => normalizeTopics(topics), [topics]);

  const toggleItem = (id: string) => {
    setOpenItems((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F5F7FF]">
      <div className="pointer-events-none absolute -left-24 -top-32 h-80 w-80 rounded-full bg-[#FFB900]/30 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-32 h-72 w-72 rounded-full bg-[#5E7ADD]/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#162360]/10 blur-3xl" />

      <section className="relative z-10 px-6 pb-20 pt-20 lg:px-12">
        <div className="container mx-auto">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#5E7ADD]">
                Pusat Bantuan
              </p>
              <h1 className="mt-4 text-4xl font-extrabold text-[#162360] sm:text-5xl">
                FAQ Lengkap
              </h1>
              <p className="mt-4 max-w-xl text-lg text-slate-600">
                Temukan jawaban atas pertanyaan umum seputar SIDE, metode
                analisis, dan penggunaan fitur pada satu halaman terpusat.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to={APP_ROUTES.HOME}
                  className="inline-flex items-center gap-2 rounded-full border border-[#162360] px-5 py-2 text-sm font-semibold text-[#162360] transition hover:-translate-y-0.5 hover:bg-[#162360] hover:text-white"
                >
                  Kembali ke Beranda
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-white/50 bg-white/70 p-8 shadow-2xl shadow-[#162360]/10 backdrop-blur">
              <p className="text-sm font-semibold text-[#162360]">
                Topik Pilihan
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {isLoading &&
                  Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={`faq-top-skeleton-${index}`}
                      className="animate-pulse rounded-2xl border border-slate-200 bg-white px-4 py-3"
                    >
                      <div className="h-4 w-24 rounded-full bg-slate-200" />
                      <div className="mt-2 h-3 w-32 rounded-full bg-slate-200" />
                    </div>
                  ))}

                {!isLoading &&
                  visibleTopics.slice(0, 4).map((topic, index) => {
                    const topicTitle = normalizeTopicTitle(topic, index);
                    return (
                      <a
                        key={`${topicTitle}-${index}`}
                        href={`#topic-${toTopicSlug(topicTitle)}`}
                        className="group rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:-translate-y-0.5 hover:border-[#5E7ADD]/40 hover:shadow-lg"
                      >
                        <p className="text-sm font-semibold text-[#162360] group-hover:text-[#5E7ADD]">
                          {topicTitle}
                        </p>
                        {topic.summary && (
                          <p className="mt-1 text-xs text-slate-500">
                            {topic.summary}
                          </p>
                        )}
                      </a>
                    );
                  })}
              </div>

              {!isLoading && visibleTopics.length === 0 && (
                <p className="mt-6 text-sm text-slate-500">
                  {isError
                    ? "Gagal memuat topik FAQ."
                    : "Belum ada topik FAQ yang tersedia."}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 pb-24 lg:px-12">
        <motion.div
          className="container mx-auto"
          whileInView="visible"
          variants={containerVariants}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {isLoading &&
              Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={`faq-list-skeleton-${index}`}
                  className="animate-pulse rounded-3xl border border-slate-200 bg-white px-6 py-8 shadow-2xl shadow-[#162360]/5"
                >
                  <div className="h-4 w-20 rounded-full bg-slate-200" />
                  <div className="mt-3 h-6 w-48 rounded-full bg-slate-200" />
                  <div className="mt-6 space-y-3">
                    <div className="h-4 w-full rounded-full bg-slate-200" />
                    <div className="h-4 w-5/6 rounded-full bg-slate-200" />
                    <div className="h-4 w-4/6 rounded-full bg-slate-200" />
                  </div>
                </div>
              ))}

            {!isLoading &&
              visibleTopics.map((topic, topicIndex) => {
                const topicTitle = normalizeTopicTitle(topic, topicIndex);
                const topicSlug = toTopicSlug(topicTitle);

                return (
                  <motion.article
                    key={`${topicTitle}-${topicIndex}`}
                    id={`topic-${topicSlug}`}
                    variants={itemVariants}
                    className="rounded-3xl border border-slate-200 bg-white px-6 py-8 shadow-2xl shadow-[#162360]/5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#5E7ADD]">
                          Topik
                        </p>
                        <h2 className="mt-2 text-2xl font-bold text-[#162360]">
                          {topicTitle}
                        </h2>
                        {topic.summary && (
                          <p className="mt-2 max-w-xl text-sm text-slate-600">
                            {topic.summary}
                          </p>
                        )}
                      </div>
                      <span className="rounded-full bg-[#FFB900]/15 px-4 py-2 text-xs font-semibold text-[#162360]">
                        {topic.items.length} pertanyaan
                      </span>
                    </div>

                    <div className="mt-6 space-y-3">
                      {topic.items.map((item, itemIndex) => {
                        const id = `faq-${topicIndex}-${itemIndex}`;
                        const isOpen = openItems.has(id);

                        return (
                          <div
                            key={id}
                            className={`rounded-2xl border transition-colors ${
                              isOpen
                                ? "border-[#5E7ADD]/45 bg-[#EEF2FF]"
                                : "border-[#D7DDEA] bg-white"
                            }`}
                          >
                            <Button
                              type="button"
                              className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left"
                              onClick={() => toggleItem(id)}
                              aria-expanded={isOpen}
                              aria-controls={`${id}-panel`}
                            >
                              <span className="flex-1 pr-2 text-sm font-semibold leading-snug text-[#162360]">
                                {item.question}
                              </span>
                              <ChevronDownIcon
                                className={`mt-0.5 h-5 w-5 shrink-0 text-[#5E7ADD] transition-transform ${
                                  isOpen ? "rotate-180" : ""
                                }`}
                              />
                            </Button>
                            <div
                              id={`${id}-panel`}
                              className={`px-5 pb-5 text-sm leading-relaxed text-slate-600 ${
                                isOpen ? "block" : "hidden"
                              }`}
                            >
                              {item.answer}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.article>
                );
              })}

            {!isLoading && visibleTopics.length === 0 && (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 px-6 py-10 text-center text-sm text-slate-500">
                {isError
                  ? "FAQ gagal dimuat. Coba lagi nanti."
                  : "Belum ada data FAQ yang tersedia."}
              </div>
            )}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
