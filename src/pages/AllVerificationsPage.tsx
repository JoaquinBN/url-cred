import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UltraCompactRow } from "@/components/UltraCompactRow";
import { VerificationResult } from "@/components/VerificationResult";
import {
  ArrowLeft,
  Search,
  Filter,
  RefreshCw,
  History,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { genLayerService } from "@/lib/genlayer.js";

export function AllVerificationsPage() {
  const [searchParams] = useSearchParams();
  const [allVerifications, setAllVerifications] = useState<any[]>([]);
  const [filteredVerifications, setFilteredVerifications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<'all' | 'accessible' | 'inaccessible' | 'no-content'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const loadAllVerifications = async () => {
    if (!genLayerService.isInitialized() || !genLayerService.isContractConfigured()) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const results = await genLayerService.getVerifications();
      const validResults = Array.isArray(results) ? results : [];

      // Sort by timestamp (most recent first)
      const sortedResults = validResults.sort((a, b) => {
        const timeA = new Date(a.timestamp || 0).getTime();
        const timeB = new Date(b.timestamp || 0).getTime();
        return timeB - timeA;
      });

      setAllVerifications(sortedResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load verifications');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and search logic
  useEffect(() => {
    let filtered = [...allVerifications];

    // Apply category filter
    switch (filter) {
      case 'accessible':
        filtered = filtered.filter(v => v.is_accessible && (!v.query || v.content_found));
        break;
      case 'inaccessible':
        filtered = filtered.filter(v => !v.is_accessible);
        break;
      case 'no-content':
        filtered = filtered.filter(v => v.is_accessible && v.query && !v.content_found);
        break;
      default:
        // 'all' - no filter
        break;
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(v =>
        v.url?.toLowerCase().includes(query) ||
        v.query?.toLowerCase().includes(query) ||
        v.concise_answer?.toLowerCase().includes(query) ||
        v.analysis?.toLowerCase().includes(query)
      );
    }

    setFilteredVerifications(filtered);
  }, [allVerifications, filter, searchQuery]);

  useEffect(() => {
    loadAllVerifications();
  }, []);

  // Handle URL parameters for auto-expansion (run only once when data loads)
  useEffect(() => {
    const urlParam = searchParams.get('url');
    if (urlParam && allVerifications.length > 0) {
      // Find matching verification and expand it
      const matchingIndex = allVerifications.findIndex(v => v.url === urlParam);
      if (matchingIndex >= 0) {
        const result = allVerifications[matchingIndex];
        const key = `${result.url}-${result.timestamp}-${matchingIndex}`;
        setExpandedItems(new Set([key]));
        // Don't automatically set search query - let user control it
      }
    }
  }, [allVerifications]);

  const toggleExpanded = (key: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedItems(newExpanded);
  };

  const getFilterLabel = () => {
    switch (filter) {
      case 'accessible': return 'Accessible';
      case 'inaccessible': return 'Web Errors';
      case 'no-content': return 'No Content';
      default: return 'All';
    }
  };

  const isReady = genLayerService.isInitialized() && genLayerService.isContractConfigured();

  return (
    <div className="space-y-6">
      {/* Content Container */}
      <div className="mx-auto space-y-6" style={{width: '800px', maxWidth: '100vw'}}>
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">All Verifications</h1>
            <p className="text-muted-foreground">
              Complete history with search and filtering
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search URLs, queries, or answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setFilter(filter === 'all' ? 'accessible' :
              filter === 'accessible' ? 'inaccessible' :
              filter === 'inaccessible' ? 'no-content' : 'all')}
          >
            <Filter className="h-4 w-4 mr-2" />
            {getFilterLabel()}
          </Button>
          <Button
            variant="outline"
            onClick={loadAllVerifications}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        </div>

        {/* Results */}
        <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Results
              <span className="text-sm font-normal text-muted-foreground">
                ({filteredVerifications.length}/{allVerifications.length})
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!isReady ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>GenLayer initialization required</p>
            </div>
          ) : error ? (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          ) : filteredVerifications.length === 0 && !isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>
                {allVerifications.length === 0
                  ? 'No verifications found.'
                  : 'No results match your search or filter.'}
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="mt-2"
                >
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3" style={{width: '100%'}}>
              {filteredVerifications.map((result, index) => {
                const key = `${result.url}-${result.timestamp}-${index}`;
                const isExpanded = expandedItems.has(key);

                return (
                  <div key={key} className="bg-white border rounded-lg shadow-sm" style={{width: '100%'}}>
                    <UltraCompactRow
                      result={result}
                      isExpanded={isExpanded}
                      onToggle={() => toggleExpanded(key)}
                      searchQuery={searchQuery}
                    />
                    {isExpanded && (
                      <div className="px-4 py-3 border-t bg-slate-50" style={{width: '100%'}}>
                        <div style={{width: '100%', overflow: 'hidden'}}>
                          <VerificationResult result={result} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
        </Card>
      </div>
    </div>
  );
}