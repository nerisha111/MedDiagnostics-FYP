import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
// CHANGE 1: Added DialogDescription to imports
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { FileText, CheckCircle2, Clock, Activity, AlertCircle, MessageSquare, Star, Calendar, FlaskConical, Pill } from "lucide-react";
import { toast } from "sonner";
import { supabase } from '../supabaseClient';

// INTERFACES

interface Recommendation {
  id: string;
  name: string;
  category: string | null;
  type: string | null;
  description: string | null;
}

interface DiagnosisDetailResponse {
  id: string;
  diagnostic_case: {
    description: string;
    chief_complaint?: string;
  };
  name: string;
  confidence: number;
  recommendations: Recommendation[]; 
}

interface FullFeedbackDetails {
  id: string;
  diagnosis_details: {
    id: string;
    name: string;
    diagnosis_date: string;
  };
  accuracy_stars: number | null;
  next_steps_rating: number | null;
  general_comments: string | null;
}

interface HealthcareFeedbackSystemProps {
  onProvideFeedback: (diagnosisId: string) => void;
}
interface DiagnosisFeedback {
  id: string;
  diagnosisTitle: string;
  date: string;
  status: "given" | "pending";
}

export function HealthcareFeedbackSystem({ onProvideFeedback }: HealthcareFeedbackSystemProps) {
  const [diagnoses, setDiagnoses] = useState<DiagnosisFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // STATE FOR THE MODAL
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [modalContentType, setModalContentType] = useState<'diagnosis' | 'feedback' | null>(null);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<DiagnosisDetailResponse | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<FullFeedbackDetails | null>(null);

  const fetchDiagnoses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const response = await fetch(`/api/diagnoses/with-feedback/`, {
        headers: { "Authorization": `Bearer ${session.access_token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch feedback data.");
      const data: DiagnosisFeedback[] = await response.json();
      setDiagnoses(data);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnoses();
  }, []);

  const handleViewDiagnosisDetails = async (diagnosisId: string) => {
    setModalContentType('diagnosis');
    setIsModalLoading(true);
    setIsModalOpen(true);
    setSelectedDiagnosis(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const response = await fetch(`/api/diagnoses/${diagnosisId}/`, {
        headers: { "Authorization": `Bearer ${session.access_token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch diagnosis details.");
      const data: DiagnosisDetailResponse = await response.json();
      setSelectedDiagnosis(data);
    } catch (err: any) {
      toast.error(err.message || "Could not load details.");
      setIsModalOpen(false);
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleViewFeedbackDetails = async (diagnosisId: string) => {
    setModalContentType('feedback');
    setIsModalLoading(true);
    setIsModalOpen(true);
    setSelectedFeedback(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const response = await fetch(`/api/feedback/diagnosis/${diagnosisId}/`, {
        headers: { "Authorization": `Bearer ${session.access_token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch feedback details.");
      const data: FullFeedbackDetails = await response.json();
      setSelectedFeedback(data);
    } catch (err: any) {
      toast.error(err.message || "Could not load feedback.");
      setIsModalOpen(false);
    } finally {
      setIsModalLoading(false);
    }
  };

  const givenFeedback = diagnoses.filter((d) => d.status === "given");
  const pendingFeedback = diagnoses.filter((d) => d.status === "pending");

  const renderStarRating = (rating: number | null) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className={`w-5 h-5 ${star <= (rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
      ))}
    </div>
  );

  if (isLoading) { return <div className="min-h-screen flex items-center justify-center"><Activity className="w-12 h-12 animate-spin text-primary" /></div>; }
  if (error) { return <div className="min-h-screen flex items-center justify-center text-red-500"><AlertCircle className="w-8 h-8 mr-4" /><p>{error}</p></div>; }

  const DiagnosisCard = ({ item }: { item: DiagnosisFeedback }) => (
    <Card className="hover:bg-muted/50 transition-colors">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <FileText className="w-6 h-6 text-primary" />
          <div>
            <p className="font-semibold">{item.diagnosisTitle}</p>
            <p className="text-sm text-muted-foreground">{new Date(item.date).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (item.status === 'given') {
                handleViewFeedbackDetails(item.id);
              } else {
                handleViewDiagnosisDetails(item.id);
              }
            }}
          >
            View Details
          </Button>
          {item.status === 'pending' && (
            <Button size="sm" onClick={() => onProvideFeedback(item.id)}>
              Provide Feedback
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-8 space-y-6">
        <h1 className="text-3xl font-bold">Feedback System</h1>
        <p className="text-muted-foreground">Review and provide feedback on AI-generated diagnostic reports.</p>
        <Separator />
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="pending"><Clock className="w-4 h-4 mr-2" />Pending ({pendingFeedback.length})</TabsTrigger>
            <TabsTrigger value="given"><CheckCircle2 className="w-4 h-4 mr-2" />Completed ({givenFeedback.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="pending">
            {pendingFeedback.length > 0 ? <div className="space-y-3">{pendingFeedback.map((d) => <DiagnosisCard key={d.id} item={d} />)}</div> : <Card className="p-12 text-center"><CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" /><h3 className="font-semibold">All Caught Up!</h3></Card>}
          </TabsContent>
          <TabsContent value="given">
            {givenFeedback.length > 0 ? <div className="space-y-3">{givenFeedback.map((f) => <DiagnosisCard key={f.id} item={f} />)}</div> : <Card className="p-12 text-center"><MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" /><h3 className="font-semibold">No Feedback Submitted</h3></Card>}
          </TabsContent>
        </Tabs>
      </div>

  
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
          {isModalLoading ? (
            <div className="flex items-center justify-center h-64">
                {/* CHANGE 2: Added invisible Title/Description for Loading State to prevent console errors */}
                <DialogTitle className="sr-only">Loading</DialogTitle>
                <DialogDescription className="sr-only">Loading details, please wait.</DialogDescription>
                <Activity className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {modalContentType === 'diagnosis' && selectedDiagnosis && (
                <>
                    <DialogHeader className="flex-shrink-0">
                    <DialogTitle>View Details</DialogTitle>
                    {/* CHANGE 3: Swapped <p> for <DialogDescription> */}
                    <DialogDescription>A summary of the AI's diagnostic analysis.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4 overflow-y-auto flex-1 pr-2">
                    <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Chief Complaint</label>
                <p className="text-base p-4 bg-muted/50 rounded-lg border">
                    {(() => {
                    const badValues = ['not specified', 'null', 'none', '', 'general consultation', 'no description recorded', 'no description recorded.'];
                    
                    // Priority 1: Check chief_complaint from diagnostic_case
                    if (selectedDiagnosis.diagnostic_case?.chief_complaint) {
                        const complaint = String(selectedDiagnosis.diagnostic_case.chief_complaint).trim();
                        if (complaint && !badValues.includes(complaint.toLowerCase())) {
                        return complaint;
                        }
                    }
                    
                    // Priority 2: Check description from diagnostic_case
                    if (selectedDiagnosis.diagnostic_case?.description) {
                        const desc = String(selectedDiagnosis.diagnostic_case.description).trim();
                        if (desc && !badValues.includes(desc.toLowerCase())) {
                        return desc;
                        }
                    }
                    
                    // Fallback
                    return "No chief complaint recorded.";
                    })()}
                </p>
                </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Primary Diagnosis</label>
                        <p className="font-semibold text-lg">{selectedDiagnosis.name}</p>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">AI Confidence</label>
                        <p className="font-bold text-xl text-primary">{selectedDiagnosis.confidence}%</p>
                    </div>
                    
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Recommended Tests</label>
                        <div className="p-4 bg-muted/50 rounded-lg border">
                        {(() => {
                            // Filter based on actual database categories
                            const tests = selectedDiagnosis.recommendations.filter(r => {
                            // Use the category field from database
                            const categoryLower = (r.category || '').toLowerCase();
                            const typeLower = (r.type || '').toLowerCase();
                            
                            return (
                                categoryLower.includes('diagnostic') ||
                                categoryLower.includes('imaging') ||
                                categoryLower.includes('cardiac monitoring') ||
                                typeLower === 'test' ||
                                categoryLower === 'imaging test'
                            );
                            });

                            return tests.length > 0 ? (
                            <div className="space-y-2">
                                {tests.map((test, index) => (
                                <div key={index} className="flex items-start gap-2 p-2 bg-background rounded border">
                                    <FlaskConical className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                                    <div className="flex-1">
                                    <p className="text-sm font-medium">{test.name}</p>
                                    {test.description && (
                                        <p className="text-xs text-muted-foreground mt-1">{test.description}</p>
                                    )}
                                    <div className="flex gap-2 mt-1">
                                        <Badge variant="secondary" className="text-xs">
                                        {test.category}
                                        </Badge>
                                        {test.type && (
                                        <Badge variant="outline" className="text-xs">
                                            {test.type}
                                        </Badge>
                                        )}
                                    </div>
                                    </div>
                                </div>
                                ))}
                            </div>
                            ) : (
                            <p className="text-sm text-muted-foreground">No specific tests recommended.</p>
                            );
                        })()}
                        </div>
                    </div>

                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Treatment Options</label>
                        <div className="p-4 bg-muted/50 rounded-lg border">
                        {(() => {
                            // Filter for treatments and medications
                            const treatments = selectedDiagnosis.recommendations.filter(r => {
                            const categoryLower = (r.category || '').toLowerCase();
                            const typeLower = (r.type || '').toLowerCase();
                            
                            return (
                                categoryLower === 'treatment' ||
                                categoryLower.includes('medication') ||
                                categoryLower.includes('therapeutic') ||
                                categoryLower.includes('supportive care') ||
                                typeLower === 'treatment'
                            );
                            });

                            return treatments.length > 0 ? (
                            <div className="space-y-2">
                                {treatments.map((treatment, index) => (
                                <div key={index} className="flex items-start gap-2 p-2 bg-background rounded border">
                                    <Pill className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                                    <div className="flex-1">
                                    <p className="text-sm font-medium">{treatment.name}</p>
                                    {treatment.description && (
                                        <p className="text-xs text-muted-foreground mt-1">{treatment.description}</p>
                                    )}
                                    <div className="flex gap-2 mt-1">
                                        <Badge variant="secondary" className="text-xs">
                                        {treatment.category}
                                        </Badge>
                                        {treatment.type && (
                                        <Badge variant="outline" className="text-xs">
                                            {treatment.type}
                                        </Badge>
                                        )}
                                    </div>
                                    </div>
                                </div>
                                ))}
                            </div>
                            ) : (
                            <p className="text-sm text-muted-foreground">No specific treatments recommended.</p>
                            );
                        })()}
                        </div>
                    </div>

                    {/* NEW: General Recommendations/Next Steps */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">General Recommendations</label>
                        <div className="p-4 bg-muted/50 rounded-lg border">
                        {(() => {
                            // Filter for general plans and other categories
                            const generalRecs = selectedDiagnosis.recommendations.filter(r => {
                            const categoryLower = (r.category || '').toLowerCase();
                            const typeLower = (r.type || '').toLowerCase();
                            
                            return (
                                categoryLower === 'general' ||
                                typeLower === 'plan' ||
                                (!categoryLower.includes('diagnostic') && 
                                !categoryLower.includes('imaging') && 
                                !categoryLower.includes('treatment') &&
                                typeLower !== 'test')
                            );
                            });

                            return generalRecs.length > 0 ? (
                            <div className="space-y-2">
                                {generalRecs.map((rec, index) => (
                                <div key={index} className="flex items-start gap-2 p-2 bg-background rounded border">
                                    <Calendar className="w-4 h-4 mt-0.5 text-purple-500 flex-shrink-0" />
                                    <div className="flex-1">
                                    <p className="text-sm">{rec.name}</p>
                                    {rec.description && (
                                        <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                                    )}
                                    </div>
                                </div>
                                ))}
                            </div>
                            ) : null;
                        })()}
                        </div>
                    </div>
                    </div>
                </>
                )}

              {modalContentType === 'feedback' && selectedFeedback && (
                 <>
                  <DialogHeader>
                    <DialogTitle>View Feedback</DialogTitle>
                    {/* CHANGE 3: Swapped <p> for <DialogDescription> */}
                    <DialogDescription>Your submitted feedback for this diagnosis.</DialogDescription>
                  </DialogHeader>
                  <Separator />
                  <div className="space-y-6 py-4">
                    <Card className="p-4 bg-muted/50">
                      <p className="font-semibold flex items-center gap-2"><FileText className="w-4 h-4 text-primary" />{selectedFeedback.diagnosis_details.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">Reviewed on: {new Date(selectedFeedback.diagnosis_details.diagnosis_date).toLocaleDateString()}</p>
                    </Card>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Diagnostic Accuracy</label>
                      {renderStarRating(selectedFeedback.accuracy_stars)}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Clinical Usefulness</label>
                      {renderStarRating(selectedFeedback.next_steps_rating)}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Additional Comments</label>
                      <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md border min-h-[80px]">{selectedFeedback.general_comments || "No comments."}</p>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}