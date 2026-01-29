import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    Circle,
    Lock,
    Clock,
    Zap,
    Sparkles,
    ArrowLeft,
    Loader2,
    BookOpen,
    Play,
    Target,
    ChevronDown
} from 'lucide-react';
import { courses, getCourseById, type DayLesson } from '../data/courses';
import { useAIGeneration } from '../hooks/useAIGeneration';
import TaskEditor from '../components/TaskEditor';
import { useAuthStore } from '../stores/useAuthStore';
import { useProgressStore } from '../stores/useProgressStore';
import { useLessonStore } from '../stores/useLessonStore';

export default function Lessons() {
    const { courseId, dayParam } = useParams();
    const navigate = useNavigate();

    // Если нет courseId, показываем список курсов
    if (!courseId) {
        return <CourseSelection />;
    }

    const course = getCourseById(courseId);
    if (!course) {
        return <CourseSelection />;
    }

    const currentDay = dayParam ? parseInt(dayParam) : 1;
    const currentLesson = course.lessons.find(l => l.day === currentDay);

    if (!currentLesson) {
        return <DaySelection course={course} />;
    }

    return (
        <LessonView
            course={course}
            lesson={currentLesson}
            onNavigate={(day) => navigate(`/lessons/${courseId}/${day}`)}
            onBack={() => navigate(`/lessons/${courseId}`)}
        />
    );
}

