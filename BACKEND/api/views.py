# api/views.py

from rest_framework import generics
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import (
    User, Patient, Clinician, Model, Clinicalguideline,
    Diagnosticcase, Diagnosticinput, Diagnosis, Recommendation
)
from .serializers import (
    UserSerializer, PatientSerializer, ClinicianSerializer, ModelSerializer,
    ClinicalGuidelineSerializer, DiagnosticCaseSerializer, DiagnosticInputSerializer,
    DiagnosisSerializer, RecommendationSerializer,
    ClinicianRegistrationSerializer,
    PatientRegistrationSerializer
)

# ==============================================================================
# Custom Views (Not Tied to Models)
# ==============================================================================

class RoleSelectionAPIView(APIView):
    """
    A custom API view to provide role information for the frontend selection screen.
    """
    def get(self, request, format=None):
        roles = [
            {
                "name": "Healthcare Professional",
                "description": "Access advanced diagnostic tools and patient management features",
                "path": "/healthcare/login",
                "icon": "Stethoscope"
            },
            {
                "name": "Patient",
                "description": "Upload your medical data and view your diagnostic results",
                "path": "/patient/login",
                "icon": "User"
            }
        ]
        return Response(roles)

# ==============================================================================
# Model-Based API Views
# ==============================================================================

# --- User Profiles ---
class UserListAPIView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class UserDetailAPIView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

# --- Patient Profiles ---
class PatientListAPIView(generics.ListAPIView):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer

class PatientDetailAPIView(generics.RetrieveAPIView):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer

# --- Clinician Profiles ---
class ClinicianListAPIView(generics.ListAPIView):
    queryset = Clinician.objects.all()
    serializer_class = ClinicianSerializer

class ClinicianDetailAPIView(generics.RetrieveAPIView):
    queryset = Clinician.objects.all()
    serializer_class = ClinicianSerializer

# --- Diagnostic Cases ---
class DiagnosticCaseListCreateAPIView(generics.ListCreateAPIView):
    queryset = Diagnosticcase.objects.all()
    serializer_class = DiagnosticCaseSerializer

class DiagnosticCaseDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Diagnosticcase.objects.all()
    serializer_class = DiagnosticCaseSerializer

# --- Diagnostic Inputs ---
class DiagnosticInputListCreateAPIView(generics.ListCreateAPIView):
    queryset = Diagnosticinput.objects.all()
    serializer_class = DiagnosticInputSerializer

class DiagnosticInputDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Diagnosticinput.objects.all()
    serializer_class = DiagnosticInputSerializer

# --- Diagnoses ---
class DiagnosisListCreateAPIView(generics.ListCreateAPIView):
    queryset = Diagnosis.objects.all()
    serializer_class = DiagnosisSerializer

class DiagnosisDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Diagnosis.objects.all()
    serializer_class = DiagnosisSerializer

# --- Recommendations ---
class RecommendationListCreateAPIView(generics.ListCreateAPIView):
    queryset = Recommendation.objects.all()
    serializer_class = RecommendationSerializer

class RecommendationDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Recommendation.objects.all()
    serializer_class = RecommendationSerializer

# --- AI/ML Models ---
class ModelListCreateAPIView(generics.ListCreateAPIView):
    queryset = Model.objects.all()
    serializer_class = ModelSerializer

class ModelDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Model.objects.all()
    serializer_class = ModelSerializer

# --- Clinical Guidelines ---
class ClinicalGuidelineListCreateAPIView(generics.ListCreateAPIView):
    queryset = Clinicalguideline.objects.all()
    serializer_class = ClinicalGuidelineSerializer

class ClinicalGuidelineDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Clinicalguideline.objects.all()
    serializer_class = ClinicalGuidelineSerializer

# ==============================================================================
# REGISTRATION VIEWS
# ==============================================================================

class ClinicianRegistrationAPIView(generics.CreateAPIView):
    """
    API endpoint for registering a new clinician.
    """
    queryset = Clinician.objects.all()
    serializer_class = ClinicianRegistrationSerializer
    permission_classes = []

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        data['clinician_data'] = {
            'role': data.get('role'),
            'department': data.get('department'),
            'medical_license_number': data.get('medical_license_number')
        }
        serializer = self.get_serializer(data=data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            print("\n>>> CLINICIAN REGISTRATION VALIDATION ERROR:", serializer.errors)
            print(">>> RAW DATA RECEIVED:", request.data)
            raise e
        self.perform_create(serializer)
        return Response(
            {"message": "Clinician registered successfully."},
            status=status.HTTP_201_CREATED
        )


class PatientRegistrationAPIView(generics.CreateAPIView):
    """
    API endpoint for registering a new patient.
    """
    queryset = Patient.objects.all()
    serializer_class = PatientRegistrationSerializer
    permission_classes = []

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        data['patient_data'] = {
            'phone_number': data.get('phone_number'),
            'address': data.get('address')
        }
        serializer = self.get_serializer(data=data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            print("\n>>> PATIENT REGISTRATION VALIDATION ERROR:", serializer.errors)
            print(">>> RAW DATA RECEIVED:", request.data)
            raise e
        self.perform_create(serializer)
        return Response(
            {"message": "Patient registered successfully."},
            status=status.HTTP_201_CREATED
        )