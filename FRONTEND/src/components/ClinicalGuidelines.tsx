import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Checkbox } from "./ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  ArrowLeft,
  Search,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Filter,
  ChevronDown,
  Calendar,
  Award,
  Share2,
  FileText,
} from "lucide-react";


export function ClinicalGuidelines() {
  const navigate = useNavigate(); // 3. Initialize the navigate function
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [selectedGuideline, setSelectedGuideline] = useState<string | null>("guideline-1");
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(["guideline-1"]);
  const [sourceFilter, setSourceFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [evidenceFilter, setEvidenceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("relevant");

  const guidelines = [
    {
      id: "guideline-1",
      title: "Standards of Medical Care in Diabetes - 2024",
      organization: "American Diabetes Association",
      logo: "🏥",
      updated: "January 2024",
      summary:
        "Comprehensive clinical practice recommendations for diabetes diagnosis, treatment, and management including glycemic targets and pharmacological approaches.",
      evidenceLevel: "A",
      category: "Endocrinology",
      specialty: "Diabetes",
      tags: ["Type 2 Diabetes", "HbA1c", "Metformin", "Insulin"],
      citations: 1247,
    },
    {
      id: "guideline-2",
      title: "Hypertension Management: 2023 Update",
      organization: "American Heart Association",
      logo: "❤️",
      updated: "March 2023",
      summary:
        "Evidence-based guidelines for the prevention, detection, evaluation, and management of high blood pressure in adults.",
      evidenceLevel: "A",
      category: "Cardiology",
      specialty: "Hypertension",
      tags: ["Blood Pressure", "Cardiovascular", "Medication"],
      citations: 892,
    },
    {
      id: "guideline-3",
      title: "Community-Acquired Pneumonia Treatment Guidelines",
      organization: "Infectious Diseases Society",
      logo: "🦠",
      updated: "June 2023",
      summary:
        "Clinical practice guidelines for the diagnosis and treatment of community-acquired pneumonia in adults.",
      evidenceLevel: "B",
      category: "Respiratory",
      specialty: "Pneumonia",
      tags: ["Antibiotics", "Chest X-ray", "Respiratory"],
      citations: 634,
    },
    {
      id: "guideline-4",
      title: "Osteoarthritis Management Recommendations",
      organization: "American College of Rheumatology",
      logo: "🦴",
      updated: "September 2023",
      summary:
        "Comprehensive guidelines for the management of osteoarthritis including pharmacological and non-pharmacological interventions.",
      evidenceLevel: "A",
      category: "Rheumatology",
      specialty: "Musculoskeletal",
      tags: ["Joint Pain", "NSAIDs", "Physical Therapy"],
      citations: 521,
    },
    {
      id: "guideline-5",
      title: "Iron Deficiency Anemia: Diagnostic and Treatment Protocol",
      organization: "World Health Organization",
      logo: "🌍",
      updated: "May 2024",
      summary:
        "Global guidelines for screening, diagnosis, and treatment of iron deficiency anemia across different populations.",
      evidenceLevel: "A",
      category: "Hematology",
      specialty: "Anemia",
      tags: ["Hemoglobin", "Iron Supplements", "Nutrition"],
      citations: 743,
    },
  ];

  const filteredGuidelines = guidelines.filter((guideline) => {
    const matchesSearch =
      searchQuery === "" ||
      guideline.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guideline.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guideline.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSource =
      sourceFilter === "all" || guideline.organization.includes(sourceFilter);
    const matchesCategory =
      categoryFilter === "all" || guideline.category === categoryFilter;
    const matchesEvidence =
      evidenceFilter === "all" || guideline.evidenceLevel === evidenceFilter;
    return matchesSearch && matchesSource && matchesCategory && matchesEvidence;
  });

  const selectedGuidelineData = guidelines.find((g) => g.id === selectedGuideline);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1800px] mx-auto p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
           
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl">Clinical Guidelines Database</h1>
              <p className="text-muted-foreground">
                Evidence-based clinical practice guidelines from leading organizations
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <BookmarkCheck className="w-4 h-4 mr-2" />
              Bookmarked ({bookmarkedIds.length})
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Search and Filters Panel */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="p-4">
              {/* Search */}
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search guidelines..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Recent Searches */}
                {searchQuery === "" && (
                  <div className="text-xs text-muted-foreground">
                    <p className="mb-2">Recent searches:</p>
                    <div className="flex flex-wrap gap-1">
                      <Badge
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => setSearchQuery("diabetes")}
                      >
                        diabetes
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => setSearchQuery("hypertension")}
                      >
                        hypertension
                      </Badge>
                    </div>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              {/* Filters */}
              <Collapsible open={showFilters} onOpenChange={setShowFilters}>
                <CollapsibleTrigger className="w-full flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <span>Filters</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      showFilters ? "rotate-180" : ""
                    }`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-4">
                  {/* Source Organization */}
                  <div className="space-y-2">
                    <label className="text-sm">Source Organization</label>
                    <Select value={sourceFilter} onValueChange={setSourceFilter}>
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Organizations</SelectItem>
                        <SelectItem value="American">American (ADA, AHA, ACR)</SelectItem>
                        <SelectItem value="World">WHO</SelectItem>
                        <SelectItem value="CDC">CDC</SelectItem>
                        <SelectItem value="NHS">NHS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Disease Category */}
                  <div className="space-y-2">
                    <label className="text-sm">Disease Category</label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="Endocrinology">Endocrinology</SelectItem>
                        <SelectItem value="Cardiology">Cardiology</SelectItem>
                        <SelectItem value="Respiratory">Respiratory</SelectItem>
                        <SelectItem value="Rheumatology">Rheumatology</SelectItem>
                        <SelectItem value="Hematology">Hematology</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Evidence Level */}
                  <div className="space-y-2">
                    <label className="text-sm">Evidence Level</label>
                    <Select value={evidenceFilter} onValueChange={setEvidenceFilter}>
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="A">Level A (High Quality)</SelectItem>
                        <SelectItem value="B">Level B (Moderate)</SelectItem>
                        <SelectItem value="C">Level C (Low Quality)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Specialty */}
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Specialty</label>
                    <div className="space-y-1">
                      {["Diabetes", "Hypertension", "Pneumonia", "Anemia"].map((spec) => (
                        <div key={spec} className="flex items-center space-x-2">
                          <Checkbox id={spec} />
                          <label htmlFor={spec} className="text-sm cursor-pointer">
                            {spec}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSourceFilter("all");
                      setCategoryFilter("all");
                      setEvidenceFilter("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {filteredGuidelines.length} guideline{filteredGuidelines.length !== 1 ? "s" : ""}{" "}
                found
              </p>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevant">Most Relevant</SelectItem>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="cited">Most Cited</SelectItem>
                  <SelectItem value="az">A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-2">
              {filteredGuidelines.map((guideline) => (
                <Card
                  key={guideline.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedGuideline === guideline.id
                      ? "border-primary border-2 bg-primary/5"
                      : ""
                  }`}
                  onClick={() => setSelectedGuideline(guideline.id)}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="mb-1 line-clamp-2">{guideline.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="text-lg">{guideline.logo}</span>
                          <span>{guideline.organization}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(guideline.id);
                        }}
                        className="flex-shrink-0"
                      >
                        {bookmarkedIds.includes(guideline.id) ? (
                          <BookmarkCheck className="w-5 h-5 text-primary" />
                        ) : (
                          <Bookmark className="w-5 h-5 text-muted-foreground hover:text-primary" />
                        )}
                      </button>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {guideline.summary}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {guideline.tags.slice(0, 3).map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {guideline.updated}
                        </span>
                        <span className="flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          Evidence: {guideline.evidenceLevel}
                        </span>
                      </div>
                      <span>{guideline.citations} citations</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-5">
            {selectedGuidelineData ? (
              <Card className="p-6 sticky top-6">
                <div className="space-y-6">
                  {/* Header */}
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h2 className="text-2xl mb-2">{selectedGuidelineData.title}</h2>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span className="text-2xl">{selectedGuidelineData.logo}</span>
                          <div>
                            <p>{selectedGuidelineData.organization}</p>
                            <p className="text-sm">Updated: {selectedGuidelineData.updated}</p>
                          </div>
                        </div>
                      </div>
                      <Badge
                        className={
                          selectedGuidelineData.evidenceLevel === "A"
                            ? "bg-green-500"
                            : selectedGuidelineData.evidenceLevel === "B"
                            ? "bg-blue-500"
                            : "bg-yellow-500"
                        }
                      >
                        Evidence Level {selectedGuidelineData.evidenceLevel}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline">{selectedGuidelineData.category}</Badge>
                      <Badge variant="outline">{selectedGuidelineData.specialty}</Badge>
                    </div>
                  </div>

                  <Separator />

                  {/* Summary */}
                  <div>
                    <h3 className="mb-2">Summary</h3>
                    <p className="text-muted-foreground">{selectedGuidelineData.summary}</p>
                  </div>

                  <Separator />

                  {/* Key Recommendations */}
                  <div>
                    <h3 className="mb-3">Key Recommendations</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">
                          Initial screening recommended for all adults over 45 years
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">
                          Lifestyle modifications as first-line intervention
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">
                          Pharmacological therapy based on individual risk factors
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">
                          Regular monitoring and follow-up every 3-6 months
                        </span>
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  {/* Related Diagnoses */}
                  <div>
                    <h3 className="mb-2">Related Diagnoses</h3>
                    <div className="flex flex-wrap gap-1">
                      {selectedGuidelineData.tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Applicable Patient Populations */}
                  <div>
                    <h3 className="mb-2">Applicable Patient Populations</h3>
                    <p className="text-sm text-muted-foreground">
                      Adults aged 18+ with confirmed or suspected diagnosis. Special
                      considerations for elderly patients and those with comorbidities.
                    </p>
                  </div>

                  <Separator />

                  {/* References */}
                  <div>
                    <h3 className="mb-2">Citations</h3>
                    <p className="text-sm text-muted-foreground">
                      This guideline has been cited {selectedGuidelineData.citations} times in
                      peer-reviewed literature
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1 bg-primary hover:bg-primary/90">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Full Document
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <FileText className="w-4 h-4 mr-2" />
                      Add to Report
                    </Button>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Guideline
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">
                  Select a guideline to view details
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}