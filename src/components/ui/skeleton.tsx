import { motion } from 'framer-motion';

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
    return (
        <motion.div
            className={`bg-dark-700 rounded-lg animate-pulse ${className}`}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
        />
    );
}

export function CardSkeleton() {
    return (
        <div className="glass p-6 space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="flex gap-2 pt-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
            </div>
        </div>
    );
}

export function LessonCardSkeleton() {
    return (
        <div className="glass p-6 space-y-4">
            <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
        </div>
    );
}

export function ProfileSkeleton() {
    return (
        <div className="space-y-6">
            <div className="glass p-8 flex items-center gap-6">
                <Skeleton className="w-24 h-24 rounded-full" />
                <div className="space-y-3 flex-1">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-64" />
                </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="glass p-6 text-center space-y-3">
                        <Skeleton className="w-12 h-12 mx-auto rounded-xl" />
                        <Skeleton className="h-6 w-16 mx-auto" />
                        <Skeleton className="h-3 w-20 mx-auto" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function PageSkeleton() {
    return (
        <div className="space-y-6 p-6">
            <Skeleton className="h-10 w-64" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <CardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
