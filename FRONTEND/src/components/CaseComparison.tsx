import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "./ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { 
  FileText, 
  Plus, 
  X, 
  Loader2, 
  Sparkles, 
  Wand, 
  RefreshCw, 
  Check, 
  ChevronsUpDown 
} from "lucide-react";

import { supabase } from "../supabaseClient";

// --- TYPE DEFINITIONS ---

interface AvailableCase { id: string; diagnosis: string; date: string; }
interface CaseData { id: string; date: string; diagnosis: string; confidence: number; age: number | string; gender: string; symptoms: string[]; testResults: { test: string; value: string; status: string; }[]; treatment: string[]; outcome: string; }
type ComparisonStatus = 'similar' | 'unique';
interface ComparisonResult { [caseId: string]: { symptoms: { [item: string]: ComparisonStatus; }; }; }

// --- API HELPER ---

const authenticatedFetch = async (url: string) => {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) {
    throw new Error('No active session found. Please log in.');
  }
  const token = session.access_token;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication failed. Please log in again.');
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP error! Status: ${response.status}`);
  }
  return response.json();
};

// --- REACT COMPONENT ---

export function CaseComparison() {
    const navigate = useNavigate();
    
    // --- STATE MANAGEMENT ---
    const [availableCases, setAvailableCases] = useState<AvailableCase[]>([]);
    const [casesData, setCasesData] = useState<Record<string, CaseData>>({});
    const [selectedCases, setSelectedCases] = useState<string[]>([]);
    const [comparisonResults, setComparisonResults] = useState<ComparisonResult>({});
    const [popoverOpen, setPopoverOpen] = useState(false);
    
    const [isLoadingList, setIsLoadingList] = useState(true);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- DATA FETCHING EFFECTS ---
    useEffect(() => {
        const fetchAvailableCases = async () => {
            try {
                setIsLoadingList(true);
                const data = await authenticatedFetch('/api/cases/');
                setAvailableCases(data);
                if (data.length >= 1) { // Select at least one case to start
                    setSelectedCases([data[0].id]);
                }
                if (data.length >= 2) {
                    setSelectedCases([data[0].id, data[1].id]);
                }
            } catch (err: any) {
                setError(err.message);
                if (err.message.includes('session') || err.message.includes('Authentication')) {
                    navigate('/login');
                }
            } finally {
                setIsLoadingList(false);
            }
        };
        fetchAvailableCases();
    }, [navigate]);

    useEffect(() => {
        if (selectedCases.length === 0) return;
        const fetchCaseDetails = async () => {
            const idsToFetch = selectedCases.filter(id => !casesData[id]);
            if (idsToFetch.length === 0) return;
            try {
                setIsLoadingDetails(true);
                const data = await authenticatedFetch(`/api/cases/details/?ids=${idsToFetch.join(',')}`);
                setCasesData(prevData => ({ ...prevData, ...data }));
            } catch (err: any) {
                setError(err.message);
                if (err.message.includes('session') || err.message.includes('Authentication')) {
                    navigate('/login');
                }
            } finally {
                setIsLoadingDetails(false);
            }
        };
        fetchCaseDetails();
    }, [selectedCases, navigate]);

    // --- HANDLER FUNCTIONS ---
    const handleCaseChange = (indexToUpdate: number, newCaseId: string) => {
        if (selectedCases.includes(newCaseId)) return;
        const newSelection = selectedCases.map((id, index) => index === indexToUpdate ? newCaseId : id);
        setSelectedCases(newSelection);
        setComparisonResults({});
    };

    const addCase = (caseId: string) => {
        if (selectedCases.length < 3 && !selectedCases.includes(caseId)) {
            setSelectedCases([...selectedCases, caseId]);
        }
        setPopoverOpen(false);
    };
    
    // This function is no longer used visually but kept for potential future use
    const removeCase = (indexToRemove: number) => {
        if (selectedCases.length > 1) {
            setSelectedCases(selectedCases.filter((_, index) => index !== indexToRemove));
            setComparisonResults({});
        }
    };
    
    // --- COMPARISON LOGIC ---
    const findSimilarities = () => {
        const results: ComparisonResult = {};
        const casesToCompare = selectedCases.map(id => casesData[id]).filter(Boolean);
        if (casesToCompare.length < 2) return;
        const allSymptoms = casesToCompare.flatMap(c => c.symptoms);
        const symptomCounts = allSymptoms.reduce((acc, symptom) => {
            acc[symptom] = (acc[symptom] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const commonSymptoms = Object.keys(symptomCounts).filter(symptom => symptomCounts[symptom] > 1);
        casesToCompare.forEach(c => {
            results[c.id] = { symptoms: {} };
            c.symptoms.forEach(symptom => {
                if (commonSymptoms.includes(symptom)) {
                    results[c.id].symptoms[symptom] = 'similar';
                }
            });
        });
        setComparisonResults(results);
    };

    const findDifferences = () => {
        const results: ComparisonResult = {};
        const casesToCompare = selectedCases.map(id => casesData[id]).filter(Boolean);
        if (casesToCompare.length < 2) return;
        const allSymptoms = casesToCompare.flatMap(c => c.symptoms);
        const symptomCounts = allSymptoms.reduce((acc, symptom) => {
            acc[symptom] = (acc[symptom] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const uniqueSymptoms = Object.keys(symptomCounts).filter(symptom => symptomCounts[symptom] === 1);
        casesToCompare.forEach(c => {
            results[c.id] = { symptoms: {} };
            c.symptoms.forEach(symptom => {
                if (uniqueSymptoms.includes(symptom)) {
                    results[c.id].symptoms[symptom] = 'unique';
                }
            });
        });
        setComparisonResults(results);
    };
    
    const clearHighlights = () => setComparisonResults({});
    const casesForAddDropdown = availableCases.filter(c => !selectedCases.includes(c.id));

    // --- RENDER LOGIC ---
    if (isLoadingList) {
        return ( <div className="flex items-center justify-center min-h-screen"> <Loader2 className="w-8 h-8 animate-spin text-primary" /> <p className="ml-3 text-muted-foreground">Loading cases...</p> </div> );
    }

    if (error) {
        return ( <div className="flex flex-col items-center justify-center min-h-screen text-destructive"> <p className="text-lg font-semibold">An Error Occurred</p> <p className="text-sm">{error}</p> </div> );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto p-8 space-y-6 max-w-[1800px]">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl">Case Comparison</h1>
                        <p className="text-muted-foreground">Compare cases to identify similarities and differences.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={findSimilarities} disabled={selectedCases.length < 2}><Sparkles className="w-4 h-4 mr-2" />Find Similarities</Button>
                        <Button variant="outline" onClick={findDifferences} disabled={selectedCases.length < 2}><Wand className="w-4 h-4 mr-2" />Show Differences</Button>
                        {Object.keys(comparisonResults).length > 0 && ( <Button variant="ghost" onClick={clearHighlights}><RefreshCw className="w-4 h-4 mr-2" />Clear</Button> )}
                        <Button><FileText className="w-4 h-4 mr-2" />Export</Button>
                    </div>
                </div>

                {/* Case Selection */}
                <Card className="p-4">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">Compare:</span>
                        {selectedCases.map((caseId, index) => (
                            <div key={caseId} className="flex items-center gap-2">
                                <Select value={caseId} onValueChange={(newId: string) => handleCaseChange(index, newId)}>
                                    <SelectTrigger className="w-56">
                                        <SelectValue placeholder="Select a case..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableCases.filter(c => !selectedCases.includes(c.id) || c.id === caseId)
                                            .map((c) => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    {c.diagnosis} ({c.id.substring(0, 8)}...)
                                                </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {/* --- THIS BLOCK IS REMOVED --- */}
                            </div>
                        ))}
                        {selectedCases.length < 3 && (
                            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                                <PopoverTrigger asChild>
                                    
                                </PopoverTrigger>
                                <PopoverContent className="w-[200px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search case..." />
                                        <CommandEmpty>No cases found.</CommandEmpty>
                                        <CommandGroup>
                                            {casesForAddDropdown.map((c) => (
                                                <CommandItem key={c.id} onSelect={() => addCase(c.id)}>
                                                    <Check className="mr-2 h-4 w-4 opacity-0"/>
                                                    {c.diagnosis}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        )}
                        {isLoadingDetails && <Loader2 className="w-4 h-4 animate-spin text-primary ml-2" />}
                    </div>
                </Card>

                {/* Comparison Grid */}
                <div className={`grid gap-6 ${selectedCases.length === 1 ? "lg:grid-cols-1" : selectedCases.length === 2 ? "lg:grid-cols-2" : "lg:grid-cols-3"}`}>
                    {selectedCases.map((caseId) => {
                        const caseData = casesData[caseId];

                        if (!caseData || (isLoadingDetails && !casesData[caseId])) {
                            return (<Card key={caseId} className="p-6 space-y-4"><div className="h-8 bg-muted rounded w-3/4 animate-pulse"></div><div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div><div className="h-20 bg-muted rounded w-full animate-pulse mt-4"></div></Card>);
                        }

                        return (
                            <div key={caseId} className="space-y-4">
                                <Card className="p-6 bg-primary/5">
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-xl mb-1">{caseData.id.substring(0, 8)}...</h3>
                                                <p className="text-sm text-muted-foreground">{caseData.date}</p>
                                            </div>
                                            <Badge className="bg-primary">{caseData.confidence}%</Badge>
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Age:</span>
                                                <span>{caseData.age !== 'N/A' ? `${caseData.age} years` : 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Gender:</span>
                                                <span>{caseData.gender || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                <Tabs defaultValue="diagnosis" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
                                        <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
                                        <TabsTrigger value="tests">Tests</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="diagnosis" className="space-y-4 mt-4">
                                        <Card className="p-4">
                                            <h4 className="mb-3">Primary Diagnosis</h4>
                                            <p className="text-sm mb-2" style={{ whiteSpace: 'pre-wrap' }}>{caseData.diagnosis || 'N/A'}</p>
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-muted-foreground">Confidence:</span>
                                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: `${caseData.confidence}%` }}/></div>
                                                <span>{caseData.confidence}%</span>
                                            </div>
                                        </Card>
                                        <Card className="p-4">
                                            <h4 className="mb-3">Treatment Plan</h4>
                                            <ul className="space-y-2 text-sm">
                                                {caseData.treatment.length > 0 ? caseData.treatment.map((item, idx) => (<li key={idx} className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" /><span>{item}</span></li>)) : <p className="text-muted-foreground">No treatment plan available.</p>}
                                            </ul>
                                        </Card>
                                        {caseData.outcome && (<Card className="p-4"><h4 className="mb-2">Outcome</h4><p className="text-sm text-muted-foreground">{caseData.outcome}</p></Card>)}
                                    </TabsContent>

                                    <TabsContent value="symptoms" className="space-y-4 mt-4">
                                         <Card className="p-4">
                                            <h4 className="mb-3">Symptoms</h4>
                                            <ul className="space-y-1">
                                                {caseData.symptoms.length > 0 ? caseData.symptoms.map((symptom, idx) => {
                                                    const status = comparisonResults[caseId]?.symptoms?.[symptom];
                                                    const highlightClass = 
                                                        status === 'similar' ? 'bg-green-100 dark:bg-green-900/50 text-green-900 dark:text-green-200' :
                                                        status === 'unique' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-200' : '';
                                                    return (
                                                        <li key={idx} className={`flex items-center gap-3 text-sm p-2 rounded-md transition-colors ${highlightClass}`}>
                                                            <div className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                                                            <span>{symptom}</span>
                                                        </li>
                                                    );
                                                }) : <p className="text-muted-foreground text-sm">No symptoms listed.</p>}
                                            </ul>
                                        </Card>
                                    </TabsContent>

                                    <TabsContent value="tests" className="space-y-4 mt-4">
                                        <Card className="p-4">
                                            <h4 className="mb-3">Test Results</h4>
                                            <div className="space-y-3">
                                                {caseData.testResults.length > 0 ? caseData.testResults.map((test, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-2 rounded bg-accent/50">
                                                        <div>
                                                            <p className="text-sm">{test.test}</p>
                                                            <p className="text-xs text-muted-foreground capitalize">{test.status}</p>
                                                        </div>
                                                        <span className={`text-sm font-medium ${test.status !== "normal" ? "text-destructive" : "text-green-600"}`}>{test.value}</span>
                                                    </div>
                                                )) : <p className="text-muted-foreground text-sm">No test results available.</p>}
                                            </div>
                                        </Card>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}