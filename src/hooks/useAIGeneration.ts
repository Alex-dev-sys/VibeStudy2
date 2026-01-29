import { useState } from 'react';

interface GeneratedContent {
    theory: string;
    tasks: Task[];
}

interface Task {
    id: number;
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    codeTemplate?: string;
}

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export function useAIGeneration() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);

    const generateLesson = async (
        language: string,
        day: number,
        title: string,
        topics: string[]
    ): Promise<GeneratedContent | null> => {
        setIsLoading(true);
        setError(null);

        const prompt = `Ты - опытный преподаватель программирования. Сгенерируй урок для изучения ${language}.

День ${day}: ${title}

Темы для изучения:
${topics.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Сгенерируй:
1. Теорию на русском языке (подробное объяснение каждой темы с примерами кода)
2. 7 практических заданий разной сложности (3 easy, 3 medium, 1 hard)

Формат ответа (JSON):
{
  "theory": "# ${title}\\n\\n[Подробная теория с примерами кода в markdown формате]",
  "tasks": [
    {
      "id": 1,
      "title": "Название задания",
      "description": "Описание что нужно сделать",
      "difficulty": "easy|medium|hard",
      "codeTemplate": "# Шаблон кода для начала (опционально)"
    }
  ]
}

ВАЖНО: 
- Теория должна быть подробной (минимум 500 слов)
- Примеры кода должны быть реальными и рабочими
- Задания должны быть связаны с темами дня
- Ответ должен быть валидным JSON`;

        try {
            if (!OPENAI_API_KEY) {
                // Fallback: генерируем демо контент если нет API ключа
                const demoContent = generateDemoContent(language, day, title, topics);
                setGeneratedContent(demoContent);
                setIsLoading(false);
                return demoContent;
            }

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: 'Ты - опытный преподаватель программирования. Отвечай только валидным JSON.'
                        },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.7,
                    max_tokens: 4000,
                }),
            });

            if (!response.ok) {
                throw new Error('Ошибка API');
            }

            const data = await response.json();
            const content = data.choices[0]?.message?.content;

            // Парсим JSON из ответа
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Не удалось распарсить ответ');
            }

            const parsed: GeneratedContent = JSON.parse(jsonMatch[0]);
            setGeneratedContent(parsed);
            setIsLoading(false);
            return parsed;
        } catch (err) {
            console.error('AI Generation error:', err);
            // Fallback на демо контент
            const demoContent = generateDemoContent(language, day, title, topics);
            setGeneratedContent(demoContent);
            setError('Используется демо-контент. Добавьте VITE_OPENAI_API_KEY в .env');
            setIsLoading(false);
            return demoContent;
        }
    };

    const clearContent = () => {
        setGeneratedContent(null);
        setError(null);
    };

    return {
        generateLesson,
        generatedContent,
        isLoading,
        error,
        clearContent,
    };
}

// Функция для генерации демо контента без API
function generateDemoContent(
    language: string,
    day: number,
    title: string,
    topics: string[]
): GeneratedContent {
    const codeExamples: Record<string, string> = {
        'Python': `# Пример кода на Python
name = "VibeStudy"
age = 25
print(f"Привет, {name}! Тебе {age} лет.")

# Список
numbers = [1, 2, 3, 4, 5]
for num in numbers:
    print(num * 2)`,
        'JavaScript': `// Пример кода на JavaScript
const name = "VibeStudy";
const age = 25;
console.log(\`Привет, \${name}! Тебе \${age} лет.\`);

// Массив
const numbers = [1, 2, 3, 4, 5];
numbers.forEach(num => console.log(num * 2));`,
        'Go': `// Пример кода на Go
package main

import "fmt"

func main() {
    name := "VibeStudy"
    age := 25
    fmt.Printf("Привет, %s! Тебе %d лет.\\n", name, age)
    
    numbers := []int{1, 2, 3, 4, 5}
    for _, num := range numbers {
        fmt.Println(num * 2)
    }
}`,
        'Rust': `// Пример кода на Rust
fn main() {
    let name = "VibeStudy";
    let age = 25;
    println!("Привет, {}! Тебе {} лет.", name, age);
    
    let numbers = vec![1, 2, 3, 4, 5];
    for num in numbers {
        println!("{}", num * 2);
    }
}`,
    };

    const code = codeExamples[language] || codeExamples['Python'];

    return {
        theory: `# ${title}

## Введение

Добро пожаловать в день ${day}! Сегодня мы изучим важные концепции ${language}.

## Темы урока

${topics.map((topic, i) => `### ${i + 1}. ${topic}

${topic} - это фундаментальная концепция в ${language}. Понимание этой темы поможет вам писать более качественный код.

**Ключевые моменты:**
- Это важная тема для понимания основ
- Применяется во многих реальных проектах
- Знание этой темы откроет новые возможности

`).join('\n')}

## Примеры кода

\`\`\`${language.toLowerCase()}
${code}
\`\`\`

## Практические советы

1. Практикуйтесь каждый день
2. Решайте задачи разной сложности
3. Читайте чужой код
4. Не бойтесь экспериментировать

## Заключение

Отличная работа! Вы освоили материал дня ${day}. Переходите к практическим заданиям ниже.
`,
        tasks: [
            {
                id: 1,
                title: `Простая переменная`,
                description: `Создайте переменную с вашим именем и выведите приветствие`,
                difficulty: 'easy' as const,
                codeTemplate: `# Ваш код здесь\nname = ""\nprint(f"Привет, {name}!")`,
            },
            {
                id: 2,
                title: `Работа с числами`,
                description: `Создайте две переменные с числами и выведите их сумму`,
                difficulty: 'easy' as const,
            },
            {
                id: 3,
                title: `Условия`,
                description: `Напишите программу, которая проверяет, является ли число чётным`,
                difficulty: 'easy' as const,
            },
            {
                id: 4,
                title: `Список элементов`,
                description: `Создайте список из 5 элементов и выведите каждый элемент`,
                difficulty: 'medium' as const,
            },
            {
                id: 5,
                title: `Функция`,
                description: `Напишите функцию, которая принимает число и возвращает его квадрат`,
                difficulty: 'medium' as const,
            },
            {
                id: 6,
                title: `Словарь/объект`,
                description: `Создайте структуру данных с информацией о пользователе (имя, возраст, email)`,
                difficulty: 'medium' as const,
            },
            {
                id: 7,
                title: `Мини-проект`,
                description: `Создайте простой калькулятор, который выполняет базовые арифметические операции`,
                difficulty: 'hard' as const,
            },
        ],
    };
}
