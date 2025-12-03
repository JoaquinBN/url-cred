'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { URLVerificationForm } from "@/components/URLVerificationForm";
import { CompactVerificationResult } from "@/components/CompactVerificationResult";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";
import { genLayerService } from "@/lib/genlayer.js";

export default function HomePage() {
    const [recentVerifications, setRecentVerifications] = useState<any[]>([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadRecentVerifications = async () => {
        if (!genLayerService.isInitialized() || !genLayerService.isContractConfigured()) {
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const allResults = await genLayerService.getVerifications();
            const validResults = Array.isArray(allResults) ? allResults : [];

            // Sort by timestamp and take last 5
            const sortedResults = validResults.sort((a, b) => {
                const timeA = new Date(a.timestamp || 0).getTime();
                const timeB = new Date(b.timestamp || 0).getTime();
                return timeB - timeA;
            });

            setRecentVerifications(sortedResults.slice(0, 5));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load recent verifications');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadRecentVerifications();
    }, []);

    useEffect(() => {
        if (refreshTrigger > 0) {
            loadRecentVerifications();
        }
    }, [refreshTrigger]);

    const handleVerificationComplete = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const isReady = genLayerService.isInitialized() && genLayerService.isContractConfigured();

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight mb-3">
                    Verify URLs for Smart Contracts
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Test URL accessibility, stability, and readiness for use in intelligent oracles.
                    Get detailed analysis and ensure your endpoints work reliably.
                </p>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-8 lg:grid-cols-2">
                {/* Left Column - Form */}
                <div className="space-y-6">
                    <URLVerificationForm onVerificationComplete={handleVerificationComplete} />
                </div>

                {/* Right Column - Recent Verifications */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <History className="h-5 w-5" />
                                    Recent Verifications
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={loadRecentVerifications}
                                        disabled={isLoading}
                                    >
                                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                        Refresh
                                    </Button>
                                    <Button asChild variant="outline" size="sm">
                                        <Link href="/verifications">
                                            View All
                                            <ArrowRight className="h-4 w-4 ml-2" />
                                        </Link>
                                    </Button>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!isReady ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <AlertCircle className="h-8 w-8 mx-auto mb-3 opacity-50" />
                                    <p>GenLayer initialization required</p>
                                </div>
                            ) : error ? (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            ) : recentVerifications.length === 0 && !isLoading ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <History className="h-8 w-8 mx-auto mb-3 opacity-50" />
                                    <p>No verification history yet.</p>
                                    <p className="text-sm">Verify a URL to see results here.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recentVerifications.map((result, index) => (
                                        <CompactVerificationResult
                                            key={`${result.url}-${result.timestamp}-${index}`}
                                            result={result}
                                        />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
