import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle, ExternalLink, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface CompactVerificationResultProps {
  result: any;
}

export function CompactVerificationResult({ result }: CompactVerificationResultProps) {
  const router = useRouter();

  const handleClick = () => {
    // Navigate to verifications page with URL search to potentially expand this item
    const searchParams = new URLSearchParams();
    searchParams.set('url', result.url);
    router.push(`/verifications?${searchParams.toString()}`);
  };
  const getStatusIcon = () => {
    if (result.is_accessible) {
      if (result.query && !result.content_found) {
        return <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0" />;
      }
      return <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />;
    }
    return <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />;
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

  const getSuccessAnswer = () => {
    if (result.is_accessible && result.concise_answer &&
      result.concise_answer !== 'Error' &&
      result.concise_answer !== 'Not found' &&
      result.content_found) {
      return result.concise_answer;
    }
    return null;
  };

  const getStatusBg = () => {
    if (result.is_accessible) {
      if (result.query && !result.content_found) return 'bg-yellow-50 hover:bg-yellow-100 border-l-yellow-400';
      return 'bg-green-50 hover:bg-green-100 border-l-green-400';
    }
    return 'bg-red-50 hover:bg-red-100 border-l-red-400';
  };

  return (
    <Card className={cn("hover:shadow-md transition-all duration-200 border-l-4 cursor-pointer rounded-xl overflow-hidden w-full max-w-full", getStatusBg())} onClick={handleClick}>
      <CardContent className="p-3 w-full min-w-0 overflow-hidden">
        {/* Simplified layout - always stacked on mobile, side-by-side on desktop */}
        <div className="space-y-2">
          {/* Main row */}
          <div className="flex items-center gap-2 w-full min-w-0">
            {getStatusIcon()}
            <div className="flex items-center gap-1 min-w-0 flex-1">
              <span className="font-medium text-sm truncate max-w-[150px] sm:max-w-none">{getHostname()}</span>
              <ExternalLink className="h-3 w-3 text-muted-foreground opacity-60 flex-shrink-0" />
            </div>
            <span className="text-xs text-muted-foreground font-mono flex-shrink-0">
              {formatTime(result.timestamp)}
            </span>
          </div>

          {/* Answer row */}
          <div className="w-full min-w-0 pl-6">
            {getSuccessAnswer() ? (
              <div className="text-sm font-medium text-blue-700 truncate">
                {getSuccessAnswer()}
              </div>
            ) : (
              <div className={cn(
                "text-xs font-medium",
                result.is_accessible ?
                  (result.query && !result.content_found ? "text-yellow-700" : "text-green-700") :
                  "text-red-700"
              )}>
                {result.is_accessible ?
                  (result.query && !result.content_found ? "No content" : "Accessible") :
                  "Error"
                }
              </div>
            )}
          </div>

          {/* Query row */}
          {result.query && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground pl-6 w-full min-w-0">
              <Search className="h-3 w-3 flex-shrink-0" />
              <span className="italic truncate">{result.query}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}