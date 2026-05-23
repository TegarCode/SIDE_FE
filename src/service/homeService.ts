import { apiClient } from "@/service/httpClient";
import type {
  AnalyticsOverview,
  ContactFormPayload,
  FaqItem,
  FaqTopic,
  TutorialPlaylistApiItem,
  TutorialPlaylistItem
} from "@/type/home";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asBoolean(value: unknown) {
  return typeof value === "boolean" ? value : undefined;
}

function normalizeTutorialItem(
  item: TutorialPlaylistApiItem,
  index: number
): TutorialPlaylistItem | null {
  const id = String(item.id ?? item.slug ?? `tutorial-${index + 1}`);
  const slug = asString(item.slug, id);
  const title = asString(item.title, `Video ${index + 1}`).trim();
  const url = asString(item.url).trim();

  if (!url) {
    return null;
  }

  return {
    id,
    slug,
    title,
    url,
    description: asString(item.desc || item.description),
    thumbnail: asString(item.thumbnail_url || item.thumbnail) || null
  };
}

function unwrapArrayPayload(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!isRecord(payload)) {
    return [];
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  if (isRecord(payload.data) && Array.isArray(payload.data.data)) {
    return payload.data.data;
  }

  return [];
}

function normalizeFaqItem(item: UnknownRecord): FaqItem {
  return {
    question: asString(
      item.question ||
        item.pertanyaan ||
        item.title ||
        item.question_text ||
        item.q
    ),
    answer: asString(
      item.answer || item.jawaban || item.content || item.answer_text || item.a
    )
  };
}

function isLikelyFaqItem(item: unknown) {
  if (!isRecord(item)) {
    return false;
  }

  const hasQuestion = Boolean(
    item.question ||
    item.pertanyaan ||
    item.title ||
    item.question_text ||
    item.q
  );
  const hasAnswer = Boolean(
    item.answer || item.jawaban || item.content || item.answer_text || item.a
  );

  return hasQuestion || hasAnswer;
}

function pickTopicItems(topic: UnknownRecord): unknown[] {
  if (Array.isArray(topic.items)) return topic.items;
  if (Array.isArray(topic.faqs)) return topic.faqs;
  if (Array.isArray(topic.questions)) return topic.questions;
  if (Array.isArray(topic.faq_items)) return topic.faq_items;

  return [];
}

function normalizeFaqItems(items: unknown[]) {
  return items
    .filter(isRecord)
    .map(normalizeFaqItem)
    .filter((item) => Boolean(item.question || item.answer));
}

function groupFaqItemsByTopic(items: unknown[]) {
  const groupedMap = new Map<string, FaqItem[]>();

  for (const rawItem of items) {
    if (!isRecord(rawItem)) continue;

    const topicName = asString(
      rawItem.topic || rawItem.topik || rawItem.category || rawItem.kategori,
      "Umum"
    );
    const currentItems = groupedMap.get(topicName) ?? [];
    currentItems.push(normalizeFaqItem(rawItem));
    groupedMap.set(topicName, currentItems);
  }

  return Array.from(groupedMap.entries()).map(([topic, topicItems]) => ({
    topic,
    items: topicItems.filter((item) => Boolean(item.question || item.answer))
  }));
}

function normalizeTopicCollection(collection: unknown[]) {
  if (collection.length === 0) {
    return [];
  }

  if (isLikelyFaqItem(collection[0])) {
    return groupFaqItemsByTopic(collection);
  }

  return collection
    .filter(isRecord)
    .map((topic) => ({
      topic: asString(topic.topic || topic.topik, "Umum"),
      summary: asString(topic.summary),
      isFeatured: asBoolean(topic.is_featured ?? topic.featured),
      items: normalizeFaqItems(pickTopicItems(topic))
    }))
    .filter((topic) => topic.items.length > 0);
}

function tryParseJsonPayload(payload: unknown): unknown {
  let current = payload;

  for (let index = 0; index < 3; index += 1) {
    if (typeof current !== "string") {
      break;
    }

    const sanitized = current
      .trim()
      .replace(/^\uFEFF/, "")
      .replace(/^ï»¿/, "");

    try {
      current = JSON.parse(sanitized);
    } catch {
      return payload;
    }
  }

  return current;
}

function findFaqCollection(payload: unknown, depth = 0): unknown[] | null {
  if (depth > 5) {
    return null;
  }

  const parsedPayload = tryParseJsonPayload(payload);

  if (Array.isArray(parsedPayload)) {
    return parsedPayload;
  }

  if (!isRecord(parsedPayload)) {
    return null;
  }

  const directKeys = [
    "data",
    "faqs",
    "topics",
    "items",
    "questions",
    "faq_items"
  ] as const;

  for (const key of directKeys) {
    if (Array.isArray(parsedPayload[key])) {
      return parsedPayload[key];
    }
  }

  for (const key of directKeys) {
    const nestedValue = parsedPayload[key];
    if (nestedValue) {
      const nestedCollection = findFaqCollection(nestedValue, depth + 1);
      if (nestedCollection) {
        return nestedCollection;
      }
    }
  }

  return null;
}

function normalizeFaqTopics(payload: unknown): FaqTopic[] {
  const collection = findFaqCollection(payload);
  return collection ? normalizeTopicCollection(collection) : [];
}

export async function fetchTutorialPlaylists() {
  const response = await apiClient.get("/api/tutorial-playlists");
  const rawItems = unwrapArrayPayload(response.data);

  return rawItems
    .filter(isRecord)
    .map((item, index) =>
      normalizeTutorialItem(item as TutorialPlaylistApiItem, index)
    )
    .filter((item): item is TutorialPlaylistItem => item !== null);
}

export async function fetchFaqTopics(options?: { featuredOnly?: boolean }) {
  const response = await apiClient.get("/api/faqs", {
    params: {
      isFeatured: options?.featuredOnly ? true : undefined
    }
  });
  const topics = normalizeFaqTopics(response.data);
  const hasFeaturedFlag = topics.some(
    (topic) => typeof topic.isFeatured === "boolean"
  );

  if (options?.featuredOnly && hasFeaturedFlag) {
    return topics.filter((topic) => topic.isFeatured);
  }

  return topics;
}

export async function fetchAnalyticsOverview(
  months = 6
): Promise<AnalyticsOverview> {
  const response = await apiClient.get("/api/analytics/overview", {
    params: { months }
  });

  const payload = response.data;
  const root = isRecord(payload) ? payload : {};
  const dataSource = isRecord(root.data) ? root.data : root;

  const rawHistory = Array.isArray(dataSource.history)
    ? dataSource.history
    : [];
  const history = rawHistory
    .filter(isRecord)
    .map((item) => ({
      label: asString(item.label, "-"),
      views: asNumber(item.views)
    }))
    .filter((item) => item.label !== "-");

  return {
    history,
    avgPerPeriod: asNumber(
      dataSource.avg_per_period,
      asNumber(dataSource.avgPerPeriod)
    )
  };
}

export async function submitContact(payload: ContactFormPayload) {
  const response = await apiClient.post("/api/contact", payload);
  const data = isRecord(response.data) ? response.data : {};

  if (data.status === false) {
    throw new Error(asString(data.message, "Gagal mengirim pesan"));
  }

  return {
    message: asString(data.message, "Pesan Anda berhasil dikirim")
  };
}
