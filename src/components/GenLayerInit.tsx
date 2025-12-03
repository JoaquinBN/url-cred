'use client';

import { useEffect, useState } from "react";
import { genLayerService } from "@/lib/genlayer.js";

export function GenLayerInit({ children }: { children: React.ReactNode }) {
    const [isInitializing, setIsInitializing] = useState(true);

    // Auto-initialize GenLayer when app loads
    useEffect(() => {
        const initializeGenLayer = async () => {
            try {
                if (!genLayerService.isInitialized()) {
                    await genLayerService.initialize();
                }
            } catch (error) {
                console.error("Failed to initialize GenLayer:", error);
            } finally {
                setIsInitializing(false);
            }
        };

        initializeGenLayer();
    }, []);

    if (isInitializing) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="mb-6">
                        <h1 className="text-xl font-bold mb-2">WebCred</h1>
                        <p className="text-sm text-muted-foreground">Powered by GenLayer</p>
                    </div>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Initializing smart contracts...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
