import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ArrowLeft, FileText, Maximize2, Minimize2, Plus, X } from "lucide-react";

// 2. Removed the props interface
export function CaseComparison() {
  const navigate = useNavigate(); // 3. Initialize the navigate function
  const [selectedCases, setSelectedCases] = useState(["PT-2024-001", "PT-2024-002"]);
  const [syncScroll, setSyncScroll] = useState(true);
  const [expandedView, setExpandedView] = useState(false);

  const availableCases = [
    { id: "PT-2024-001", diagnosis: "Type 2 Diabetes", date: "Oct 18, 2024" },
    { id: "PT-2024-002", diagnosis: "Hypertension", date: "Oct 18, 2024" },
    { id: "PT-2024-003", diagnosis: "Pneumonia", date: "Oct 17, 2024" },
    { id: "PT-2024-004", diagnosis: "Anemia", date: "Oct 17, 2024" },
  ];

  const casesData = {
    "PT-2024-001": {
      id: "PT-2024-001",
      date: "October 18, 2024",
      diagnosis: "Type 2 Diabetes Mellitus",
      confidence: 92,
      age: 58,
      gender: "Male",
      symptoms: [
        "Increased thirst",
        "Frequent urination",
        "Unexplained weight loss",
        "Fatigue",
      ],
      uniqueSymptoms: ["Blurred vision"],
      commonSymptoms: ["Increased thirst", "Frequent urination", "Fatigue"],
      testResults: [
        { test: "HbA1c", value: "8.2%", status: "high" },
        { test: "Fasting Glucose", value: "156 mg/dL", status: "high" },
        { test: "BMI", value: "32.4", status: "high" },
      ],
      treatment: [
        "Metformin 500mg twice daily",
        "Lifestyle modifications",
        "Diabetes education program",
        "Regular glucose monitoring",
      ],
      outcome: "Improved glycemic control after 3 months",
    },
    "PT-2024-002": {
      id: "PT-2024-002",
      date: "October 18, 2024",
      diagnosis: "Essential Hypertension",
      confidence: 88,
      age: 62,
      gender: "Female",
      symptoms: ["Headaches", "Dizziness", "Fatigue", "Chest discomfort"],
      uniqueSymptoms: ["Chest discomfort", "Shortness of breath"],
      commonSymptoms: ["Headaches", "Dizziness", "Fatigue"],
      testResults: [
        { test: "Blood Pressure", value: "152/94 mmHg", status: "high" },
        { test: "Total Cholesterol", value: "238 mg/dL", status: "high" },
        { test: "BMI", value: "29.1", status: "high" },
      ],
      treatment: [
        "Lisinopril 10mg daily",
        "Low-sodium diet",
        "Regular exercise",
        "Blood pressure monitoring",
      ],
      outcome: "BP controlled within target range after 6 weeks",
    },
  };

  const handleCaseChange = (index: number, caseId: string) => {
    const newCases = [...selectedCases];
    newCases[index] = caseId;
    setSelectedCases(newCases);
  };

  const addCase = () => {
    if (selectedCases.length < 3) {
      const availableCase = availableCases.find(
        (c) => !selectedCases.includes(c.id)
      );
      if (availableCase) {
        setSelectedCases([...selectedCases, availableCase.id]);
      }
    }
  };

  const removeCase = (index: number) => {
    if (selectedCases.length > 2) {
      setSelectedCases(selectedCases.filter((_, i) => i !== index));
    }
  };

  const findSimilarities = () => {
    // Implementation for highlighting similarities
    console.log("Finding similarities...");
  };

  const findDifferences = () => {
    // Implementation for highlighting differences
    console.log("Finding differences...");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className={`mx-auto p-8 space-y-6 ${expandedView ? "max-w-full" : "max-w-[1800px]"}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">

            <div>
              <h1 className="text-3xl">Case Comparison</h1>
              <p className="text-muted-foreground">
                Compare up to 3 cases side-by-side
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={findSimilarities}>
              Find Similarities
            </Button>
            <Button variant="outline" onClick={findDifferences}>
              Show Differences
            </Button>

            <Button>
              <FileText className="w-4 h-4 mr-2" />
              Export Comparison
            </Button>
          </div>
        </div>

        {/* Case Selection */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm">Compare:</span>
            {selectedCases.map((caseId, index) => (
              <div key={index} className="flex items-center gap-2">
                <Select value={caseId} onValueChange={(value: string) => handleCaseChange(index, value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCases.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.id} - {c.diagnosis}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCases.length > 2 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCase(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            {selectedCases.length < 3 && (
              <Button variant="outline" size="sm" onClick={addCase}>
                <Plus className="w-4 h-4 mr-2" />
                Add Case
              </Button>
            )}
          </div>
        </Card>

        {/* Comparison Grid */}
        <div className={`grid gap-6 ${selectedCases.length === 2 ? "lg:grid-cols-2" : "lg:grid-cols-3"}`}>
          {selectedCases.map((caseId) => {
            const caseData = casesData[caseId as keyof typeof casesData];
            if (!caseData) return null;

            return (
              <div key={caseId} className="space-y-4">
                {/* Case Header */}
                <Card className="p-6 bg-primary/5">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl mb-1">{caseData.id}</h3>
                        <p className="text-sm text-muted-foreground">{caseData.date}</p>
                      </div>
                      <Badge className="bg-primary">{caseData.confidence}%</Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Age:</span>
                        <span>{caseData.age} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Gender:</span>
                        <span>{caseData.gender}</span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Comparison Tabs */}
                <Tabs defaultValue="diagnosis" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
                    <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
                    <TabsTrigger value="tests">Tests</TabsTrigger>
                  </TabsList>

                  <TabsContent value="diagnosis" className="space-y-4 mt-4">
                    <Card className="p-4">
                      <h4 className="mb-3">Primary Diagnosis</h4>
                      <p className="text-sm mb-2">{caseData.diagnosis}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Confidence:</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${caseData.confidence}%` }}
                          />
                        </div>
                        <span>{caseData.confidence}%</span>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h4 className="mb-3">Treatment Plan</h4>
                      <ul className="space-y-2">
                        {caseData.treatment.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>

                    {caseData.outcome && (
                      <Card className="p-4 bg-green-50 border-green-200">
                        <h4 className="mb-2">Outcome</h4>
                        <p className="text-sm text-muted-foreground">{caseData.outcome}</p>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="symptoms" className="space-y-4 mt-4">
                    <Card className="p-4">
                      <h4 className="mb-3 flex items-center gap-2">
                        All Symptoms
                        <Badge variant="secondary">{caseData.symptoms.length}</Badge>
                      </h4>
                      <ul className="space-y-2">
                        {caseData.symptoms.map((symptom, idx) => {
                          const isCommon = caseData.commonSymptoms.includes(symptom);
                          const isUnique = caseData.uniqueSymptoms.includes(symptom);
                          return (
                            <li
                              key={idx}
                              className={`flex items-center gap-2 text-sm p-2 rounded ${
                                isCommon
                                  ? "bg-green-50 text-green-900"
                                  : isUnique
                                  ? "bg-blue-50 text-blue-900"
                                  : ""
                              }`}
                            >
                              <div
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isCommon
                                    ? "bg-green-500"
                                    : isUnique
                                    ? "bg-blue-500"
                                    : "bg-muted-foreground"
                                }`}
                              />
                              <span>{symptom}</span>
                              {isCommon && (
                                <Badge variant="outline" className="ml-auto text-xs">
                                  Common
                                </Badge>
                              )}
                              {isUnique && (
                                <Badge variant="outline" className="ml-auto text-xs">
                                  Unique
                                </Badge>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </Card>
                  </TabsContent>

                  <TabsContent value="tests" className="space-y-4 mt-4">
                    <Card className="p-4">
                      <h4 className="mb-3">Test Results</h4>
                      <div className="space-y-3">
                        {caseData.testResults.map((test, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 rounded bg-accent/50"
                          >
                            <div>
                              <p className="text-sm">{test.test}</p>
                              <p className="text-xs text-muted-foreground">
                                {test.status === "high" && "↑ Above normal"}
                                {test.status === "low" && "↓ Below normal"}
                                {test.status === "normal" && "✓ Normal range"}
                              </p>
                            </div>
                            <span
                              className={`text-sm ${
                                test.status === "high" || test.status === "low"
                                  ? "text-destructive"
                                  : "text-green-600"
                              }`}
                            >
                              {test.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            );
          })}
        </div>

        {/* Analysis Summary */}
        <Card className="p-6">
          <h3 className="mb-4">Comparison Analysis</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="mb-2 text-green-600">Common Findings</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Both patients show elevated BMI</li>
                <li>• Common symptoms: Fatigue</li>
                <li>• Both require lifestyle modifications</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 text-blue-600">Key Differences</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Different primary diagnoses</li>
                <li>• Age difference of 4 years</li>
                <li>• Distinct pharmacological treatments</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 text-primary">Clinical Notes</h4>
              <p className="text-sm text-muted-foreground">
                Both cases demonstrate successful outcomes with comprehensive treatment
                approaches combining medication and lifestyle changes.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}