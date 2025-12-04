# api/urls.py

from django.urls import path
from . import views
from .views import (
    FeedbackSubmitAPIView,
    FeedbackDetailAPIView,
    FeedbackListAPIView,
    FeedbackStatsAPIView,
    DiagnosisFeedbackListAPIView,
    DiagnosisDetailAPIView,
    CaseComparisonListAPIView,
    CaseComparisonDetailAPIView,
    PatientActivityHistoryAPIView,
    PatientActivityStatsAPIView,
    PatientReportDetailAPIView,
    PatientReportsListAPIView
)

urlpatterns = [
    # ==================================================================================
    # ROLE SELECTION & AUTH
    # ==================================================================================
    path('roles/', views.RoleSelectionAPIView.as_view(), name='role-selection'),
    
    # ==================================================================================
    # REGISTRATION
    # ==================================================================================
    path('register/clinician/', views.register_clinician, name='clinician-register'),
    path('register/patient/', views.register_patient, name='patient-register'),
    
    # ==================================================================================
    # AI DIAGNOSIS
    # ==================================================================================
    path('diagnose/', views.AIDiagnosisAPIView.as_view(), name='ai-diagnose'),
    
    # ==================================================================================
    # USERS & PROFILES
    # ==================================================================================
    path('users/', views.UserListAPIView.as_view(), name='user-list'),
    path('users/<uuid:pk>/', views.UserDetailAPIView.as_view(), name='user-detail'),
    path('profile/me/', views.UserProfileMeAPIView.as_view(), name='user-profile-me'),
    
    # ==================================================================================
    # PATIENTS 
    # ==================================================================================
    path('patient/activity/history/', PatientActivityHistoryAPIView.as_view(), name='patient-activity-history'),
    path('patient/activity/stats/', PatientActivityStatsAPIView.as_view(), name='patient-activity-stats'),
    path('patients/reports/', PatientReportsListAPIView.as_view(), name='patient-reports-list'),
    path('patients/reports/<uuid:diagnosis_id>/', PatientReportDetailAPIView.as_view(), name='patient-report-detail'),
    
    # Generic patient routes AFTER specific ones
    path('patients/', views.PatientListAPIView.as_view(), name='patient-list'),
    path('patients/<uuid:pk>/', views.PatientDetailAPIView.as_view(), name='patient-detail'),
    
    # ==================================================================================
    # CLINICIANS
    # ==================================================================================
    path('clinicians/', views.ClinicianListAPIView.as_view(), name='clinician-list'),
    path('clinicians/<uuid:pk>/', views.ClinicianDetailAPIView.as_view(), name='clinician-detail'),
    
    # ==================================================================================
    # DIAGNOSTIC CASES (Main endpoints for creating/managing cases)
    # ==================================================================================
    path('cases/', views.DiagnosticCaseListCreateAPIView.as_view(), name='case-list-create'),
    path('cases/<uuid:pk>/', views.DiagnosticCaseDetailAPIView.as_view(), name='case-detail'),
    
    # ==================================================================================
    # CASE COMPARISON TOOL (Separate endpoints to avoid conflicts)
    # ==================================================================================
    path('cases/comparison/list/', CaseComparisonListAPIView.as_view(), name='case-comparison-list'),
    path('cases/comparison/details/', CaseComparisonDetailAPIView.as_view(), name='case-comparison-details'),
    
    # ==================================================================================
    # DIAGNOSTIC INPUTS
    # ==================================================================================
    path('inputs/', views.DiagnosticInputListCreateAPIView.as_view(), name='input-list-create'),
    path('inputs/bulk-create/', views.DiagnosticInputBulkCreateAPIView.as_view(), name='input-bulk-create'),
    path('inputs/<uuid:pk>/', views.DiagnosticInputDetailAPIView.as_view(), name='input-detail'),
    
    # ==================================================================================
    # DIAGNOSES (More specific routes BEFORE generic <uuid:pk> route)
    # ==================================================================================
    path('diagnoses/', views.DiagnosisListCreateAPIView.as_view(), name='diagnosis-list-create'),
    path('diagnoses/with-feedback/', DiagnosisFeedbackListAPIView.as_view(), name='diagnosis-feedback-list'),
    path('diagnoses/<uuid:pk>/', DiagnosisDetailAPIView.as_view(), name='diagnosis-detail'),
    path('diagnoses/save-complete/', views.SaveDiagnosisWithRecommendationsAPIView.as_view(), name='save-complete-diagnosis'),
    
    # ==================================================================================
    # RECOMMENDATIONS
    # ==================================================================================
    path('recommendations/', views.RecommendationListCreateAPIView.as_view(), name='recommendation-list-create'),
    path('recommendations/<uuid:pk>/', views.RecommendationDetailAPIView.as_view(), name='recommendation-detail'),
    
    # ==================================================================================
    # AI/ML MODELS
    # ==================================================================================
    path('models/', views.ModelListCreateAPIView.as_view(), name='model-list-create'),
    path('models/<uuid:pk>/', views.ModelDetailAPIView.as_view(), name='model-detail'),
    
    # ==================================================================================
    # CLINICAL GUIDELINES
    # ==================================================================================
    path('guidelines/', views.ClinicalGuidelineListCreateAPIView.as_view(), name='guideline-list-create'),
    path('guidelines/<uuid:pk>/', views.ClinicalGuidelineDetailAPIView.as_view(), name='guideline-detail'),
    
    # ==================================================================================
    # FEEDBACK (Specific routes BEFORE generic parameter routes)
    # ==================================================================================
    path('feedback/', FeedbackListAPIView.as_view(), name='feedback-list'),
    path('feedback/stats/', FeedbackStatsAPIView.as_view(), name='feedback-stats'),
    path('feedback/submit/', FeedbackSubmitAPIView.as_view(), name='feedback-submit'),
    path('feedback/diagnosis/<uuid:diagnosis_id>/', FeedbackDetailAPIView.as_view(), name='feedback-detail'),
]