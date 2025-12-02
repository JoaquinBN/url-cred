import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { AllVerificationsPage } from "./pages/AllVerificationsPage";
import { genLayerService } from "@/lib/genlayer.js";
import faviconUrl from "./favicon.ico";
import genlayerUrl from "./genlayer.svg";
import "./index.css";

export function App() {
  const [isInitializing, setIsInitializing] = useState(true);

  // Auto-initialize GenLayer when app loads
  useEffect(() => {
    const initializeGenLayer = async () => {
      try {
        if (!genLayerService.isInitialized()) {
          await genLayerService.initialize();
        }
      } catch (error) {
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

  return (
    <Router>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50 w-screen">
          <div className="container mx-auto px-4 md:px-8 py-4">
            <div className="flex items-center justify-between w-full max-w-6xl mx-auto">
              <div className="flex items-center gap-3">
                <Link to="/" className="hover:opacity-80 transition-opacity flex items-center gap-2">
                  <img src={faviconUrl} alt="WebCred" className="w-5 h-5" />
                  <h1 className="text-xl font-bold tracking-tight">WebCred</h1>
                </Link>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  Powered by{" "}
                  <a
                    href="https://docs.genlayer.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline font-medium flex items-center gap-1"
                  >
                    <img src={genlayerUrl} alt="GenLayer" className="w-3 h-3 invert" />
                    GenLayer
                  </a>
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          <div className="container mx-auto p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/verifications" element={<AllVerificationsPage />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
