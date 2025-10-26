import { useState } from "react";
import { useNavigate } from "react-router-dom"; // 1. Import useNavigate
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Button } from "./ui/button";
import { ArrowLeft, Search, HelpCircle, FileQuestion } from "lucide-react";

// 2. Removed the props interface
export function PatientHelpSupport() {
  const navigate = useNavigate(); // 3. Initialize the navigate function
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          question: "How do I upload my medical data?",
          answer:
            "Navigate to your dashboard and click 'Upload Data'. You can drag and drop files or click to browse. Supported formats include JPEG, PNG, PDF, and DICOM for medical images, and PDF, DOC, TXT for clinical notes.",
        },
        {
          question: "What types of medical data can I upload?",
          answer:
            "You can upload three types of data: Medical Images (X-rays, MRI, CT scans), Clinical Notes (doctor's notes, consultation records), and Laboratory Results (blood tests, urinalysis).",
        },
        {
          question: "How long does analysis take?",
          answer:
            "Analysis typically takes 30-60 seconds depending on the amount and complexity of data uploaded. You'll receive results immediately after processing.",
        },
      ],
    },
    {
      category: "Understanding Results",
      questions: [
        {
          question: "What does the confidence score mean?",
          answer:
            "The confidence score (0-100%) indicates how certain our AI system is about the diagnosis based on the data provided. Scores above 90% indicate high confidence, 80-90% moderate confidence, and below 80% suggest additional testing may be needed.",
        },
        {
          question: "Should I trust the AI diagnosis?",
          answer:
            "Our AI provides diagnostic assistance and should NOT replace professional medical advice. Always consult with a qualified healthcare provider to discuss your results and create a treatment plan.",
        },
        {
          question: "Can I download my results?",
          answer:
            "Yes! You can download your complete diagnostic report as a PDF from the My Reports section. Click on any report and select 'Download PDF' to save it to your device.",
        },
      ],
    },
    {
      category: "Privacy & Security",
      questions: [
        {
          question: "Is my medical data secure?",
          answer:
            "Yes, we use 256-bit encryption and are fully HIPAA compliant. Your data is stored securely and only accessible to you. We never share your personal medical information without your explicit consent.",
        },
        {
          question: "Who can see my medical data?",
          answer:
            "Only you have access to your medical data. You can choose to share specific reports with your healthcare providers using the secure sharing feature.",
        },
        {
          question: "How long is my data stored?",
          answer:
            "Your data is stored securely for as long as you maintain your account. You can delete any data at any time from your account settings.",
        },
      ],
    },
    {
      category: "Account Management",
      questions: [
        {
          question: "How do I update my account information?",
          answer:
            "Go to Account Settings from the sidebar menu. You can update your personal information, change your password, and manage your preferences.",
        },
        {
          question: "Can I delete my account?",
          answer:
            "Yes, you can delete your account from Account Settings. Please note that this action is permanent and will remove all your data from our systems.",
        },
        {
          question: "I forgot my password. What should I do?",
          answer:
            "Click on 'Forgot Password' on the login page. Enter your email address, and we'll send you a link to reset your password.",
        },
      ],
    },
  ];

  const filteredFaqs = faqs.map((category) => ({
    ...category,
    questions: category.questions.filter(
      (q) =>
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
        
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl">Help & Support</h1>
            <p className="text-muted-foreground">
              Find answers to commonly asked questions
            </p>
          </div>
        </div>

        {/* Search */}
        <Card className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {/* FAQ Sections */}
        <div className="space-y-6">
          {filteredFaqs.length === 0 ? (
            <Card className="p-12 text-center">
              <FileQuestion className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl mb-2">No results found</h3>
              <p className="text-muted-foreground">
                Try searching with different keywords
              </p>
            </Card>
          ) : (
            filteredFaqs.map((category, idx) => (
              <Card key={idx} className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl">{category.category}</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((faq, qIdx) => (
                    <AccordionItem key={qIdx} value={`item-${idx}-${qIdx}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Card>
            ))
          )}
        </div>

        {/* User Guide Link */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg mb-1">Need more help?</h3>
              <p className="text-sm text-muted-foreground">
                Check out our comprehensive user guide for detailed instructions
              </p>
            </div>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
              View User Guide
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}