import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDownIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { APP_ROUTES } from "@/constants/routes";
import { useFaqTopicsQuery } from "@/hooks/home/useFaqTopicsQuery";

const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.15, duration: 0.6 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

function toTopicSlug(topic: string) {
  return topic.toLowerCase().trim().replace(/\s+/g, "-");
}

export function HomeFaqSection() {
  const {
    data: topics = [],
    isLoading,
    isError
  } = useFaqTopicsQuery({
    featuredOnly: true
  });
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const gridColsClass =
    topics.length <= 1
      ? "grid-cols-1"
      : topics.length === 2
        ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-2"
        : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  const toggleItem = (id: string) => {
    setOpenItems((previous) => {
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <section id="faq" className="relative overflow-hidden bg-[#F7F9FF] py-24">
      <div className="absolute -left-24 -top-20 h-72 w-72 rounded-full bg-[#FFB900]/20 blur-3xl" />
      <div className="absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-[#5E7ADD]/20 blur-3xl" />

      <motion.div
        className="relative z-10 container mx-auto px-6 lg:px-12"
        whileInView="visible"
        variants={containerVariants}
        viewport={{ once: true }}
      >
        <div className="mb-16 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#5E7ADD]">
            FAQ
          </p>
          <h2 className="mt-3 text-3xl font-extrabold text-[#162360] sm:text-4xl lg:text-5xl">
            Pertanyaan yang Sering Ditanyakan
          </h2>
          <div className="mx-auto mt-4 w-16 rounded-full border-t-4 border-[#FFB900] sm:w-20" />
          <p className="mx-auto mt-6 max-w-3xl text-lg font-medium text-[#5E7ADD]">
            Temukan jawaban singkat seputar SIDE, metode analisis, dan sumber
            data.
          </p>
        </div>

        <div className={`grid ${gridColsClass} mx-auto gap-8`}>
          {isLoading &&
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`faq-skeleton-${index}`}
                className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 shadow-xl"
              >
                <div className="h-3 w-16 rounded-full bg-slate-200" />
                <div className="mt-4 h-5 w-36 rounded-full bg-slate-200" />
                <div className="mt-4 space-y-3">
                  <div className="h-4 w-full rounded-full bg-slate-200" />
                  <div className="h-4 w-5/6 rounded-full bg-slate-200" />
                  <div className="h-4 w-3/4 rounded-full bg-slate-200" />
                </div>
              </div>
            ))}

          {!isLoading &&
            topics.map((topic, topicIndex) => {
              const topicTitle = topic.topic || `Topik ${topicIndex + 1}`;
              const remainingCount = Math.max(0, topic.items.length - 3);

              return (
                <motion.article
                  key={`${topicTitle}-${topicIndex}`}
                  variants={itemVariants}
                  className="relative rounded-3xl border border-slate-200 bg-white shadow-xl"
                >
                  <div className="flex items-center justify-between gap-4 p-6 pb-4">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5E7ADD]">
                        Topik
                      </span>
                      <h3 className="mt-2 text-xl font-bold text-[#162360]">
                        {topicTitle}
                      </h3>
                      {topic.summary && (
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                          {topic.summary}
                        </p>
                      )}
                    </div>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFB900]/15 text-[#FFB900]">
                      <SparklesIcon className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="space-y-3 px-6 pb-6">
                    {topic.items.slice(0, 3).map((item, itemIndex) => {
                      const id = `faq-${topicIndex}-${itemIndex}`;
                      const isOpen = openItems.has(id);

                      return (
                        <div
                          key={id}
                          className={`rounded-2xl border transition-all ${
                            isOpen
                              ? "border-[#5E7ADD]/50 bg-[#EEF2FF]"
                              : "border-slate-200 bg-white"
                          }`}
                        >
                          <Button
                            type="button"
                            className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
                            onClick={() => toggleItem(id)}
                            aria-expanded={isOpen}
                            aria-controls={`${id}-panel`}
                          >
                            <span className="text-sm font-semibold text-[#162360]">
                              {item.question}
                            </span>
                            <ChevronDownIcon
                              className={`h-5 w-5 text-[#5E7ADD] transition-transform ${
                                isOpen ? "rotate-180" : ""
                              }`}
                            />
                          </Button>
                          <div
                            id={`${id}-panel`}
                            className={`px-4 pb-4 text-sm leading-relaxed text-slate-600 ${
                              isOpen ? "block" : "hidden"
                            }`}
                          >
                            {item.answer}
                          </div>
                        </div>
                      );
                    })}

                    {remainingCount > 0 && (
                      <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
                        <span>+{remainingCount} pertanyaan lainnya</span>
                        <Link
                          to={`${APP_ROUTES.FAQ}#topic-${toTopicSlug(topicTitle)}`}
                          className="font-semibold text-[#5E7ADD] transition hover:text-[#162360]"
                        >
                          Lihat lebih lengkap
                        </Link>
                      </div>
                    )}
                  </div>
                </motion.article>
              );
            })}
        </div>

        {!isLoading && topics.length === 0 && (
          <div className="mt-10 text-center text-sm text-slate-500">
            {isError
              ? "FAQ gagal dimuat. Coba lagi nanti."
              : "Belum ada data FAQ tersedia."}
          </div>
        )}

        <div className="mt-12 flex justify-center">
          <Link
            to={APP_ROUTES.FAQ}
            className="inline-flex items-center gap-3 rounded-full bg-[#162360] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#162360]/30 transition hover:-translate-y-0.5"
          >
            Lihat Semua FAQ
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
              <ChevronDownIcon className="h-4 w-4 -rotate-90" />
            </span>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
