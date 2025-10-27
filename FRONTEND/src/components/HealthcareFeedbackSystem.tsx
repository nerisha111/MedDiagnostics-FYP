import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import {
  ArrowLeft,
  Star,
  MessageSquare,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  Send,
} from "lucide-react";
import { toast } from "sonner";


interface FeedbackItem {
  id: string;
  diagnosisTitle: string;
  diagnosisId: string;
  date: string;
  rating?: number;
  accuracyRating?: number;
  usefulnessRating?: number;
  comments?: string;
  status: "given" | "pending";
}

export function HealthcareFeedbackSystem() {
  const navigate = useNavigate(); 
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<FeedbackItem | null>(null);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [accuracyRating, setAccuracyRating] = useState(0);
  const [usefulnessRating, setUsefulnessRating] = useState(0);
  const [comments, setComments] = useState("");

  // Mock data for given feedback
  const [givenFeedback] = useState<FeedbackItem[]>([
    {
      id: "D-001",
      diagnosisTitle: "Type 2 Diabetes Mellitus",
      diagnosisId: "PT-2024-001",
      date: "2024-10-15",
      rating: 5,
      accuracyRating: 5,
      usefulnessRating: 5,
      comments: "Excellent diagnostic accuracy. The AI correctly identified diabetes markers and provided comprehensive treatment recommendations.",
      status: "given",
    },
    {
      id: "D-002",
      diagnosisTitle: "Hypertension Stage 2",
      diagnosisId: "PT-2024-002",
      date: "2024-10-12",
      rating: 4,
      accuracyRating: 4,
      usefulnessRating: 4,
      comments: "Good overall analysis. The confidence score could have been higher given the clear test results.",
      status: "given",
    },
    {
      id: "D-003",
      diagnosisTitle: "Community-Acquired Pneumonia",
      diagnosisId: "PT-2024-003",
      date: "2024-10-10",
      rating: 5,
      accuracyRating: 5,
      usefulnessRating: 5,
      comments: "Multimodal analysis combining lab results and imaging was very thorough and accurate.",
      status: "given",
    },
    {
      id: "D-004",
      diagnosisTitle: "Osteoarthritis",
      diagnosisId: "PT-2024-005",
      date: "2024-10-08",
      rating: 4,
      accuracyRating: 4,
      usefulnessRating: 3,
      comments: "Accurate diagnosis but treatment recommendations could be more detailed.",
      status: "given",
    },
  ]);

  // Mock data for pending feedback
  const [pendingFeedback] = useState<FeedbackItem[]>([
    {
      id: "D-005",
      diagnosisTitle: "Acute Bronchitis",
      diagnosisId: "PT-2024-010",
      date: "2024-10-20",
      status: "pending",
    },
    {
      id: "D-006",
      diagnosisTitle: "Migraine without Aura",
      diagnosisId: "PT-2024-011",
      date: "2024-10-19",
      status: "pending",
    },
    {
      id: "D-007",
      diagnosisTitle: "Gastroesophageal Reflux Disease",
      diagnosisId: "PT-2024-012",
      date: "2024-10-18",
      status: "pending",
    },
    {
      id: "D-008",
      diagnosisTitle: "Atrial Fibrillation",
      diagnosisId: "PT-2024-013",
      date: "2024-10-17",
      status: "pending",
    },
    {
      id: "D-009",
      diagnosisTitle: "Chronic Kidney Disease Stage 3",
      diagnosisId: "PT-2024-014",
      date: "2024-10-16",
      status: "pending",
    },
  ]);

  const handleSubmitFeedback = () => {
    if (!selectedDiagnosis) return;

    if (accuracyRating === 0 || usefulnessRating === 0) {
      toast.error("Please provide ratings for both accuracy and usefulness");
      return;
    }

    toast.success("Feedback submitted successfully");
    setFeedbackDialogOpen(false);
    setAccuracyRating(0);
    setUsefulnessRating(0);
    setComments("");
    setSelectedDiagnosis(null);
  };

  const handleProvideFeedback = (diagnosis: FeedbackItem) => {
    setSelectedDiagnosis(diagnosis);
    setFeedbackDialogOpen(true);
  };

  const handleViewFeedback = (diagnosis: FeedbackItem) => {
    setSelectedDiagnosis(diagnosis);
    setAccuracyRating(diagnosis.accuracyRating || 0);
    setUsefulnessRating(diagnosis.usefulnessRating || 0);
    setComments(diagnosis.comments || "");
    setFeedbackDialogOpen(true);
  };

  const renderStarRating = (rating: number, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange && onRatingChange(star)}
            className={`transition-colors ${onRatingChange ? 'cursor-pointer' : 'cursor-default'}`}
            disabled={!onRatingChange}
          >
            <Star
              className={`w-6 h-6 ${
                star <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">

          <div className="flex-1">
            <h1 className="text-3xl">Feedback System</h1>
            <p className="text-muted-foreground">
              Review and provide feedback on diagnostic cases
            </p>
          </div>
        </div>

        {/* Tabs for Given and Pending Feedback */}
        <Tabs defaultValue="given" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="given" className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Given Feedback ({givenFeedback.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending Feedback ({pendingFeedback.length})
            </TabsTrigger>
          </TabsList>

          {/* Given Feedback Tab */}
          <TabsContent value="given" className="space-y-4">
            {givenFeedback.length === 0 ? (
              <Card className="p-12 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl mb-2">No Feedback Given Yet</h3>
                <p className="text-muted-foreground">
                  You haven't provided any feedback on diagnoses yet.
                </p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {givenFeedback.map((feedback) => (
                  <Card key={feedback.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <FileText className="w-5 h-5 text-primary" />
                            <h3 className="text-lg">{feedback.diagnosisTitle}</h3>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <span className="font-medium">ID:</span> {feedback.diagnosisId}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {feedback.date}
                            </span>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Submitted
                        </Badge>
                      </div>

                      <Separator />

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm text-muted-foreground mb-2 block">
                            Accuracy Rating
                          </Label>
                          {renderStarRating(feedback.accuracyRating || 0)}
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground mb-2 block">
                            Usefulness Rating
                          </Label>
                          {renderStarRating(feedback.usefulnessRating || 0)}
                        </div>
                      </div>

                      {feedback.comments && (
                        <div>
                          <Label className="text-sm text-muted-foreground mb-2 block">
                            Comments
                          </Label>
                          <p className="text-sm bg-muted p-3 rounded-lg">
                            {feedback.comments}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewFeedback(feedback)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Pending Feedback Tab */}
          <TabsContent value="pending" className="space-y-4">
            {pendingFeedback.length === 0 ? (
              <Card className="p-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl mb-2">All Caught Up!</h3>
                <p className="text-muted-foreground">
                  You've provided feedback on all diagnoses.
                </p>
              </Card>
            ) : (
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <p className="text-sm text-amber-800">
                    You have {pendingFeedback.length} diagnoses waiting for your feedback
                  </p>
                </div>

                <div className="grid gap-4">
                  {pendingFeedback.map((diagnosis) => (
                    <Card key={diagnosis.id} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <FileText className="w-5 h-5 text-primary" />
                              <h3 className="text-lg">{diagnosis.diagnosisTitle}</h3>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <span className="font-medium">ID:</span> {diagnosis.diagnosisId}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {diagnosis.date}
                              </span>
                            </div>
                          </div>
                          <Badge variant="outline" className="border-amber-300 text-amber-700">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        </div>

                        <Separator />

                        <Button
                          onClick={() => handleProvideFeedback(diagnosis)}
                          className="w-full bg-primary hover:bg-primary/90"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Provide Feedback
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedDiagnosis?.status === "pending" ? "Provide Feedback" : "View Feedback"}
            </DialogTitle>
            <DialogDescription>
              {selectedDiagnosis?.status === "pending"
                ? "Share your professional feedback on this diagnosis"
                : "Review the feedback you provided for this diagnosis"}
            </DialogDescription>
          </DialogHeader>

          {selectedDiagnosis && (
            <div className="space-y-6 py-4">
              {/* Diagnosis Info */}
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="font-medium">{selectedDiagnosis.diagnosisTitle}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>ID: {selectedDiagnosis.diagnosisId}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {selectedDiagnosis.date}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Accuracy Rating */}
              <div className="space-y-3">
                <Label htmlFor="accuracy">
                  Diagnostic Accuracy <span className="text-destructive">*</span>
                </Label>
                <p className="text-sm text-muted-foreground">
                  Rate how accurate the AI diagnosis was
                </p>
                {renderStarRating(
                  accuracyRating,
                  selectedDiagnosis.status === "pending" ? setAccuracyRating : undefined
                )}
              </div>

              {/* Usefulness Rating */}
              <div className="space-y-3">
                <Label htmlFor="usefulness">
                  Clinical Usefulness <span className="text-destructive">*</span>
                </Label>
                <p className="text-sm text-muted-foreground">
                  Rate how useful the recommendations were
                </p>
                {renderStarRating(
                  usefulnessRating,
                  selectedDiagnosis.status === "pending" ? setUsefulnessRating : undefined
                )}
              </div>

              {/* Comments */}
              <div className="space-y-3">
                <Label htmlFor="comments">Additional Comments</Label>
                <p className="text-sm text-muted-foreground">
                  Provide detailed feedback to help improve the system
                </p>
                <Textarea
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Share your professional observations..."
                  rows={5}
                  disabled={selectedDiagnosis.status === "given"}
                />
              </div>

              {/* Action Buttons */}
              {selectedDiagnosis.status === "pending" && (
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setFeedbackDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitFeedback}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit Feedback
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}