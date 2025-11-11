# api/views.py

from rest_framework import generics
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.conf import settings
from django.db import transaction
import requests
import json
import logging

logger = logging.getLogger(__name__)

from .models import (
    User, Patient, Clinician, Model, Clinicalguideline,
    Diagnosticcase, Diagnosticinput, Diagnosis, Recommendation
)
from .serializers import (
    UserSerializer, PatientSerializer, ClinicianSerializer, ModelSerializer,
    ClinicalGuidelineSerializer, DiagnosticCaseSerializer, DiagnosticInputSerializer,
    DiagnosisSerializer, RecommendationSerializer,
)
from .permissions import IsOwner


class RoleSelectionAPIView(APIView):
    """
    A public API view to provide role information for the frontend.
    """
    permission_classes = [AllowAny]
    
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
# REGISTRATION ENDPOINTS
# ==============================================================================

@api_view(['POST'])
@permission_classes([AllowAny])
def register_clinician(request):
    """
    Register a new clinician after Supabase auth succeeds.
    Expected data from frontend:
    {
        "id": "uuid-from-supabase",
        "first_name": "John",
        "last_name": "Doe",
        "gender": "male",
        "role": "doctor",
        "department": "Cardiology",
        "email": "john@example.com",
        "date_of_birth": "1990-01-01",
        "medical_license_number": "NPI1234567890"
    }
    """
    try:
        data = request.data
        logger.info(f"=== CLINICIAN REGISTRATION START ===")
        logger.info(f"Received data: {data}")
        
        # Validate required fields
        required_fields = [
            'id', 'first_name', 'last_name', 'gender', 'role', 
            'department', 'email', 'date_of_birth', 'medical_license_number'
        ]
        
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            logger.error(f"Missing required fields: {missing_fields}")
            return Response(
                {'error': f'Missing required fields: {", ".join(missing_fields)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user already exists
        if User.objects.filter(id=data['id']).exists():
            logger.warning(f"User with ID {data['id']} already exists")
            return Response(
                {'error': 'User already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check for duplicate email
        if User.objects.filter(email=data['email']).exists():
            logger.warning(f"User with email {data['email']} already exists")
            return Response(
                {'error': 'Email already registered'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Use transaction to ensure both User and Clinician are created together
        with transaction.atomic():
            logger.info(f"Creating User with ID: {data['id']}")
            
            # Create User record - try with minimal fields first
            try:
                user = User.objects.create(
                    id=data['id'],
                    supabase_user_id=data['id'],
                    first_name=data['first_name'],
                    last_name=data['last_name'],
                    gender=data['gender'],
                    role=data['role'],
                    email=data['email'],
                    date_of_birth=data['date_of_birth'],
                )
                logger.info(f"✓ User created successfully: {user.id}")
            except Exception as user_error:
                logger.error(f"✗ FAILED to create User: {type(user_error).__name__}: {str(user_error)}")
                raise
            
            # Create Clinician record
            try:
                logger.info(f"Creating Clinician for user: {user.id}")
                clinician = Clinician.objects.create(
                    id=user,  # This is a OneToOneField, so pass the user instance
                    role=data['role'],
                    department=data['department'],
                    medical_license_number=data['medical_license_number'],
                )
                logger.info(f"✓ Clinician created successfully: {clinician.id}")
            except Exception as clinician_error:
                logger.error(f"✗ FAILED to create Clinician: {type(clinician_error).__name__}: {str(clinician_error)}")
                raise
            
            logger.info(f"=== REGISTRATION SUCCESS: {user.email} ===")
        
        return Response(
            {
                'message': 'Clinician registered successfully',
                'user_id': str(user.id),
                'email': user.email
            },
            status=status.HTTP_201_CREATED
        )
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        logger.error(f"=== REGISTRATION FAILED ===")
        logger.error(f"Error Type: {type(e).__name__}")
        logger.error(f"Error Message: {str(e)}")
        logger.error(f"Full Traceback:\n{error_details}")
        
        return Response(
            {'error': f'Database error: {type(e).__name__}: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def register_patient(request):
    """
    Register a new patient after Supabase auth succeeds.
    Expected data from frontend:
    {
        "id": "uuid-from-supabase",
        "first_name": "Jane",
        "last_name": "Doe",
        "gender": "female",
        "email": "jane@example.com",
        "date_of_birth": "1995-05-15",
        "phone_number": "+1234567890",
        "address": "123 Main St"
    }
    """
    try:
        data = request.data
        logger.info(f"=== PATIENT REGISTRATION START ===")
        logger.info(f"Patient registration attempt for email: {data.get('email')}")
        logger.info(f"Received data: {data}")
        
        # Validate required fields
        required_fields = [
            'id', 'first_name', 'last_name', 'gender', 
            'email', 'date_of_birth', 'phone_number'
        ]
        
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            logger.error(f"Missing required fields: {missing_fields}")
            return Response(
                {'error': f'Missing required fields: {", ".join(missing_fields)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user already exists
        if User.objects.filter(id=data['id']).exists():
            logger.warning(f"User with ID {data['id']} already exists")
            return Response(
                {'error': 'User already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check for duplicate email
        if User.objects.filter(email=data['email']).exists():
            logger.warning(f"User with email {data['email']} already exists")
            return Response(
                {'error': 'Email already registered'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Use transaction to ensure both User and Patient are created together
        with transaction.atomic():
            logger.info(f"Creating User with ID: {data['id']}")
            
            # Create User record - FIXED: Added supabase_user_id
            try:
                user = User.objects.create(
                    id=data['id'],
                    supabase_user_id=data['id'],  # ✅ FIXED: This was missing!
                    first_name=data['first_name'],
                    last_name=data['last_name'],
                    gender=data['gender'],
                    role='patient',  # ✅ ADDED: Set role to 'patient'
                    email=data['email'],
                    date_of_birth=data['date_of_birth'],
                )
                logger.info(f"✓ User created successfully: {user.id}")
            except Exception as user_error:
                logger.error(f"✗ FAILED to create User: {type(user_error).__name__}: {str(user_error)}")
                raise
            
            # Create Patient record
            try:
                logger.info(f"Creating Patient for user: {user.id}")
                patient = Patient.objects.create(
                    id=user,  # This is a OneToOneField, so pass the user instance
                    phone_number=data['phone_number'],
                    address=data.get('address', ''),  # Optional field
                )
                logger.info(f"✓ Patient created successfully: {patient.id}")
            except Exception as patient_error:
                logger.error(f"✗ FAILED to create Patient: {type(patient_error).__name__}: {str(patient_error)}")
                raise
            
            logger.info(f"=== REGISTRATION SUCCESS: {user.email} ===")
        
        return Response(
            {
                'message': 'Patient registered successfully',
                'user_id': str(user.id),
                'email': user.email
            },
            status=status.HTTP_201_CREATED
        )
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        logger.error(f"=== REGISTRATION FAILED ===")
        logger.error(f"Error Type: {type(e).__name__}")
        logger.error(f"Error Message: {str(e)}")
        logger.error(f"Full Traceback:\n{error_details}")
        
        return Response(
            {'error': f'Database error: {type(e).__name__}: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ==============================================================================
# AI DIAGNOSIS
# ==============================================================================

class AIDiagnosisAPIView(APIView):
    """
    Accepts image and text input, forwards it to the AI inference service,
    and returns the AI's diagnosis.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        text_input = request.data.get('text_input', '')
        image_file = request.FILES.get('image', None)

        if not text_input and not image_file:
            return Response(
                {'error': 'Please provide text, an image, or both.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        ai_url = settings.AI_API_URL
        files = {}
        if image_file:
            files['image'] = (image_file.name, image_file.read(), image_file.content_type)

        data = {
            'question': text_input
        }

        try:
            response = requests.post(ai_url, data=data, files=files, timeout=180)
            response.raise_for_status()
            ai_response_data = response.json()
            json_string_from_ai = ai_response_data.get('result') 
            
            try:
                diagnosis_json = json.loads(json_string_from_ai)
                return Response(
                    {'diagnosis': diagnosis_json},
                    status=status.HTTP_200_OK
                )
            except json.JSONDecodeError as e:
                logger.error(f"AI returned malformed JSON: {e}", exc_info=True)
                return Response(
                    {'error': 'AI returned malformed data. Could not parse JSON.', 'raw_output': json_string_from_ai},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        except requests.exceptions.RequestException as e:
            return Response(
                {'error': f'The AI service returned an error: {e}'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception as e:
            return Response(
                {'error': f'An unexpected error occurred in the backend: {e}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ==============================================================================
# USER PROFILES
# ==============================================================================

class UserListAPIView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class UserDetailAPIView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsOwner]


class UserProfileMeAPIView(APIView):
    """
    API view to retrieve the profile of the currently authenticated user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        
        if hasattr(user, 'patient'):
            serializer = PatientSerializer(user.patient)
        elif hasattr(user, 'clinician'):
            serializer = ClinicianSerializer(user.clinician)
        else:
            return Response(
                {"error": "User has no patient or clinician profile."}, 
                status=status.HTTP_404_NOT_FOUND
            )
            
        return Response(serializer.data, status=status.HTTP_200_OK)


# ==============================================================================
# PATIENT PROFILES
# ==============================================================================

class PatientListAPIView(generics.ListAPIView):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer


class PatientDetailAPIView(generics.RetrieveAPIView):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [IsOwner]


# ==============================================================================
# CLINICIAN PROFILES
# ==============================================================================

class ClinicianListAPIView(generics.ListAPIView):
    queryset = Clinician.objects.all()
    serializer_class = ClinicianSerializer


class ClinicianDetailAPIView(generics.RetrieveAPIView):
    queryset = Clinician.objects.all()
    serializer_class = ClinicianSerializer
    permission_classes = [IsOwner]


# ==============================================================================
# DIAGNOSTIC CASES
# ==============================================================================

class DiagnosticCaseListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = DiagnosticCaseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Diagnosticcase.objects.filter(created_by=self.request.user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class DiagnosticCaseDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Diagnosticcase.objects.all()
    serializer_class = DiagnosticCaseSerializer


# ==============================================================================
# DIAGNOSTIC INPUTS
# ==============================================================================

class DiagnosticInputListCreateAPIView(generics.ListCreateAPIView):
    queryset = Diagnosticinput.objects.all()
    serializer_class = DiagnosticInputSerializer


class DiagnosticInputBulkCreateAPIView(generics.CreateAPIView):
    queryset = Diagnosticinput.objects.all()
    serializer_class = DiagnosticInputSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class DiagnosticInputDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Diagnosticinput.objects.all()
    serializer_class = DiagnosticInputSerializer


# ==============================================================================
# DIAGNOSES
# ==============================================================================

class DiagnosisListCreateAPIView(generics.ListCreateAPIView):
    queryset = Diagnosis.objects.all()
    serializer_class = DiagnosisSerializer


class DiagnosisDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Diagnosis.objects.all()
    serializer_class = DiagnosisSerializer


# ==============================================================================
# RECOMMENDATIONS
# ==============================================================================

class RecommendationListCreateAPIView(generics.ListCreateAPIView):
    queryset = Recommendation.objects.all()
    serializer_class = RecommendationSerializer


class RecommendationDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Recommendation.objects.all()
    serializer_class = RecommendationSerializer


# ==============================================================================
# AI/ML MODELS
# ==============================================================================

class ModelListCreateAPIView(generics.ListCreateAPIView):
    queryset = Model.objects.all()
    serializer_class = ModelSerializer


class ModelDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Model.objects.all()
    serializer_class = ModelSerializer


# ==============================================================================
# CLINICAL GUIDELINES
# ==============================================================================

class ClinicalGuidelineListCreateAPIView(generics.ListCreateAPIView):
    queryset = Clinicalguideline.objects.all()
    serializer_class = ClinicalGuidelineSerializer


class ClinicalGuidelineDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Clinicalguideline.objects.all()
    serializer_class = ClinicalGuidelineSerializer