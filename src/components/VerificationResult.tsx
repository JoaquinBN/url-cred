import { CheckCircle, XCircle, AlertCircle, ExternalLink, Clock, Search } from 'lucide-react';
// No import needed since we're using 'any' type

interface VerificationResultProps {
  result: any;
}

export function VerificationResult({ result }: VerificationResultProps) {
  const getStatusIcon = () => {
    if (result.is_accessible) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (result.status_code >= 400 && result.status_code < 500) {
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    } else {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    if (result.is_accessible) return 'text-green-600 bg-green-50';
    if (result.status_code >= 400 && result.status_code < 500) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="bg-background border rounded-lg p-4 space-y-4" style={{width: '100%', maxWidth: '100%', overflow: 'hidden'}}>
      {/* Header: Status + URL + Status Code */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {getStatusIcon()}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">
                {(() => {
                  try {
                    return new URL(result.url).hostname;
                  } catch {
                    return result.url;
                  }
                })()}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
                {result.status_code}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline truncate min-w-0 block"
                style={{wordBreak: 'break-all'}}
              >
                {result.url}
              </a>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground whitespace-nowrap">
          <Clock className="h-3 w-3" />
          {formatTimestamp(result.timestamp)}
        </div>
      </div>

      {/* Status Details */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Status</span>
          <p className={`font-medium ${result.is_accessible ? 'text-green-600' : 'text-red-600'}`}>
            {result.is_accessible ? 'Accessible' : 'Inaccessible'}
          </p>
        </div>
        {result.query && (
          <div>
            <span className="text-muted-foreground">Answer Found</span>
            <p className={`font-medium ${result.content_found ? 'text-green-600' : 'text-red-600'}`}>
              {result.content_found ? 'Yes' : 'No'}
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {result.error_message && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700" style={{wordBreak: 'break-word'}}>{result.error_message}</p>
        </div>
      )}

      {/* Query Section */}
      {result.query && (
        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">Query</span>
            </div>
            <p className="text-sm italic text-muted-foreground bg-muted px-3 py-2 rounded border-l-4 border-blue-300" style={{wordBreak: 'break-word'}}>
              "{result.query}"
            </p>
          </div>

          {result.concise_answer && result.concise_answer !== 'Not found' && result.concise_answer !== 'Error' && (
            <div>
              <span className="font-medium text-sm block mb-2">Answer:</span>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900" style={{wordBreak: 'break-word'}}>{result.concise_answer}</p>
              </div>
            </div>
          )}

          {result.analysis && (
            <div>
              <span className="font-medium text-sm block mb-2">Analysis:</span>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground" style={{wordBreak: 'break-word'}}>{result.analysis}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}