// components/GlobalSearch.tsx
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../supabaseClient";
import { Badge } from "./ui/badge";
import {
  FileText,
  Calendar,
  TrendingUp,
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

interface SearchResult {
  id: string;
  type: "diagnosis" | "case" | "feedback";
  title: string;
  subtitle: string;
  date: string;
  status?: string;
  confidence?: number;
  metadata?: any;
}

interface GlobalSearchProps {
  query: string;
  setQuery: (query: string) => void;
  onNavigate: (path: string, state?: any) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearch({
  query,
  setQuery,
  onNavigate,
  isOpen,
  onClose,
}: GlobalSearchProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load recent searches on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("recentSearches");
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Failed to read recent searches:", err);
    }
  }, []);

  // Save recent search
  const saveRecentSearch = useCallback(
    (text: string) => {
      if (!text.trim()) return;

      const updated = [
        text,
        ...recentSearches.filter((s) => s !== text),
      ].slice(0, 5);

      setRecentSearches(updated);
      try {
        localStorage.setItem("recentSearches", JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to save recent search:", err);
      }
    },
    [recentSearches]
  );

  // Clear recent searches
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem("recentSearches");
    } catch (err) {
      console.error("Failed to clear recent searches:", err);
    }
  }, []);

  // Search function
  const performSearch = useCallback(async (searchQuery: string) => {
    // If query is empty, clear results
    if (!searchQuery.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData?.session) {
        console.error("Session error:", sessionError);
        setResults([]);
        setIsSearching(false);
        return;
      }

      const headers = {
        Authorization: `Bearer ${sessionData.session.access_token}`,
        "Content-Type": "application/json",
      };

      const res = await fetch(
        "/api/diagnoses/with-feedback/",
        { headers }
      );

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const diagnoses = await res.json();
      const searchLower = searchQuery.toLowerCase();

      const filtered: SearchResult[] = diagnoses
        .filter((d: any) => {
          const title = (d?.diagnosisTitle || "").toLowerCase();
          const id = (d?.id || "").toLowerCase();
          return title.includes(searchLower) || id.includes(searchLower);
        })
        .map((d: any) => ({
          id: d.id,
          type: "diagnosis" as const,
          title: d.diagnosisTitle || "Untitled Diagnosis",
          subtitle: `Case ID: ${String(d.id).slice(0, 8)}...`,
          date: d.date,
          status: d.status,
          confidence: d.confidence,
          metadata: d,
        }));

      setResults(filtered);
    } catch (err) {
      console.error("Search error:", err);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []); // Empty deps is correct here - we want stable reference

  // Debounced search - only runs when query changes
  useEffect(() => {
    // Only search if dropdown is open
    if (!isOpen) return;

    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, isOpen, performSearch]);

  // Handle result click
  const handleResultClick = useCallback(
    (result: SearchResult) => {
      saveRecentSearch(query);

      if (result.type === "diagnosis") {
        onNavigate("/healthcare/history", { highlightId: result.id });
      }

      onClose();
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    },
    [query, onNavigate, onClose, saveRecentSearch, setQuery]
  );

  // Handle recent search click
  const handleRecentClick = useCallback(
    (text: string) => setQuery(text),
    [setQuery]
  );

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          e.preventDefault();
          onClose();
          setQuery("");
          setResults([]);
          break;

        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            Math.min(prev + 1, results.length - 1)
          );
          break;

        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;

        case "Enter":
          if (results.length > 0) {
            e.preventDefault();
            handleResultClick(results[selectedIndex]);
          }
          break;
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, results, selectedIndex, handleResultClick, onClose, setQuery]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const outsideHandler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", outsideHandler);
    return () => document.removeEventListener("mousedown", outsideHandler);
  }, [isOpen, onClose]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg max-h-[500px] overflow-hidden z-50"
    >
      <div className="overflow-y-auto max-h-[500px]">
        <div className="p-3">
          {/* Recent Searches */}
          {!query && recentSearches.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2 px-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Recent Searches
                </p>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear
                </button>
              </div>

              <div className="space-y-1">
                {recentSearches.map((search, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleRecentClick(search)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent transition-colors text-left text-sm"
                  >
                    <Clock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <span>{search}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {query && results.length > 0 && !isSearching && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 px-1">
                Found {results.length} result
                {results.length !== 1 ? "s" : ""}
              </p>

              <div className="space-y-1">
                {results.map((r, i) => (
                  <button
                    key={r.id}
                    onClick={() => handleResultClick(r)}
                    className={`w-full ${
                      i === selectedIndex ? "bg-accent" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3 p-2.5 rounded-md hover:bg-accent transition-all group">
                      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>

                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-0.5">
                          <h4 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                            {r.title}
                          </h4>

                          {r.status && (
                            <Badge
                              className={`text-[10px] px-1.5 py-0 h-5 flex-shrink-0 ${
                                r.status === "pending"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                              variant="secondary"
                            >
                              {r.status === "pending" ? (
                                <>
                                  <Clock className="w-2.5 h-2.5 mr-0.5" />
                                  Review
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />
                                  Done
                                </>
                              )}
                            </Badge>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground mb-1 line-clamp-1">
                          {r.subtitle}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(r.date).toLocaleDateString()}
                          </span>
                          {typeof r.confidence === "number" && (
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              {r.confidence}%
                            </span>
                          )}
                        </div>
                      </div>

                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading */}
          {isSearching && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
            </div>
          )}

          {/* No Results */}
          {query && !isSearching && results.length === 0 && (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-sm mb-1">No results found</h3>
              <p className="text-xs text-muted-foreground">
                Try different keywords
              </p>
            </div>
          )}

          {/* Empty State */}
          {!query && recentSearches.length === 0 && (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-sm mb-1">Quick Search</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto mb-4">
                Search for diagnoses, cases, and reports
              </p>

              <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
                <button
                  onClick={() => setQuery("pneumonia")}
                  className="px-2 py-1.5 text-xs rounded-md border hover:bg-accent transition-colors"
                >
                  Try "pneumonia"
                </button>
                <button
                  onClick={() => setQuery("diabetes")}
                  className="px-2 py-1.5 text-xs rounded-md border hover:bg-accent transition-colors"
                >
                  Try "diabetes"
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t px-3 py-2 bg-muted/30">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Press ESC to close</span>
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background rounded border font-mono">
                ↑↓
              </kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background rounded border font-mono">
                ↵
              </kbd>
              Select
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}