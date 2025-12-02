import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VerificationResult } from './VerificationResult';
import { RefreshCw, History, AlertCircle, Eye, Filter } from 'lucide-react';
import { genLayerService } from '@/lib/genlayer.js';

interface VerificationHistoryProps {
  refreshTrigger?: number;
}

export function VerificationHistory({ refreshTrigger }: VerificationHistoryProps) {
  const [allVerifications, setAllVerifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'summary' | 'all'>('summary');
  const [filter, setFilter] = useState<'all' | 'accessible' | 'inaccessible' | 'no-content'>('all');

  const loadVerifications = async () => {
    if (!genLayerService.isInitialized() || !genLayerService.isContractConfigured()) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('Loading verifications...');
      const results = await genLayerService.getVerifications();
      console.log('Loaded verifications:', results);

      // Ensure we have an array and sort by timestamp (most recent first)
      const validResults = Array.isArray(results) ? results : [];
      const sortedResults = validResults.sort((a, b) => {
        const timeA = new Date(a.timestamp || 0).getTime();
        const timeB = new Date(b.timestamp || 0).getTime();
        return timeB - timeA;
      });

      console.log('Setting verifications state:', sortedResults);
      setAllVerifications(sortedResults);
    } catch (err) {
      console.error('Error loading verifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to load verification history');
    } finally {
      setIsLoading(false);
    }
  };

  // Load verifications when component mounts
  useEffect(() => {
    loadVerifications();
  }, []);

  // Refresh verifications when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      loadVerifications();
    }
  }, [refreshTrigger]);

  // Also refresh when component becomes visible (when user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadVerifications();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', loadVerifications);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', loadVerifications);
    };
  }, []);

  // Filter and categorize verifications
  const getRelevantVerifications = () => {
    if (viewMode === 'summary') {
      // Show most relevant: recent accessible + recent failed attempts (max 5)
      const accessible = allVerifications.filter(v => v.is_accessible && (!v.query || v.content_found));
      const webInaccessible = allVerifications.filter(v => !v.is_accessible);
      const noContent = allVerifications.filter(v => v.is_accessible && v.query && !v.content_found);

      return [
        ...accessible.slice(0, 3),
        ...webInaccessible.slice(0, 1),
        ...noContent.slice(0, 1)
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);
    } else {
      // Apply filter for "View All" mode
      switch (filter) {
        case 'accessible':
          return allVerifications.filter(v => v.is_accessible && (!v.query || v.content_found));
        case 'inaccessible':
          return allVerifications.filter(v => !v.is_accessible);
        case 'no-content':
          return allVerifications.filter(v => v.is_accessible && v.query && !v.content_found);
        default:
          return allVerifications;
      }
    }
  };

  const verifications = getRelevantVerifications();

  const getStatusSummary = () => {
    const accessible = allVerifications.filter(v => v.is_accessible && (!v.query || v.content_found)).length;
    const webInaccessible = allVerifications.filter(v => !v.is_accessible).length;
    const noContent = allVerifications.filter(v => v.is_accessible && v.query && !v.content_found).length;

    return { accessible, webInaccessible, noContent, total: allVerifications.length };
  };

  const statusSummary = getStatusSummary();
  const isReady = genLayerService.isInitialized() && genLayerService.isContractConfigured();

  if (!isReady) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Verification History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">
              GenLayer must be initialized to view verification history
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5" />
            {viewMode === 'summary' ? 'Recent Verifications' : 'All Verifications'}
            <span className="text-sm font-normal text-muted-foreground">
              ({verifications.length}/{statusSummary.total})
            </span>
          </div>
          <div className="flex items-center gap-2">
            {viewMode === 'all' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilter(filter === 'all' ? 'accessible' :
                  filter === 'accessible' ? 'inaccessible' :
                  filter === 'inaccessible' ? 'no-content' : 'all')}
              >
                <Filter className="h-4 w-4 mr-2" />
                {filter === 'all' ? 'All' :
                 filter === 'accessible' ? 'Accessible' :
                 filter === 'inaccessible' ? 'Web Error' : 'No Content'}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'summary' ? 'all' : 'summary')}
            >
              <Eye className="h-4 w-4 mr-2" />
              {viewMode === 'summary' ? 'View All' : 'Summary'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadVerifications}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardTitle>

        {viewMode === 'summary' && statusSummary.total > 0 && (
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span className="text-green-600">✓ {statusSummary.accessible} accessible</span>
            <span className="text-red-600">✗ {statusSummary.webInaccessible} web errors</span>
            <span className="text-yellow-600">⚠ {statusSummary.noContent} no content found</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {verifications.length === 0 && !isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>{statusSummary.total === 0 ? 'No verification history yet.' : 'No results match current filter.'}</p>
            <p className="text-sm">
              {statusSummary.total === 0 ? 'Verify a URL to see results here.' : 'Try a different filter.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {verifications.map((result, index) => (
              <VerificationResult key={`${result.url}-${result.timestamp}-${index}`} result={result} />
            ))}
            {viewMode === 'summary' && statusSummary.total > 5 && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => setViewMode('all')}
                  className="w-full"
                >
                  View All {statusSummary.total} Verifications
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}