/**
 * AI Integration Helper for Vibe Study
 * Handles API calls to Gemini/GPT for generating personalized lessons
 */

export interface LessonResponse {
    theory: string;
    task: string;
    hint: string;
}

export interface LessonRequest {
    language: string;
    day: number;
    careerPath: string;
}

// Supported programming languages
export const LANGUAGES = [
    'Python',
    'JavaScript',
    'Go',
    'Rust',
    'Java',
    'C++',
    'Swift',
] as const;

export type Language = typeof LANGUAGES[number];

// Career paths available after completing basics
export const CAREER_PATHS = {
    Python: ['Data Scientist', 'ML Engineer', 'Backend Developer', 'DevOps Engineer'],
    JavaScript: ['Full-Stack Developer', 'Frontend Developer', 'React Developer', 'Node.js Developer'],
    Go: ['Backend Developer', 'Cloud Engineer', 'Systems Developer', 'DevOps Engineer'],
    Rust: ['Systems Developer', 'Embedded Developer', 'Blockchain Developer', 'Game Developer'],
    Java: ['Backend Developer', 'Android Developer', 'Enterprise Developer', 'Big Data Engineer'],
    'C++': ['Game Developer', 'Systems Developer', 'Embedded Developer', 'Graphics Engineer'],
    Swift: ['iOS Developer', 'macOS Developer', 'Apple Ecosystem Developer'],
} as const;

/**
 * Generate a personalized lesson using AI
 * 
 * @param language - The programming language being learned
 * @param day - The current day in the learning roadmap (1-90)
 * @param careerPath - The user's selected career path
 * @returns Promise containing theory, task, and hint
 */
export async function generateLesson(
    language: Language,
    day: number,
    careerPath: string
): Promise<LessonResponse> {
    const apiKey = import.meta.env.VITE_AI_API_KEY;
    const apiProvider = import.meta.env.VITE_AI_PROVIDER || 'gemini'; // 'gemini' or 'openai'

    if (!apiKey) {
        // Return mock data if no API key is configured
        return getMockLesson(language, day, careerPath);
    }

    const prompt = buildPrompt(language, day, careerPath);

    try {
        if (apiProvider === 'gemini') {
            return await callGeminiAPI(apiKey, prompt);
        } else {
            return await callOpenAIAPI(apiKey, prompt);
        }
    } catch (error) {
        console.error('AI API Error:', error);
        // Fallback to mock data on error
        return getMockLesson(language, day, careerPath);
    }
}

/**
 * Build the AI prompt for lesson generation
 */
function buildPrompt(language: string, day: number, careerPath: string): string {
    return `You are an expert programming instructor. Generate a lesson for:
- Language: ${language}
- Day ${day} of a 90-day learning roadmap
- Career Path: ${careerPath}

The lesson should be appropriate for the day number (earlier days = basics, later days = advanced).

Respond ONLY with valid JSON in this exact format:
{
  "theory": "Clear explanation of the concept being taught (2-3 paragraphs)",
  "task": "A practical coding exercise to reinforce the concept",
  "hint": "A helpful hint for completing the task without giving the solution"
}`;
}

/**
 * Call Gemini API
 */
async function callGeminiAPI(apiKey: string, prompt: string): Promise<LessonResponse> {
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    topP: 0.8,
                    maxOutputTokens: 1024,
                },
            }),
        }
    );

    if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
        throw new Error('Empty response from Gemini');
    }

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error('Could not parse JSON from response');
    }

    return JSON.parse(jsonMatch[0]) as LessonResponse;
}

/**
 * Call OpenAI API
 */
async function callOpenAIAPI(apiKey: string, prompt: string): Promise<LessonResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'gpt-4-turbo-preview',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert programming instructor. Always respond with valid JSON only.',
                },
                { role: 'user', content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 1024,
            response_format: { type: 'json_object' },
        }),
    });

    if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
        throw new Error('Empty response from OpenAI');
    }

    return JSON.parse(text) as LessonResponse;
}

/**
 * Get mock lesson data for development/fallback
 */
function getMockLesson(language: string, day: number, careerPath: string): LessonResponse {
    const phase = day <= 30 ? 'fundamentals' : day <= 60 ? 'intermediate' : 'advanced';

    const lessons: Record<string, LessonResponse> = {
        fundamentals: {
            theory: `Welcome to Day ${day} of your ${language} journey! Today we'll explore the foundational concepts that every ${careerPath} needs to master. Understanding these basics will set you up for success in more advanced topics.\n\nIn ${language}, we focus on writing clean, readable code that follows best practices. This will make your code easier to maintain and understand.`,
            task: `Create a simple ${language} program that demonstrates today's concepts. Start by setting up your development environment, then write a program that takes user input and processes it according to the lesson materials.`,
            hint: `Remember to break down the problem into smaller steps. Start with the basic structure, then add functionality one piece at a time.`,
        },
        intermediate: {
            theory: `Day ${day} takes you deeper into ${language} as you work toward becoming a ${careerPath}. We're now moving beyond the basics into more sophisticated programming patterns and techniques.\n\nToday's lesson focuses on building real-world applications with ${language}. You'll learn how professionals structure their code for scalability.`,
            task: `Build a small project that solves a real-world problem. Apply the design patterns and best practices we've covered. Include proper error handling and edge case management.`,
            hint: `Think about how a ${careerPath} would approach this problem. Consider scalability, maintainability, and code organization.`,
        },
        advanced: {
            theory: `Congratulations on reaching Day ${day}! You're now in the advanced phase of your ${language} training for ${careerPath}. This stage focuses on professional-level skills and industry best practices.\n\nToday we cover advanced optimization techniques and architectural patterns used in production environments.`,
            task: `Create a comprehensive project that demonstrates mastery of ${language}. Include advanced features like async operations, optimal data structures, and clean architecture principles.`,
            hint: `Focus on code quality over quantity. A ${careerPath} prioritizes well-tested, documented, and maintainable code.`,
        },
    };

    return lessons[phase];
}

/**
 * Generate a daily challenge using AI
 */
export async function generateDailyChallenge(language: Language): Promise<{
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    requirements: string[];
}> {
    // For now, return mock data
    // In production, this would call the AI API
    return {
        title: `Build a ${language} Rate Limiter`,
        description: `Create a production-ready rate limiter implementation using ${language}. This challenge tests your understanding of algorithms and system design.`,
        difficulty: 'medium',
        requirements: [
            'Implement the token bucket algorithm',
            'Support configurable rate limits',
            'Handle concurrent requests safely',
            'Include proper error handling',
        ],
    };
}
