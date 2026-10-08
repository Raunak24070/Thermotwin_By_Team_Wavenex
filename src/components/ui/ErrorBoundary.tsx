import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
  onReset?: () => void;
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
    console.error('[ThermoTwin ErrorBoundary caught an exception]:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-2xl bg-[#171918] border border-amber-500/40 text-[#F5F5F5] font-mono flex flex-col items-center justify-center text-center gap-3 shadow-2xl">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-[#F5F5F5]">
            {this.props.fallbackMessage || 'Insufficient experiment data'}
          </h3>
          <p className="text-[11px] text-[#A2A8A2] max-w-sm">
            {this.state.error?.message || 'Start the experiment to calculate thermal conductivity.'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              if (this.props.onReset) this.props.onReset();
            }}
            className="mt-1 px-4 py-1.5 rounded-lg bg-[#202321] hover:bg-[#282C29] border border-[#303330] hover:border-[#39FF14] text-[#39FF14] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry Component</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
