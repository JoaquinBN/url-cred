import { CheckCircle, XCircle, AlertCircle, ExternalLink, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UltraCompactRowProps {
  result: any;
  isExpanded?: boolean;
  onToggle?: () => void;
  searchQuery?: string;
}

export function UltraCompactRow({ result, isExpanded, onToggle, searchQuery }: UltraCompactRowProps) {
  const getStatusIcon = () => {
    if (result.is_accessible) {
      if (result.query && !result.content_found) {
        return <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0" />;
      }
      return <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />;
    }
    return <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />;
  };

  const getStatusColor = () => {
    if (result.is_accessible) {
      if (result.query && !result.content_found) return 'bg-yellow-50 hover:bg-yellow-100 border-l-yellow-300';
      return 'bg-green-50 hover:bg-green-100 border-l-green-300';
    }
    return 'bg-red-50 hover:bg-red-100 border-l-red-300';
  };

  const getHostname = () => {
    try {
      return new URL(result.url).hostname;
    } catch {
      return result.url;
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'now';
      if (diffMins < 60) return `${diffMins}m`;
      if (diffHours < 24) return `${diffHours}h`;
      if (diffDays < 7) return `${diffDays}d`;
      return date.toLocaleDateString();
    } catch {
      return '--';
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query || !text) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 text-yellow-900 rounded-sm px-1">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const getSuccessAnswer = () => {
    if (result.is_accessible && result.concise_answer &&
        result.concise_answer !== 'Error' &&
        result.concise_answer !== 'Not found' &&
        result.content_found) {
      return result.concise_answer;
    }
    return null;
  };

  return (
    <div
      className={cn(
        "border-l-4 transition-all duration-200 cursor-pointer hover:bg-gray-50 w-full",
        getStatusColor(),
        isExpanded && "bg-blue-50"
      )}
      onClick={onToggle}
    >
      <div className="px-2 sm:px-4 py-2 w-full">
        {/* Main row: Status • Domain • Answer • Time */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-sm w-full min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {getStatusIcon()}

            {/* Domain */}
            <div className="flex items-center gap-1 flex-shrink-0 min-w-0">
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:underline truncate"
                onClick={(e) => e.stopPropagation()}
                title={`Visit ${result.url}`}
              >
                {searchQuery ? highlightText(getHostname(), searchQuery) : getHostname()}
              </a>
              <ExternalLink className="h-3 w-3 text-muted-foreground opacity-60 flex-shrink-0" />
            </div>

            {/* Time - mobile */}
            <span className="text-xs text-muted-foreground font-mono sm:hidden ml-auto">
              {formatTime(result.timestamp)}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Bullet separator */}
            <span className="text-muted-foreground hidden sm:inline">•</span>

            {/* Answer or Status */}
            <div className="flex-1 min-w-0">
              {getSuccessAnswer() ? (
                <span className="font-medium text-blue-700 truncate block">
                  {searchQuery ? highlightText(getSuccessAnswer()!, searchQuery) : getSuccessAnswer()}
                </span>
              ) : (
                <span className={cn(
                  "text-xs font-medium",
                  result.is_accessible ?
                    (result.query && !result.content_found ? "text-yellow-700" : "text-green-700") :
                    "text-red-700"
                )}>
                  {result.is_accessible ?
                    (result.query && !result.content_found ? "No content found" : "Accessible") :
                    "Error"
                  }
                </span>
              )}
            </div>

            {/* Time - desktop */}
            <span className="text-xs text-muted-foreground font-mono hidden sm:inline">
              {formatTime(result.timestamp)}
            </span>
          </div>
        </div>

        {/* Query row (if exists) */}
        {result.query && (
          <div className="mt-1 ml-0 sm:ml-7 flex items-center gap-2 text-xs text-muted-foreground">
            <Search className="h-3 w-3" />
            <span className="italic truncate">
              {searchQuery ? highlightText(result.query, searchQuery) : result.query}
            </span>
          </div>
        )}

        {/* Error message (if exists and not expanded) */}
        {!result.is_accessible && result.error_message && !isExpanded && (
          <div className="mt-1 ml-0 sm:ml-7 text-xs text-red-600 truncate">
            {result.error_message}
          </div>
        )}
      </div>
    </div>
  );
}