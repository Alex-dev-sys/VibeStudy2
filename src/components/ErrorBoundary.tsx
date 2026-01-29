import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-[400px] flex items-center justify-center p-8">
                    <div className="glass p-8 rounded-2xl text-center max-w-md">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8 text-red-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">
                            Что-то пошло не так
                        </h2>
                        <p className="text-gray-400 mb-6">
                            Произошла непредвиденная ошибка. Попробуйте обновить страницу.
                        </p>
                        <button
                            onClick={this.handleRetry}
                            className="btn-neon px-6 py-3 flex items-center gap-2 mx-auto"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Попробовать снова
                        </button>
                        {import.meta.env.DEV && this.state.error && (
                            <pre className="mt-4 p-4 bg-dark-800 rounded-lg text-left text-xs text-red-300 overflow-auto">
                                {this.state.error.message}
                            </pre>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
