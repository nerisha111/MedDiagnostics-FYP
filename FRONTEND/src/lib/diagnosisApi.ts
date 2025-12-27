interface RecommendationInput {
  test_name?: string;
  treatment_name?: string;
  name?: string;
  category?: string;
  rationale?: string;
  description?: string;
}

interface AIResponse {
  primaryDiagnosis?: {
    name: string;
    confidence: number;
    description?: string;
  };
  recommendedTests?: RecommendationInput[];
  recommendedTreatments?: RecommendationInput[];
}

interface SaveDiagnosisPayload {
  case_id: string;
  diagnosis: {
    name: string;
    confidence: number;
    description: string;
  };
  recommendations: Array<{
    name: string;
    category: string;
    type: string;
    description: string;
  }>;
}

export async function saveDiagnosisToDatabase(
  caseId: string,
  aiResponse: AIResponse,
  accessToken: string
): Promise<{ diagnosis_id: string; recommendations_count: number }> {
  
  // Extract and format recommendations from AI response
  const extractedRecommendations: Array<{
    name: string;
    category: string;
    type: string;
    description: string;
  }> = [];
  
  // Process recommended tests
  if (aiResponse.recommendedTests && Array.isArray(aiResponse.recommendedTests)) {
    for (const test of aiResponse.recommendedTests) {
      const testName = test.test_name || test.name;
      if (testName && testName.trim() !== '' && !testName.includes('NOT NULL')) {
        extractedRecommendations.push({
          name: testName.trim(),
          category: test.category || 'Diagnostic',
          type: 'Test',
          description: test.rationale || test.description || ''
        });
      }
    }
  }
  
  // Process recommended treatments
  if (aiResponse.recommendedTreatments && Array.isArray(aiResponse.recommendedTreatments)) {
    for (const treatment of aiResponse.recommendedTreatments) {
      const treatmentName = treatment.treatment_name || treatment.name;
      if (treatmentName && treatmentName.trim() !== '' && !treatmentName.includes('NOT NULL')) {
        extractedRecommendations.push({
          name: treatmentName.trim(),
          category: treatment.category || 'Treatment',
          type: 'Medication',
          description: treatment.description || ''
        });
      }
    }
  }
  
  // Build the payload
  const payload: SaveDiagnosisPayload = {
    case_id: caseId,
    diagnosis: {
      name: aiResponse.primaryDiagnosis?.name || 'Unknown Diagnosis',
      confidence: aiResponse.primaryDiagnosis?.confidence || 0,
      description: aiResponse.primaryDiagnosis?.description || ''
    },
    recommendations: extractedRecommendations
  };
  
  console.log(' Saving diagnosis to database:', payload);
  
  // Make the API call
  const response = await fetch(`/api/diagnoses/save-complete/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP ${response.status}: Failed to save diagnosis`);
  }
  
  const result = await response.json();
  console.log('Diagnosis saved successfully:', result);
  
  return result;
}