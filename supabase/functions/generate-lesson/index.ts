import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

type Difficulty = "easy" | "medium" | "hard";

interface LessonTask {
  id: number;
  title: string;
  description: string;
  difficulty: Difficulty;
  codeTemplate?: string;
}

interface LessonResponse {
  theory: string;
  tasks: LessonTask[];
}

interface LessonRequest {
  courseId: string;
  language: string;
  day: number;
  title: string;
  topics: string[];
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonHeaders = {
  ...corsHeaders,
  "Content-Type": "application/json; charset=utf-8",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

function isLessonRequest(value: unknown): value is LessonRequest {
  if (!value || typeof value !== "object") return false;

  const input = value as Partial<LessonRequest>;
  return typeof input.courseId === "string"
    && input.courseId.length > 0
    && input.courseId.length <= 80
    && typeof input.language === "string"
    && input.language.length > 0
    && input.language.length <= 40
    && Number.isInteger(input.day)
    && Number(input.day) >= 1
    && Number(input.day) <= 365
    && typeof input.title === "string"
    && input.title.length > 0
    && input.title.length <= 160
    && Array.isArray(input.topics)
    && input.topics.length > 0
    && input.topics.length <= 12
    && input.topics.every((topic) => typeof topic === "string" && topic.length <= 120);
}

function isLessonResponse(value: unknown): value is LessonResponse {
  if (!value || typeof value !== "object") return false;

  const lesson = value as Partial<LessonResponse>;
  return typeof lesson.theory === "string"
    && lesson.theory.length > 0
    && Array.isArray(lesson.tasks)
    && lesson.tasks.length > 0
    && lesson.tasks.length <= 10
    && lesson.tasks.every((task) =>
      Number.isInteger(task?.id)
      && typeof task?.title === "string"
      && typeof task?.description === "string"
      && ["easy", "medium", "hard"].includes(task?.difficulty)
      && (task?.codeTemplate === undefined || typeof task.codeTemplate === "string")
    );
}

function extractJson(content: string): unknown {
  const trimmed = content.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    // Some providers wrap the entire JSON response in one Markdown fence.
  }

  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```\s*$/i);
  const source = fenced?.[1]?.trim() ?? trimmed;
  const start = source.indexOf("{");
  const end = source.lastIndexOf("}");

  if (start < 0 || end <= start) {
    throw new Error("Model response does not contain JSON");
  }

  return JSON.parse(source.slice(start, end + 1));
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  if (!isLessonRequest(input)) {
    return json({ error: "Invalid lesson request" }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const hfToken = Deno.env.get("HF_TOKEN");
  const hfModel = Deno.env.get("HF_MODEL") ?? "openai/gpt-oss-20b:novita";

  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: "Server database configuration is missing" }, 503);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: cached } = await admin
    .from("lesson_cache")
    .select("theory,tasks")
    .eq("course_id", input.courseId)
    .eq("day", input.day)
    .maybeSingle();

  if (cached && isLessonResponse(cached)) {
    return json(cached);
  }

  if (!hfToken) {
    return json({ error: "Hugging Face is not configured" }, 503);
  }

  const prompt = `Создай урок по программированию на русском языке.

Язык: ${input.language}
День: ${input.day}
Тема: ${input.title}
Подтемы:
${input.topics.map((topic, index) => `${index + 1}. ${topic}`).join("\n")}

Верни только JSON:
{
  "theory": "Подробная теория в Markdown с рабочими примерами кода",
  "tasks": [
    {
      "id": 1,
      "title": "Название",
      "description": "Проверяемое условие задания",
      "difficulty": "easy",
      "codeTemplate": "Необязательный стартовый код"
    }
  ]
}

Требования: 5–7 заданий, уровни easy/medium/hard, без HTML и внешних инструкций.`;

  let response: Response;
  try {
    response = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${hfToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: hfModel,
        messages: [
          {
            role: "system",
            content: "Ты опытный преподаватель программирования. Отвечай только валидным JSON.",
          },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "lesson",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                theory: { type: "string" },
                tasks: {
                  type: "array",
                  minItems: 5,
                  maxItems: 7,
                  items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      id: { type: "integer" },
                      title: { type: "string" },
                      description: { type: "string" },
                      difficulty: {
                        type: "string",
                        enum: ["easy", "medium", "hard"],
                      },
                      codeTemplate: { type: "string" },
                    },
                    required: [
                      "id",
                      "title",
                      "description",
                      "difficulty",
                      "codeTemplate",
                    ],
                  },
                },
              },
              required: ["theory", "tasks"],
            },
          },
        },
        reasoning_effort: "low",
        temperature: 0.35,
        max_tokens: 3200,
      }),
      signal: AbortSignal.timeout(60_000),
    });
  } catch (error) {
    console.error("Hugging Face request timed out or failed", error);
    return json({ error: "Lesson generation timed out. Please retry." }, 504);
  }

  if (!response.ok) {
    const providerRequestId = response.headers.get("x-request-id");
    console.error("Hugging Face request failed", response.status, providerRequestId);
    return json({ error: "Lesson generation failed" }, 502);
  }

  const completion = await response.json();
  const content = completion?.choices?.[0]?.message?.content;

  if (typeof content !== "string") {
    return json({ error: "Model returned an empty response" }, 502);
  }

  let lesson: unknown;
  try {
    lesson = extractJson(content);
  } catch (error) {
    console.error("Failed to parse model response", {
      error,
      finishReason: completion?.choices?.[0]?.finish_reason,
      contentLength: content.length,
    });
    return json({ error: "Model returned invalid JSON" }, 502);
  }

  if (!isLessonResponse(lesson)) {
    return json({ error: "Model returned an invalid lesson" }, 502);
  }

  const { error: cacheError } = await admin.from("lesson_cache").upsert(
    {
      course_id: input.courseId,
      day: input.day,
      theory: lesson.theory,
      tasks: lesson.tasks,
      model: hfModel,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "course_id,day" },
  );

  if (cacheError) {
    console.error("Lesson cache write failed", cacheError.code);
  }

  return json(lesson);
});