// Компонент выбора курса
function CourseSelection() {
    return (
        <div className="min-h-screen relative">
            <div className="fixed inset-0 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 -z-10" />

            <div className="max-w-6xl mx-auto px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl font-bold text-white mb-4">Выбери язык программирования</h1>
                    <p className="text-gray-400 text-lg">30-дневные курсы с AI-генерацией контента</p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {courses.map((course, index) => (
                        <motion.div
                            key={course.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link to={`/lessons/${course.id}`}>
                                <motion.div
                                    whileHover={{ y: -8, scale: 1.02 }}
                                    className="glass-hover p-6 h-full cursor-pointer group"
                                >
                                    <div
                                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform"
                                        style={{ backgroundColor: `${course.color}20` }}
                                    >
                                        {course.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{course.name}</h3>
                                    <p className="text-gray-400 text-sm mb-4">{course.description}</p>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {course.totalDays} дней
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Zap className="w-4 h-4 text-yellow-500" />
                                            3000 XP
                                        </span>
                                    </div>
                                </motion.div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Компонент выбора дня
function DaySelection({ course }: { course: typeof courses[0] }) {
    const { getCompletedDays } = useProgressStore();
    const completedDays = getCompletedDays(course.id);

    return (
        <div className="min-h-screen relative">
            <div className="fixed inset-0 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 -z-10" />

            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <Link to="/lessons" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4">
                        <ArrowLeft className="w-4 h-4" />
                        Назад к курсам
                    </Link>
                    <div className="flex items-center gap-4">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                            style={{ backgroundColor: `${course.color}20` }}
                        >
                            {course.icon}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">{course.name}</h1>
                            <p className="text-gray-400">{course.totalDays} дней обучения</p>
                        </div>
                    </div>
                </motion.div>

                {/* Progress */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass p-6 mb-8"
                >
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-gray-400">Прогресс курса</span>
                        <span className="text-vibe-400 font-bold">{completedDays.length}/{course.totalDays} дней</span>
                    </div>
                    <div className="h-3 bg-dark-700 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(completedDays.length / course.totalDays) * 100}%` }}
                            className="h-full bg-gradient-to-r from-vibe-500 to-vibe-400 rounded-full"
                        />
                    </div>
                </motion.div>

                {/* Days Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 gap-4">
                    {course.lessons.map((lesson, index) => {
                        const isCompleted = completedDays.includes(lesson.day);
                        const isLocked = lesson.day > completedDays.length + 1;
                        const isCurrent = lesson.day === completedDays.length + 1;

                        return (
                            <motion.div
                                key={lesson.day}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.02 }}
                            >
                                <Link
                                    to={isLocked ? '#' : `/lessons/${course.id}/${lesson.day}`}
                                    className={isLocked ? 'cursor-not-allowed' : ''}
                                >
                                    <motion.div
                                        whileHover={!isLocked ? { y: -4, scale: 1.05 } : {}}
                                        className={`p-4 rounded-xl text-center transition-all ${isLocked
                                            ? 'bg-dark-700/30 opacity-50'
                                            : isCurrent
                                                ? 'glass border-2 border-vibe-500 shadow-neon'
                                                : isCompleted
                                                    ? 'glass border border-green-500/30'
                                                    : 'glass-hover'
                                            }`}
                                    >
                                        <div className="flex justify-center mb-2">
                                            {isCompleted ? (
                                                <CheckCircle2 className="w-6 h-6 text-green-400" />
                                            ) : isLocked ? (
                                                <Lock className="w-6 h-6 text-gray-500" />
                                            ) : (
                                                <Circle className="w-6 h-6 text-vibe-400" />
                                            )}
                                        </div>
                                        <p className="text-lg font-bold text-white mb-1">День {lesson.day}</p>
                                        <p className="text-xs text-gray-400 line-clamp-2">{lesson.title}</p>
                                    </motion.div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// Компонент просмотра урока
interface LessonViewProps {
    course: typeof courses[0];
    lesson: DayLesson;
    onNavigate: (day: number) => void;
    onBack: () => void;
}

function LessonView({ course, lesson, onNavigate, onBack }: LessonViewProps) {
    const { user } = useAuthStore();
    const { completeTask, completeLesson, isTaskCompleted } = useProgressStore();
    const { getLesson, setLesson } = useLessonStore();
    const { generateLesson, generatedContent, isLoading, error } = useAIGeneration();
    const [showTopics, setShowTopics] = useState(true);
    const [selectedTask, setSelectedTask] = useState<{ id: number; title: string; description: string; difficulty: 'easy' | 'medium' | 'hard'; codeTemplate?: string } | null>(null);
    const [localCompletedTasks, setLocalCompletedTasks] = useState<number[]>([]);

    // Load cached lesson if exists
    useEffect(() => {
        const cached = getLesson(course.id, lesson.day);
        if (cached && !generatedContent) {
            // Could load from cache here if useAIGeneration supported it
        }
    }, [course.id, lesson.day, getLesson, generatedContent]);

    // Check which tasks are already completed
    useEffect(() => {
        if (generatedContent) {
            const completed = generatedContent.tasks
                .filter(t => isTaskCompleted(course.id, lesson.day, t.id))
                .map(t => t.id);
            setLocalCompletedTasks(completed);
        }
    }, [generatedContent, course.id, lesson.day, isTaskCompleted]);

    const handleGenerate = async () => {
        const result = await generateLesson(course.name, lesson.day, lesson.title, lesson.topics);
        if (result) {
            setLesson(course.id, lesson.day, result);
        }
    };

    const handleTaskComplete = async () => {
        if (selectedTask && user?.id) {
            await completeTask(user.id, course.id, lesson.day, selectedTask.id);
            setLocalCompletedTasks(prev => [...prev, selectedTask.id]);

            // Check if all tasks completed
            if (generatedContent) {
                const allTaskIds = generatedContent.tasks.map(t => t.id);
                const nowCompleted = [...localCompletedTasks, selectedTask.id];
                if (allTaskIds.every(id => nowCompleted.includes(id))) {
                    await completeLesson(user.id, course.id, lesson.day);
                }
            }
        }
    };

    const hasPrev = lesson.day > 1;
    const hasNext = lesson.day < course.totalDays;

    return (
        <div className="min-h-screen relative">
            <div className="fixed inset-0 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 -z-10" />

            <div className="max-w-5xl mx-auto px-6 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <button
                        onClick={onBack}
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Назад к урокам
                    </button>

                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span
                                    className="px-3 py-1 rounded-full text-sm font-medium"
                                    style={{ backgroundColor: `${course.color}20`, color: course.color }}
                                >
                                    {course.name}
                                </span>
                                <span className="text-gray-500">День {lesson.day}/{course.totalDays}</span>
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-2">{lesson.title}</h1>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    ~30 мин
                                </span>
                                <span className="flex items-center gap-1">
                                    <Zap className="w-4 h-4 text-yellow-500" />
                                    100 XP
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                onClick={() => hasPrev && onNavigate(lesson.day - 1)}
                                disabled={!hasPrev}
                                className={`btn-neon-outline px-4 py-2 flex items-center gap-2 ${!hasPrev ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Пред.
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                onClick={() => hasNext && onNavigate(lesson.day + 1)}
                                disabled={!hasNext}
                                className={`btn-neon px-4 py-2 flex items-center gap-2 ${!hasNext ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                След.
                                <ChevronRight className="w-4 h-4" />
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Topics */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass p-6 mb-6"
                >
                    <button
                        onClick={() => setShowTopics(!showTopics)}
                        className="w-full flex items-center justify-between"
                    >
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-vibe-400" />
                            Темы урока
                        </h2>
                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showTopics ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {showTopics && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="mt-4 grid md:grid-cols-2 gap-3"
                            >
                                {lesson.topics.map((topic, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-dark-700/50">
                                        <span className="w-6 h-6 rounded-full bg-vibe-500/20 text-vibe-400 text-sm flex items-center justify-center">
                                            {i + 1}
                                        </span>
                                        <span className="text-gray-300">{topic}</span>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Generate Button or Content */}
                <AnimatePresence mode="wait">
                    {!generatedContent && !isLoading ? (
                        <motion.div
                            key="generate"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="glass p-12 text-center"
                        >
                            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-vibe-500 to-vibe-700 flex items-center justify-center">
                                <Sparkles className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3">Готов к изучению?</h2>
                            <p className="text-gray-400 mb-8 max-w-md mx-auto">
                                AI сгенерирует для тебя подробную теорию и практические задания по теме "{lesson.title}"
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleGenerate}
                                className="btn-neon px-8 py-4 text-lg flex items-center gap-3 mx-auto"
                            >
                                <Sparkles className="w-5 h-5" />
                                Сгенерировать урок
                            </motion.button>
                        </motion.div>
                    ) : isLoading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="glass p-12 text-center"
                        >
                            <Loader2 className="w-12 h-12 text-vibe-400 animate-spin mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-white mb-2">Генерируем урок...</h2>
                            <p className="text-gray-400">AI создаёт персонализированный контент для тебя</p>
                        </motion.div>
                    ) : generatedContent ? (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            {error && (
                                <div className="mb-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm">
                                    ⚠️ {error}
                                </div>
                            )}

                            {/* Theory */}
                            <div className="glass p-8 mb-6">
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-vibe-400" />
                                    Теория
                                </h2>
                                <div className="prose prose-invert max-w-none">
                                    <div
                                        className="text-gray-300 leading-relaxed"
                                        dangerouslySetInnerHTML={{
                                            __html: generatedContent.theory
                                                .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-dark-900 rounded-xl p-4 overflow-x-auto"><code>$2</code></pre>')
                                                .replace(/`([^`]+)`/g, '<code class="bg-dark-700 px-2 py-1 rounded text-vibe-300">$1</code>')
                                                .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-white mt-6 mb-3">$1</h3>')
                                                .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-white mt-8 mb-4">$1</h2>')
                                                .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-white mb-4">$1</h1>')
                                                .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white">$1</strong>')
                                                .replace(/\n\n/g, '</p><p class="mb-4">')
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Tasks */}
                            <div className="glass p-8">
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <Target className="w-5 h-5 text-vibe-400" />
                                    Практические задания ({generatedContent.tasks.length})
                                </h2>
                                <div className="space-y-4">
                                    {generatedContent.tasks.map((task, index) => (
                                        <motion.div
                                            key={task.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="p-5 rounded-xl bg-dark-700/50 hover:bg-dark-700 transition-colors"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-8 h-8 rounded-lg bg-vibe-500/20 text-vibe-400 font-bold flex items-center justify-center">
                                                        {index + 1}
                                                    </span>
                                                    <h3 className="font-semibold text-white">{task.title}</h3>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${task.difficulty === 'easy'
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : task.difficulty === 'medium'
                                                        ? 'bg-yellow-500/20 text-yellow-400'
                                                        : 'bg-red-500/20 text-red-400'
                                                    }`}>
                                                    {task.difficulty === 'easy' ? 'Легко' : task.difficulty === 'medium' ? 'Средне' : 'Сложно'}
                                                </span>
                                            </div>
                                            <p className="text-gray-400 text-sm mb-3">{task.description}</p>
                                            {task.codeTemplate && (
                                                <pre className="bg-dark-900 rounded-lg p-3 text-sm text-gray-300 overflow-x-auto">
                                                    <code>{task.codeTemplate}</code>
                                                </pre>
                                            )}
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                onClick={() => setSelectedTask(task)}
                                                disabled={localCompletedTasks.includes(task.id)}
                                                className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${localCompletedTasks.includes(task.id)
                                                    ? 'bg-green-500/20 text-green-400 cursor-default'
                                                    : 'bg-vibe-500/20 text-vibe-300 hover:bg-vibe-500/30'
                                                    }`}
                                            >
                                                {localCompletedTasks.includes(task.id) ? (
                                                    <>
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        Выполнено
                                                    </>
                                                ) : (
                                                    <>
                                                        <Play className="w-4 h-4" />
                                                        Выполнить
                                                    </>
                                                )}
                                            </motion.button>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Complete Button */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="mt-8 flex justify-center"
                            >
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="btn-neon px-8 py-4 text-lg flex items-center gap-2"
                                >
                                    <CheckCircle2 className="w-5 h-5" />
                                    Завершить урок
                                </motion.button>
                            </motion.div>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>

            {/* Task Editor Modal */}
            {selectedTask && (
                <TaskEditor
                    task={selectedTask}
                    language={course.name}
                    onClose={() => setSelectedTask(null)}
                    onComplete={handleTaskComplete}
                />
            )}
        </div>
    );
}
