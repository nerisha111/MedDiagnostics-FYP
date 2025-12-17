import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Checkbox } from "./ui/checkbox";
import { Star, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from '../supabaseClient.ts'; 

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  diagnosisId: string;
  onFeedbackSubmitted?: () => void;
}

export function FeedbackModal({ 
  open, 
  onOpenChange, 
  diagnosisId,
  onFeedbackSubmitted 
}: FeedbackModalProps) {
  const [accuracyStars, setAccuracyStars] = useState(0);
  const [accuracyCorrectness, setAccuracyCorrectness] = useState("");
  const [actualDiagnosis, setActualDiagnosis] = useState("");
  const [confidenceScore, setConfidenceScore] = useState("");
  const [nextStepsRating, setNextStepsRating] = useState(0);
  const [followedRecommendations, setFollowedRecommendations] = useState<string[]>([]);
  const [missingInfo, setMissingInfo] = useState("");
  const [generalComments, setGeneralComments] = useState("");
  const [dataQuality, setDataQuality] = useState("");
  const [dataQualityIssues, setDataQualityIssues] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const recommendations = [
    "Further testing",
    "Medication changes",
    "Lifestyle modifications",
    "Specialist referral",
    "Monitoring plan",
  ];

  const resetForm = () => {
    setAccuracyStars(0);
    setAccuracyCorrectness("");
    setActualDiagnosis("");
    setConfidenceScore("");
    setNextStepsRating(0);
    setFollowedRecommendations([]);
    setMissingInfo("");
    setGeneralComments("");
    setDataQuality("");
    setDataQualityIssues("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    //validation
    if (accuracyCorrectness === "incorrect" && !actualDiagnosis.trim()) {
      setError("Please provide the actual diagnosis when marking as incorrect");
      setIsSubmitting(false);
      return;
    }
    if (dataQuality === "no" && !dataQualityIssues.trim()) {
      setError("Please describe the data quality issues");
      setIsSubmitting(false);
      return;
    }
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error("Authentication token not found. Please log in again.");
      }
      const token = session.access_token;
      const feedbackData = {
        diagnosis: diagnosisId,
        accuracy_stars: accuracyStars || null,
        accuracy_correctness: accuracyCorrectness || null,
        actual_diagnosis: actualDiagnosis || null,
        confidence_score_assessment: confidenceScore || null,
        next_steps_rating: nextStepsRating || null,
        followed_recommendations: followedRecommendations.length > 0 ? followedRecommendations : null,
        missing_info: missingInfo || null,
        general_comments: generalComments || null,
        data_quality: dataQuality || null,
        data_quality_issues: dataQualityIssues || null,
      };
      
      //submit to backend api
      const apiUrl = `/api/feedback/submit/`;
      console.log("Submitting feedback to URL:", apiUrl); 
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        
        body: JSON.stringify(feedbackData),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit feedback");
      }

      setSubmitted(true);
      toast.success("Feedback submitted successfully");
      
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted();
      }

      setTimeout(() => {
        onOpenChange(false);
        setTimeout(() => {
          setSubmitted(false);
          resetForm();
        }, 300);
      }, 1500);

    } catch (err: any) {
      console.error("Error submitting feedback:", err);
      setError(err.message || "Failed to submit feedback. Please try again.");
      toast.error(err.message || "Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({
    value,
    onChange,
  }: {
    value: number;
    onChange: (value: number) => void;
  }) => (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="transition-colors"
          disabled={isSubmitting}
        >
          <Star
            className={`w-8 h-8 ${
              star <= value
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {!submitted ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Help Improve Our System</DialogTitle>
              <DialogDescription>
                Your feedback helps our AI learn and improve diagnostic accuracy
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              {/* Diagnostic Accuracy */}
              <div className="space-y-3">
                <Label className="text-base">How accurate was this diagnosis?</Label>
                <StarRating value={accuracyStars} onChange={setAccuracyStars} />
                <RadioGroup value={accuracyCorrectness} onValueChange={setAccuracyCorrectness}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="correct" id="correct" disabled={isSubmitting} />
                    <Label htmlFor="correct" className="cursor-pointer">
                      Correct
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="partial" id="partial" disabled={isSubmitting} />
                    <Label htmlFor="partial" className="cursor-pointer">
                      Partially Correct
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="incorrect" id="incorrect" disabled={isSubmitting} />
                    <Label htmlFor="incorrect" className="cursor-pointer">
                      Incorrect
                    </Label>
                  </div>
                </RadioGroup>
                {accuracyCorrectness === "incorrect" && (
                  <div className="mt-3">
                    <Label htmlFor="actualDiagnosis">
                      What was the actual diagnosis? <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="actualDiagnosis"
                      value={actualDiagnosis}
                      onChange={(e) => setActualDiagnosis(e.target.value)}
                      placeholder="Enter the correct diagnosis"
                      className="mt-2"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                )}
              </div>

              {/* Confidence Score Assessment */}
              <div className="space-y-3">
                <Label className="text-base">Was the confidence score appropriate?</Label>
                <RadioGroup value={confidenceScore} onValueChange={setConfidenceScore}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="too-low" id="too-low" disabled={isSubmitting} />
                    <Label htmlFor="too-low" className="cursor-pointer">
                      Too Low
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="appropriate" id="appropriate" disabled={isSubmitting} />
                    <Label htmlFor="appropriate" className="cursor-pointer">
                      Appropriate
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="too-high" id="too-high" disabled={isSubmitting} />
                    <Label htmlFor="too-high" className="cursor-pointer">
                      Too High
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Recommended Actions */}
              <div className="space-y-3">
                <Label className="text-base">Were the recommended next steps helpful?</Label>
                <StarRating value={nextStepsRating} onChange={setNextStepsRating} />
                <div className="mt-3">
                  <Label className="text-sm text-muted-foreground mb-2 block">
                    Which recommendations did you follow?
                  </Label>
                  <div className="space-y-2">
                    {recommendations.map((rec) => (
                      <div key={rec} className="flex items-center space-x-2">
                        <Checkbox
                          id={rec}
                          checked={followedRecommendations.includes(rec)}
                          onCheckedChange={(checked: boolean) => {
                            if (checked) {
                              setFollowedRecommendations([...followedRecommendations, rec]);
                            } else {
                              setFollowedRecommendations(
                                followedRecommendations.filter((r) => r !== rec)
                              );
                            }
                          }}
                          disabled={isSubmitting}
                        />
                        <Label htmlFor={rec} className="cursor-pointer">
                          {rec}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Missing Information */}
              <div className="space-y-2">
                <Label htmlFor="missingInfo" className="text-base">
                  Was any critical information missed?
                </Label>
                <Textarea
                  id="missingInfo"
                  value={missingInfo}
                  onChange={(e) => setMissingInfo(e.target.value)}
                  placeholder="Describe any important information that was not considered..."
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>

              {/* General Comments */}
              <div className="space-y-2">
                <Label htmlFor="comments" className="text-base">
                  General Comments
                </Label>
                <Textarea
                  id="comments"
                  value={generalComments}
                  onChange={(e) => setGeneralComments(e.target.value)}
                  placeholder="Share any additional feedback..."
                  rows={3}
                  maxLength={500}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {generalComments.length}/500
                </p>
              </div>

              {/* Data Quality Check */}
              <div className="space-y-3">
                <Label className="text-base">
                  Was the uploaded data of sufficient quality?
                </Label>
                <RadioGroup value={dataQuality} onValueChange={setDataQuality}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="quality-yes" disabled={isSubmitting} />
                    <Label htmlFor="quality-yes" className="cursor-pointer">
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="quality-no" disabled={isSubmitting} />
                    <Label htmlFor="quality-no" className="cursor-pointer">
                      No
                    </Label>
                  </div>
                </RadioGroup>
                {dataQuality === "no" && (
                  <div className="mt-3">
                    <Label htmlFor="qualityIssues">
                      What could be improved? <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="qualityIssues"
                      value={dataQualityIssues}
                      onChange={(e) => setDataQualityIssues(e.target.value)}
                      placeholder="Describe data quality issues..."
                      rows={2}
                      className="mt-2"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Skip for Now
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Feedback"}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="py-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <h3 className="text-2xl mb-2">Feedback Submitted Successfully!</h3>
            <p className="text-muted-foreground">
              Your input helps us improve diagnostic accuracy. Thank you!
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}