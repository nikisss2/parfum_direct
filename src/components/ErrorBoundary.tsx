import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[50vh] flex items-center justify-center px-4 py-16 bg-white">
          <div className="max-w-md w-full text-center space-y-6 border border-zinc-200 p-8 shadow-xs">
            <div className="w-14 h-14 bg-zinc-50 border border-zinc-200 mx-auto flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-zinc-950 stroke-[1.5]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-serif text-zinc-950 uppercase tracking-tight">
                Что-то пошло не так
              </h2>
              <p className="text-xs text-zinc-500 font-light leading-relaxed">
                При загрузке этого раздела возникла ошибка. Вы можете обновить страницу или
                вернуться на главную.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-3 bg-black text-white hover:bg-zinc-800 text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Обновить страницу</span>
              </button>

              <a
                href="/"
                onClick={this.handleReset}
                className="w-full sm:w-auto px-5 py-3 bg-white border border-zinc-300 hover:border-black text-zinc-950 text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-2"
              >
                <Home className="w-3.5 h-3.5" />
                <span>На главную</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
