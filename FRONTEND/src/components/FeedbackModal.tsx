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
import { Star, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackModal({ open, onOpenChange }: FeedbackModalProps) {
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

  const recommendations = [
    "Further testing",
    "Medication changes",
    "Lifestyle modifications",
    "Specialist referral",
    "Monitoring plan",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success("Feedback submitted successfully");
    setTimeout(() => {
      onOpenChange(false);
      // Reset form
      setTimeout(() => {
        setSubmitted(false);
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
      }, 300);
    }, 1500);
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

            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              {/* Diagnostic Accuracy */}
              <div className="space-y-3">
                <Label className="text-base">How accurate was this diagnosis?</Label>
                <StarRating value={accuracyStars} onChange={setAccuracyStars} />
                <RadioGroup value={accuracyCorrectness} onValueChange={setAccuracyCorrectness}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="correct" id="correct" />
                    <Label htmlFor="correct" className="cursor-pointer">
                      Correct
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="partial" id="partial" />
                    <Label htmlFor="partial" className="cursor-pointer">
                      Partially Correct
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="incorrect" id="incorrect" />
                    <Label htmlFor="incorrect" className="cursor-pointer">
                      Incorrect
                    </Label>
                  </div>
                </RadioGroup>
                {accuracyCorrectness === "incorrect" && (
                  <div className="mt-3">
                    <Label htmlFor="actualDiagnosis">What was the actual diagnosis?</Label>
                    <Input
                      id="actualDiagnosis"
                      value={actualDiagnosis}
                      onChange={(e) => setActualDiagnosis(e.target.value)}
                      placeholder="Enter the correct diagnosis"
                      className="mt-2"
                    />
                  </div>
                )}
              </div>

              {/* Confidence Score Assessment */}
              <div className="space-y-3">
                <Label className="text-base">Was the confidence score appropriate?</Label>
                <RadioGroup value={confidenceScore} onValueChange={setConfidenceScore}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="too-low" id="too-low" />
                    <Label htmlFor="too-low" className="cursor-pointer">
                      Too Low
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="appropriate" id="appropriate" />
                    <Label htmlFor="appropriate" className="cursor-pointer">
                      Appropriate
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="too-high" id="too-high" />
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
                    <RadioGroupItem value="yes" id="quality-yes" />
                    <Label htmlFor="quality-yes" className="cursor-pointer">
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="quality-no" />
                    <Label htmlFor="quality-no" className="cursor-pointer">
                      No
                    </Label>
                  </div>
                </RadioGroup>
                {dataQuality === "no" && (
                  <div className="mt-3">
                    <Label htmlFor="qualityIssues">What could be improved?</Label>
                    <Textarea
                      id="qualityIssues"
                      value={dataQualityIssues}
                      onChange={(e) => setDataQualityIssues(e.target.value)}
                      placeholder="Describe data quality issues..."
                      rows={2}
                      className="mt-2"
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
                >
                  Skip for Now
                </Button>
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
                  Submit Feedback
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
