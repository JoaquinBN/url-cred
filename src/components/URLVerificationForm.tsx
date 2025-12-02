import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { genLayerService } from '@/lib/genlayer.js';

interface URLVerificationFormProps {
  onVerificationComplete: () => void;
}

interface ProcessUrlParams {
  url: string;
  query?: string;
  force_refresh?: boolean;
}

export function URLVerificationForm({ onVerificationComplete }: URLVerificationFormProps) {
  const [url, setUrl] = useState('');
  const [query, setQuery] = useState('');
  const [forceRefresh, setForceRefresh] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [contractConfigured, setContractConfigured] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeGenLayer = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!genLayerService.isInitialized()) {
        await genLayerService.initialize();
        setIsInitialized(true);
        setContractConfigured(genLayerService.isContractConfigured());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize GenLayer');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      setError('URL is required');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Ensure GenLayer is initialized
      if (!genLayerService.isInitialized()) {
        await initializeGenLayer();
      }

      const params: ProcessUrlParams = {
        url: url.trim(),
        query: query.trim() || undefined,
        force_refresh: forceRefresh
      };

      const success = await genLayerService.processUrl(params);

      if (success) {
        // Reset form on success
        setUrl('');
        setQuery('');
        setForceRefresh(false);

        // Notify parent to refresh verification list
        onVerificationComplete();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const isReady = genLayerService.isInitialized() && genLayerService.isContractConfigured();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          URL Verification
          {isReady && <CheckCircle className="h-5 w-5 text-green-500" />}
          {!isReady && !isLoading && <AlertCircle className="h-5 w-5 text-yellow-500" />}
          {isLoading && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isReady && (
          <div className="mb-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              GenLayer setup required to verify URLs
            </p>
            <Button onClick={initializeGenLayer} disabled={isLoading} size="sm">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Initialize GenLayer
            </Button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="query">Query (optional)</Label>
            <Input
              id="query"
              type="text"
              placeholder="What is the price of this product?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Ask a specific question about the content on the URL
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="force-refresh"
              type="checkbox"
              checked={forceRefresh}
              onChange={(e) => setForceRefresh(e.target.checked)}
              disabled={isLoading}
              className="rounded"
            />
            <Label htmlFor="force-refresh" className="text-sm">
              Force refresh (ignore cache)
            </Label>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading || !isReady}
            className="w-full"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify URL
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}