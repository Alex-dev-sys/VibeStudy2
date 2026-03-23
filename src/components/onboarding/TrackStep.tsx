import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const tracks = [
    {
        id: 'python',
        title: 'Python',
        description: 'Лучший старт для automation, backend и первого уверенного проектного опыта.',
        accent: 'from-sky-500 to-cyan-400',
    },
    {
        id: 'javascript',
        title: 'JavaScript',
        description: 'Подходит, если твоя цель — web, интерфейсы и быстрый вход в прикладную разработку.',
        accent: 'from-amber-400 to-orange-500',
    },
    {
        id: 'go',
        title: 'Go',
        description: 'Хороший вариант для backend, concurrency и системного мышления.',
        accent: 'from-cyan-500 to-teal-400',
    },
];

interface TrackStepProps {
    value: string | null;
    onSelect: (trackId: string) => void;
    onStart: () => void;
}

export default function TrackStep({ value, onSelect, onStart }: TrackStepProps) {
    return (
        <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
                {tracks.map((track, index) => {
                    const selected = value === track.id;

                    return (
                        <motion.button
                            key={track.id}
                            type="button"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ y: -4 }}
                            onClick={() => onSelect(track.id)}
                            className={`rounded-[1.5rem] border p-5 text-left transition-all ${
                                selected
                                    ? 'border-vibe-400/50 bg-vibe-500/15'
                                    : 'border-white/10 bg-white/5 hover:border-vibe-400/25 hover:bg-white/10'
                            }`}
                        >
                            <div className={`mb-4 inline-flex rounded-full bg-gradient-to-r ${track.accent} px-3 py-1 text-sm font-semibold text-white`}>
                                {track.title}
                            </div>
                            <p className="text-sm leading-relaxed text-gray-300">{track.description}</p>
                        </motion.button>
                    );
                })}
            </div>

            <motion.button
                type="button"
                whileHover={{ scale: value ? 1.03 : 1 }}
                whileTap={{ scale: value ? 0.97 : 1 }}
                onClick={onStart}
                disabled={!value}
                className={`btn-neon inline-flex items-center gap-2 px-6 py-3 ${!value ? 'cursor-not-allowed opacity-60' : ''}`}
            >
                Начать с выбранного трека
                <ArrowRight className="h-4 w-4" />
            </motion.button>
        </div>
    );
}
