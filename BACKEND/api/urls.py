# api/urls.py

from django.urls import path
from . import views
from .views import (
    FeedbackSubmitAPIView,
    FeedbackDetailAPIView,
    FeedbackListAPIView,
    FeedbackStatsAPIView,
    DiagnosisFeedbackListAPIView,
    DiagnosisDetailAPIView
)

urlpatterns = [
    
    path('roles/', views.RoleSelectionAPIView.as_view(), name='role-selection'),
    path('diagnose/', views.AIDiagnosisAPIView.as_view(), name='ai-diagnose'),
    path('users/', views.UserListAPIView.as_view(), name='user-list'),
    path('users/<uuid:pk>/', views.UserDetailAPIView.as_view(), name='user-detail'),
    path('patients/', views.PatientListAPIView.as_view(), name='patient-list'),
    path('patients/<uuid:pk>/', views.PatientDetailAPIView.as_view(), name='patient-detail'),

 
    path('clinicians/', views.ClinicianListAPIView.as_view(), name='clinician-list'),
    path('clinicians/<uuid:pk>/', views.ClinicianDetailAPIView.as_view(), name='clinician-detail'),
    path('cases/', views.DiagnosticCaseListCreateAPIView.as_view(), name='case-list-create'),
    path('cases/<uuid:pk>/', views.DiagnosticCaseDetailAPIView.as_view(), name='case-detail'),
    path('inputs/', views.DiagnosticInputListCreateAPIView.as_view(), name='input-list-create'),
    path('inputs/<uuid:pk>/', views.DiagnosticInputDetailAPIView.as_view(), name='input-detail'),
    path('diagnoses/', views.DiagnosisListCreateAPIView.as_view(), name='diagnosis-list-create'),
    path('diagnoses/<uuid:pk>/', views.DiagnosisDetailAPIView.as_view(), name='diagnosis-detail'),
    path('recommendations/', views.RecommendationListCreateAPIView.as_view(), name='recommendation-list-create'),
    path('recommendations/<uuid:pk>/', views.RecommendationDetailAPIView.as_view(), name='recommendation-detail'),
    path('models/', views.ModelListCreateAPIView.as_view(), name='model-list-create'),
    path('models/<uuid:pk>/', views.ModelDetailAPIView.as_view(), name='model-detail'),
    path('guidelines/', views.ClinicalGuidelineListCreateAPIView.as_view(), name='guideline-list-create'),
    path('guidelines/<uuid:pk>/', views.ClinicalGuidelineDetailAPIView.as_view(), name='guideline-detail'),
    
    
    path('register/clinician/', views.register_clinician, name='clinician-register'),
    path('register/patient/', views.register_patient, name='patient-register'),
    
    path('inputs/bulk-create/', views.DiagnosticInputBulkCreateAPIView.as_view(), name='input-bulk-create'),
    path('profile/me/', views.UserProfileMeAPIView.as_view(), name='user-profile-me'),
    path('feedback/submit/', FeedbackSubmitAPIView.as_view(), name='feedback-submit'),
    path('feedback/<uuid:diagnosis_id>/', FeedbackDetailAPIView.as_view(), name='feedback-detail'),
    path('feedback/', FeedbackListAPIView.as_view(), name='feedback-list'),
    path('feedback/stats/', FeedbackStatsAPIView.as_view(), name='feedback-stats'),
    path('diagnoses/with-feedback/', DiagnosisFeedbackListAPIView.as_view(), name='diagnosis-feedback-list'),
    path('diagnoses/<uuid:pk>/', DiagnosisDetailAPIView.as_view(), name='diagnosis-detail'),
    path('cases/', views.CaseComparisonListAPIView.as_view(), name='case-comparison-list'),
    path('cases/details/', views.CaseComparisonDetailAPIView.as_view(), name='case-comparison-details'),
    
]