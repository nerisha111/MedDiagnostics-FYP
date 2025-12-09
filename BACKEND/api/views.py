# api/views.py

import re
import uuid
from rest_framework import generics
from rest_framework import status
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.conf import settings
from django.db import transaction
import requests
import json
import logging
from datetime import datetime, timedelta
from django.db.models import Count, Q

logger = logging.getLogger(__name__)

from .models import (
    User, Patient, Clinician, Model, Clinicalguideline,
    Diagnosticcase, Diagnosticinput, Diagnosis, Recommendation, Feedback
)
from .serializers import (
    UserSerializer, PatientSerializer, ClinicianSerializer, ModelSerializer,
    ClinicalGuidelineSerializer, DiagnosticCaseSerializer, DiagnosticInputSerializer,
    DiagnosisSerializer, RecommendationSerializer, FeedbackSerializer, FeedbackCreateSerializer, DiagnosisWithFeedbackSerializer,DiagnosisDetailSerializer, CaseComparisonListSerializer, CaseComparisonDetailSerializer

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
                {'error': 'This email is already registered. Please use a different email or login.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check for duplicate medical license number BEFORE creating user
        if Clinician.objects.filter(medical_license_number=data['medical_license_number']).exists():
            logger.warning(f"Medical license number {data['medical_license_number']} already exists")
            return Response(
                {'error': 'This medical license number is already registered. Each healthcare professional must have a unique license number.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Use transaction to ensure both User and Clinician are created together
        with transaction.atomic():
            logger.info(f"Creating User with ID: {data['id']}")
            
            # Create User record with 'clinician' as the role
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
                logger.error(f"User data that failed: {data}")
                raise
            
            
            try:
                logger.info(f"Creating Clinician for user: {user.id}")
                clinician = Clinician.objects.create(
                    id=user,  
                    role=data['role'],  
                    department=data['department'],
                    medical_license_number=data['medical_license_number'],
                )
                logger.info(f"✓ Clinician created successfully: {clinician.id}")
            except Exception as clinician_error:
                logger.error(f"✗ FAILED to create Clinician: {type(clinician_error).__name__}: {str(clinician_error)}")
                logger.error(f"Clinician data that failed: role={data['role']}, dept={data['department']}, license={data['medical_license_number']}")
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
        
        # Provide user-friendly error messages
        error_message = 'Database registration failed. Please contact support.'
        
        if 'duplicate key' in str(e).lower():
            if 'email' in str(e).lower():
                error_message = 'This email is already registered. Please use a different email or login.'
            elif 'medical_license_number' in str(e).lower():
                error_message = 'This medical license number is already registered. Each healthcare professional must have a unique license number.'
            else:
                error_message = 'A record with this information already exists. Please check your details.'
        
        return Response(
            {'error': error_message},
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
        
        
        if User.objects.filter(id=data['id']).exists():
            logger.warning(f"User with ID {data['id']} already exists")
            return Response(
                {'error': 'User already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        
        if User.objects.filter(email=data['email']).exists():
            logger.warning(f"User with email {data['email']} already exists")
            return Response(
                {'error': 'Email already registered'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        
        with transaction.atomic():
            logger.info(f"Creating User with ID: {data['id']}")
            
            
            try:
                user = User.objects.create(
                    id=data['id'],
                    supabase_user_id=data['id'],  
                    first_name=data['first_name'],
                    last_name=data['last_name'],
                    gender=data['gender'],
                    role='patient', 
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
        return Diagnosticcase.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        
        logger.info(f"=== CREATING DIAGNOSTIC CASE ===")
        logger.info(f"User: {self.request.user.email}")
        logger.info(f"Data received: {self.request.data}")
        
        instance = serializer.save(user=self.request.user)
          
        logger.info(f"Case created with ID: {instance.id}")
        logger.info(f"Chief Complaint saved: {instance.chief_complaint}")
        logger.info(f"Description saved: {instance.description}")
        logger.info(f"Profile Info saved: {instance.profile_info}")

class DiagnosticCaseDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
   
    serializer_class = DiagnosticCaseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Diagnosticcase.objects.filter(user=self.request.user)


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
    
    serializer_class = DiagnosisSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Diagnosis.objects.filter(diagnostic_case__user=self.request.user)


class DiagnosisDetailAPIView(generics.RetrieveAPIView):
    """
    Retrieves the full details of a single diagnosis.
    """
    serializer_class = DiagnosisDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        
        return Diagnosis.objects.filter(
            diagnostic_case__user=self.request.user
        ).select_related(
            'diagnostic_case'
        ).prefetch_related(
            'diagnostic_case__inputs',  
            'recommendations'
        )


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

# ==============================================================================
# FEEDBACK
# ==============================================================================
class FeedbackSubmitAPIView(APIView):
    """
    API view for submitting feedback on a diagnosis.
    This will:
    1. Create a Feedback record
    2. Update the Diagnosis table's is_reviewed and clinician_comment fields
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            diagnosis_id = request.data.get('diagnosis')
            
            if not diagnosis_id:
                return Response(
                    {'error': 'diagnosis field is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if diagnosis exists
            try:
                diagnosis = Diagnosis.objects.get(id=diagnosis_id)
            except Diagnosis.DoesNotExist:
                return Response(
                    {'error': f'Diagnosis with id {diagnosis_id} does not exist'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Check if feedback already exists for this diagnosis
            if Feedback.objects.filter(diagnosis=diagnosis).exists():
                return Response(
                    {'error': 'Feedback already exists for this diagnosis. Use PUT to update.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create feedback
            serializer = FeedbackCreateSerializer(data=request.data)
            if serializer.is_valid():
                with transaction.atomic():
                    # Save feedback with current user as clinician
                    feedback = serializer.save(clinician=request.user)
                    
                    # Update the Diagnosis table
                    diagnosis.is_reviewed = True
                    diagnosis.date_reviewed = timezone.now().date()
                    
                    # Update clinician_comment with general_comments if provided
                    if request.data.get('general_comments'):
                        diagnosis.clinician_comment = request.data.get('general_comments')
                    
                    diagnosis.save()
                    
                    logger.info(f"Feedback submitted for diagnosis {diagnosis_id} by {request.user.email}")
                
                # Return the complete feedback object
                response_serializer = FeedbackSerializer(feedback)
                return Response(
                    {
                        'message': 'Feedback submitted successfully',
                        'feedback': response_serializer.data
                    },
                    status=status.HTTP_201_CREATED
                )
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Error submitting feedback: {str(e)}", exc_info=True)
            return Response(
                {'error': f'An error occurred: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class FeedbackDetailAPIView(APIView):
    """
    Retrieve, update, or delete feedback for a specific diagnosis.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, diagnosis_id, *args, **kwargs):
        """Get feedback for a specific diagnosis"""
        try:
            feedback = Feedback.objects.get(diagnosis_id=diagnosis_id)
            serializer = FeedbackSerializer(feedback)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Feedback.DoesNotExist:
            return Response(
                {'error': 'Feedback not found for this diagnosis'},
                status=status.HTTP_404_NOT_FOUND
            )

    def put(self, request, diagnosis_id, *args, **kwargs):
        """Update existing feedback"""
        try:
            feedback = Feedback.objects.get(diagnosis_id=diagnosis_id)
            
            # Check if the current user is the one who submitted the feedback
            if feedback.clinician != request.user:
                return Response(
                    {'error': 'You can only update your own feedback'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            serializer = FeedbackCreateSerializer(feedback, data=request.data, partial=True)
            if serializer.is_valid():
                with transaction.atomic():
                    updated_feedback = serializer.save()
                    
                    # Update diagnosis if general_comments changed
                    if 'general_comments' in request.data:
                        diagnosis = Diagnosis.objects.get(id=diagnosis_id)
                        diagnosis.clinician_comment = request.data['general_comments']
                        diagnosis.save()
                    
                    logger.info(f"Feedback updated for diagnosis {diagnosis_id} by {request.user.email}")
                
                response_serializer = FeedbackSerializer(updated_feedback)
                return Response(
                    {
                        'message': 'Feedback updated successfully',
                        'feedback': response_serializer.data
                    },
                    status=status.HTTP_200_OK
                )
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
        except Feedback.DoesNotExist:
            return Response(
                {'error': 'Feedback not found for this diagnosis'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error updating feedback: {str(e)}", exc_info=True)
            return Response(
                {'error': f'An error occurred: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def delete(self, request, diagnosis_id, *args, **kwargs):
        """Delete feedback"""
        try:
            feedback = Feedback.objects.get(diagnosis_id=diagnosis_id)
            
            # Check if the current user is the one who submitted the feedback
            if feedback.clinician != request.user:
                return Response(
                    {'error': 'You can only delete your own feedback'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            with transaction.atomic():
                # Update diagnosis before deleting feedback
                diagnosis = Diagnosis.objects.get(id=diagnosis_id)
                diagnosis.is_reviewed = False
                diagnosis.clinician_comment = None
                diagnosis.date_reviewed = None
                diagnosis.save()
                
                feedback.delete()
                logger.info(f"Feedback deleted for diagnosis {diagnosis_id} by {request.user.email}")
            
            return Response(
                {'message': 'Feedback deleted successfully'},
                status=status.HTTP_204_NO_CONTENT
            )
                
        except Feedback.DoesNotExist:
            return Response(
                {'error': 'Feedback not found for this diagnosis'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error deleting feedback: {str(e)}", exc_info=True)
            return Response(
                {'error': f'An error occurred: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class FeedbackListAPIView(generics.ListAPIView):
    """
    List all feedback submitted by the authenticated clinician.
    """
    serializer_class = FeedbackSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Feedback.objects.filter(clinician=self.request.user)


class FeedbackStatsAPIView(APIView):
    """
    Get feedback statistics for the authenticated clinician.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            feedback_queryset = Feedback.objects.filter(clinician=request.user)
            
            total_feedback = feedback_queryset.count()
            
            if total_feedback == 0:
                return Response({
                    'total_feedback': 0,
                    'message': 'No feedback submitted yet'
                }, status=status.HTTP_200_OK)
            
            # Calculate statistics
            from django.db.models import Avg, Count
            
            stats = {
                'total_feedback': total_feedback,
                'average_accuracy_stars': feedback_queryset.aggregate(
                    avg=Avg('accuracy_stars')
                )['avg'],
                'average_next_steps_rating': feedback_queryset.aggregate(
                    avg=Avg('next_steps_rating')
                )['avg'],
                'accuracy_distribution': feedback_queryset.values('accuracy_correctness').annotate(
                    count=Count('id')
                ),
                'confidence_assessment_distribution': feedback_queryset.values('confidence_score_assessment').annotate(
                    count=Count('id')
                ),
                'data_quality_distribution': feedback_queryset.values('data_quality').annotate(
                    count=Count('id')
                ),
            }
            
            return Response(stats, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching feedback stats: {str(e)}", exc_info=True)
            return Response(
                {'error': f'An error occurred: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
class DiagnosisFeedbackListAPIView(generics.ListAPIView):
    """
    Lists all diagnoses for the authenticated clinician,
    annotated with their feedback status.
    """
    serializer_class = DiagnosisWithFeedbackSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Diagnosis.objects.filter(
            diagnostic_case__user=self.request.user
        ).prefetch_related('feedback').order_by('-diagnosis_date')
    
class DiagnosisDetailAPIView(generics.RetrieveAPIView):
    """
    Retrieves the full details of a single diagnosis.
    """
    queryset = Diagnosis.objects.all()
    serializer_class = DiagnosisDetailSerializer
    permission_classes = [IsAuthenticated]

class CaseComparisonListAPIView(generics.ListAPIView):
    """
    Provides a simplified list of all diagnostic cases for selection
    in the comparison tool.
    """
    
    serializer_class = CaseComparisonListSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return Diagnosticcase.objects.filter(user=self.request.user).prefetch_related('diagnoses')


class CaseComparisonDetailAPIView(APIView):
    """
    Provides detailed data for a list of specified case IDs.
    Accepts a comma-separated list of IDs in a query parameter, e.g.,
    /api/cases/details/?ids=<uuid1>,<uuid2>
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        case_ids_str = request.query_params.get('ids', '')
        if not case_ids_str:
            return Response(
                {"error": "Please provide one or more case IDs in the 'ids' query parameter."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            
            case_ids = [uuid.UUID(id_str.strip()) for id_str in case_ids_str.split(',') if id_str.strip()]
        except ValueError:
            return Response(
                {"error": "Invalid UUID format provided in the 'ids' parameter."},
                status=status.HTTP_400_BAD_REQUEST
            )

        queryset = Diagnosticcase.objects.filter(id__in=case_ids).prefetch_related(
            'diagnoses__recommendations'
        )

        if not queryset.exists():
            return Response({}, status=status.HTTP_200_OK)

        serializer = CaseComparisonDetailSerializer(queryset, many=True)

        
        response_data = {str(case['id']): case for case in serializer.data}

        return Response(response_data, status=status.HTTP_200_OK)

class PatientReportsListAPIView(APIView):
    """
    Lists all diagnostic cases with their diagnoses for the authenticated patient.
    Returns data formatted for the patient reports page.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        try:
            if not request.user or not request.user.is_authenticated:
                return Response(
                    {'error': 'Authentication required'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            
            cases = Diagnosticcase.objects.filter(
                user=request.user
            ).prefetch_related(
                'diagnoses',
                'inputs'
            ).order_by('-created_at')
            
            reports_data = []
            
            for case in cases:
                # Double-check case belongs to this user (extra safety)
                if case.user.id != request.user.id:
                    logger.warning(f"Skipping case {case.id} - does not belong to user {request.user.id}")
                    continue
                
                # Get the primary diagnosis (most recent or highest confidence)
                primary_diagnosis = case.diagnoses.order_by('-confidence', '-diagnosis_date').first()
                
                if not primary_diagnosis:
                    # Case with no diagnosis yet (still processing)
                    reports_data.append({
                        'id': str(case.id),
                        'case_id': str(case.id),
                        'type': 'Diagnostic Analysis',
                        'diagnosis': 'Processing...',
                        'date': case.created_at.strftime('%Y-%m-%d'),
                        'status': 'processing',
                        'confidence': 0,
                        'dataSources': self._get_data_sources(case),
                        'diagnosis_id': None
                    })
                else:
                    # Determine report type based on case history FOR THIS USER
                    case_count = Diagnosticcase.objects.filter(
                        user=request.user,
                        created_at__lte=case.created_at
                    ).count()
                    
                    if case_count == 1:
                        report_type = 'Initial Screening'
                    elif case_count == 2:
                        report_type = 'Diagnostic Analysis'
                    else:
                        report_type = 'Follow-up Analysis'
                    
                    report_status = 'complete'
                    
                    reports_data.append({
                        'id': f"RPT-{case.created_at.strftime('%Y')}-{str(case.id)[:8]}",
                        'case_id': str(case.id),
                        'type': report_type,
                        'diagnosis': primary_diagnosis.name or 'Diagnosis Pending',
                        'date': primary_diagnosis.diagnosis_date.strftime('%Y-%m-%d') if primary_diagnosis.diagnosis_date else case.created_at.strftime('%Y-%m-%d'),
                        'status': report_status,
                        'confidence': int(primary_diagnosis.confidence) if primary_diagnosis.confidence else 0,
                        'dataSources': self._get_data_sources(case),
                        'diagnosis_id': str(primary_diagnosis.id),
                        'description': primary_diagnosis.clinician_comment or '',
                    })
            
            logger.info(f"Returning {len(reports_data)} reports for user {request.user.email}")
            return Response(reports_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching patient reports: {str(e)}", exc_info=True)
            return Response(
                {'error': f'An error occurred: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _get_data_sources(self, case):
        """Extract unique data source types from case inputs"""
        inputs = case.inputs.all()
        sources = set()
        
        for input_obj in inputs:
            input_type = input_obj.input_type
            if input_type:
                # Map input types to display categories
                if input_type in ['images', 'image']:
                    sources.add('images')
                elif input_type in ['labs', 'lab']:
                    sources.add('labs')
                elif input_type in ['notes', 'note', 'clinical_notes']:
                    sources.add('notes')
                elif input_type in ['genetic', 'genomic']:
                    sources.add('genetic')
        
        return list(sources) if sources else ['notes']


# In api/views.py

# In api/views.py

class PatientReportDetailAPIView(APIView):
    """
    Get detailed information for a specific report/diagnosis.
    """
    permission_classes = [IsAuthenticated]
    
    def extract_chief_complaint(self, case_obj):
        """
        Permissive extraction: 
        1. Checks 'chief_complaint' column.
        2. Checks 'description' column (and attempts to clean it, but returns it regardless).
        3. Checks Inputs.
        """
        bad_values = ['not specified', 'null', 'none', '', 'no description recorded', 'general consultation']

        # --- 1. Check the specific 'chief_complaint' DB column ---
        if hasattr(case_obj, 'chief_complaint') and case_obj.chief_complaint:
            val = str(case_obj.chief_complaint).strip()
            if val and val.lower() not in bad_values:
                return val
        
        # --- 2. Check the 'description' column ---
        if case_obj.description:
            val = str(case_obj.description).strip()
            
            if val and val.lower() not in bad_values:
                # A. Clean up "Chief Complaint:" prefix if it exists
                import re
                start_match = re.search(r'chief complaint:', val, re.IGNORECASE)
                if start_match:
                    val = val[start_match.end():].strip()
                
                # B. Cut off at "Medical History" or "Patient ID"
                stop_markers = ['medical history', 'patient id', 'history:']
                for marker in stop_markers:
                    stop_match = re.search(marker, val, re.IGNORECASE)
                    if stop_match:
                        val = val[:stop_match.start()].strip()
                        break
                
                # C. Return whatever is left (Even if it didn't start with "Chief Complaint")
                if val: 
                    return val

        # --- 3. Check Inputs ---
        if hasattr(case_obj, 'inputs'):
            for input_obj in case_obj.inputs.all():
                if input_obj.description:
                    val = str(input_obj.description).strip()
                    if val and val.lower() not in bad_values:
                        return val

        # --- 4. Check JSON Profile ---
        if case_obj.profile_info and isinstance(case_obj.profile_info, dict):
            for key in ['chief_complaint', 'complaint', 'symptoms']:
                if key in case_obj.profile_info:
                    val = case_obj.profile_info[key]
                    if isinstance(val, list): val = ", ".join([str(v) for v in val])
                    val = str(val).strip()
                    if val and val.lower() not in bad_values:
                        return val
            
        return "No chief complaint recorded."
  
    def get(self, request, diagnosis_id, *args, **kwargs):
        try:
            if not request.user or not request.user.is_authenticated:
                return Response(
                    {'error': 'Authentication required'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Fetch diagnosis with related data
            diagnosis = Diagnosis.objects.select_related(
                'diagnostic_case__user'
            ).prefetch_related(
                'diagnostic_case__inputs',  
                'recommendations'
            ).get(id=diagnosis_id)
            
            # Security check
            if diagnosis.diagnostic_case.user.id != request.user.id:
                return Response(
                    {'error': 'You do not have permission to view this report'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            case = diagnosis.diagnostic_case
            
            # Extract the complaint using the new logic
            complaint_text = self.extract_chief_complaint(case)
            
            # Get data sources
            inputs = case.inputs.all()
            data_sources = list(set([inp.input_type for inp in inputs if inp.input_type]))
            
            # Get recommendations
            recommendations = diagnosis.recommendations.all()
            next_steps = [
                {
                    'category': rec.category or rec.type or 'General',
                    'action': rec.name or rec.description or 'No description'
                }
                for rec in recommendations
            ]
            
            # Build response
            report_detail = {
                'id': str(diagnosis.id),
                'case_id': str(case.id),
                'diagnosis': diagnosis.name,
                'chief_complaint': complaint_text,
                'confidence': int(diagnosis.confidence) if diagnosis.confidence else 0,
                'date': diagnosis.diagnosis_date.strftime('%Y-%m-%d') if diagnosis.diagnosis_date else case.created_at.strftime('%Y-%m-%d'),
                'description': diagnosis.clinician_comment or 'No description available',
                'status': 'reviewed' if diagnosis.is_reviewed else 'complete',
                'dataSources': data_sources,
                'findings': self._extract_findings(diagnosis.clinician_comment),
                'nextSteps': next_steps or [
                    {
                        'category': 'Follow-up',
                        'action': 'Consult with your healthcare provider'
                    }
                ],
                'profile_info': case.profile_info or {}
            }
            
            return Response(report_detail, status=status.HTTP_200_OK)
            
        except Diagnosis.DoesNotExist:
            return Response({'error': 'Report not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"✗ Error fetching report detail: {str(e)}", exc_info=True)
            return Response(
                {'error': f'An error occurred: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _extract_findings(self, description):
        """Extract findings from clinician comments"""
        if not description:
            return ["Detailed findings documented in comprehensive clinical assessment"]
        
        sentences = [s.strip() for s in description.replace('\n', '. ').split('.') if s.strip()]
        return sentences[:5] if sentences else ["No specific findings documented"]

class PatientActivityHistoryAPIView(APIView):

    permission_classes = [IsAuthenticated]
    def get(self, request, *args, **kwargs):
        try:
            user = request.user
             #get all diagnostic cases for this patient
            cases = Diagnosticcase.objects.filter(user=user).prefetch_related(
                'inputs', 'diagnoses'
            ).order_by('-created_at')
            
            activities = []
            #process each case to extract activities
            for case in cases:
                for input_obj in case.inputs.all():
                    activities.append({
                        'id': str(input_obj.id),
                        'type': 'upload',
                        'title': f'Uploaded {input_obj.input_type or "medical data"}',
                        'description': input_obj.description or f'File: {input_obj.file_name or "Unknown"}',
                        'date': input_obj.upload_date.date().isoformat(),
                        'time': input_obj.upload_date.time().strftime('%I:%M %p'),
                        'status': 'success',
                        'details': f'{input_obj.file_size // 1024 if input_obj.file_size else 0} KB'
                    })
                #fetch completed diagnoses for this case
                for diagnosis in case.diagnoses.all():
                    activities.append({
                        'id': str(diagnosis.id),
                        'type': 'analysis',
                        'title': 'Analysis Completed',
                        'description': diagnosis.name or 'Diagnostic analysis completed',
                        'date': diagnosis.diagnosis_date.isoformat() if diagnosis.diagnosis_date else case.created_at.date().isoformat(),
                        'time': case.created_at.time().strftime('%I:%M %p'),
                        'status': 'success',
                        'details': f'{int(diagnosis.confidence)}% confidence' if diagnosis.confidence else None
                    })
                    # View activity when diagnosis was reviewed
                    if diagnosis.is_reviewed and diagnosis.date_reviewed:
                        activities.append({
                            'id': f"{diagnosis.id}-view",
                            'type': 'view',
                            'title': 'Report Viewed',
                            'description': f'Viewed diagnostic report: {diagnosis.name}',
                            'date': diagnosis.date_reviewed.isoformat(),
                            'time': '12:00 PM',  # Default time since we don't track exact viewing time
                            'status': 'success',
                            'details': None
                        })
            #time-based merge sort
            activities.sort(key=lambda x: (x['date'], x['time']), reverse=True)
            return Response({
                'activities': activities
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching patient activity history: {str(e)}", exc_info=True)
            return Response(
                {'error': f'An error occurred: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PatientActivityStatsAPIView(APIView):
    """
    Get activity statistics for the authenticated patient.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        try:
            user = request.user
            
            
            cases = Diagnosticcase.objects.filter(user=user).prefetch_related(
                'inputs', 'diagnoses'
            )
            

            uploads = Diagnosticinput.objects.filter(
                diagnostic_case__user=user
            ).count()
            
            
            analyses = Diagnosis.objects.filter(
                diagnostic_case__user=user
            ).count()
            
            #
            downloads = Diagnosis.objects.filter(
                diagnostic_case__user=user,
                is_reviewed=True
            ).count()
            
            
            views = Diagnosis.objects.filter(
                diagnostic_case__user=user,
                is_reviewed=True
            ).count()
            
            total_activities = uploads + analyses + downloads + views
            
            stats = {
                'total_activities': total_activities,
                'uploads': uploads,
                'analyses': analyses,
                'downloads': downloads,
                'views': views
            }
            
            return Response(stats, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching patient activity stats: {str(e)}", exc_info=True)
            return Response(
                {'error': f'An error occurred: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
class SaveDiagnosisWithRecommendationsAPIView(APIView):
    """
    Saves a complete diagnosis with its recommendations to the database.
    This should be called AFTER the AI diagnosis is generated.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        """
        Expected request.data format:
        {
            "case_id": "uuid-of-diagnostic-case",
            "diagnosis": {
                "name": "Pneumonia",
                "confidence": 85,
                "description": "AI analysis details..."
            },
            "recommendations": [
                {
                    "name": "Chest X-Ray",
                    "category": "Imaging Test",
                    "type": "Test",
                    "description": "To confirm diagnosis"
                },
                {
                    "name": "Antibiotics",
                    "category": "Treatment",
                    "type": "Medication",
                    "description": "Broad spectrum"
                }
            ]
        }
        """
        try:
            case_id = request.data.get('case_id')
            diagnosis_data = request.data.get('diagnosis', {})
            recommendations_data = request.data.get('recommendations', [])

            if not case_id:
                return Response(
                    {'error': 'case_id is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Verify the case exists and belongs to the user
            try:
                diagnostic_case = Diagnosticcase.objects.get(
                    id=case_id,
                    user=request.user
                )
            except Diagnosticcase.DoesNotExist:
                return Response(
                    {'error': 'Diagnostic case not found or access denied'},
                    status=status.HTTP_404_NOT_FOUND
                )

            
            with transaction.atomic():
                # Create the Diagnosis
                diagnosis = Diagnosis.objects.create(
                    diagnostic_case=diagnostic_case,
                    name=diagnosis_data.get('name', 'Unknown'),
                    confidence=diagnosis_data.get('confidence', 0),
                    clinician_comment=diagnosis_data.get('description', ''),
                    model_used="LLava-Med",  
                    is_reviewed=False
                )

                logger.info(f" Created Diagnosis: {diagnosis.id} for case {case_id}")

                # Create all Recommendations
                created_recommendations = []
                for rec_data in recommendations_data:
                    # Skip empty or invalid recommendations
                    if not rec_data.get('name') or rec_data.get('name').strip() == '':
                        continue
                    
                    if 'NOT NULL' in rec_data.get('name', ''):
                        continue

                    recommendation = Recommendation.objects.create(
                        diagnosis=diagnosis,
                        name=rec_data.get('name', '').strip(),
                        category=rec_data.get('category', 'General'),
                        type=rec_data.get('type', 'Plan'),
                        description=rec_data.get('description', ''),
                        is_reviewed=False
                    )
                    created_recommendations.append(recommendation)
                    logger.info(f"   Created Recommendation: {recommendation.name}")

                logger.info(f" Saved {len(created_recommendations)} recommendations for diagnosis {diagnosis.id}")

                # Return the complete saved data
                response_data = {
                    'diagnosis_id': str(diagnosis.id),
                    'case_id': str(diagnostic_case.id),
                    'diagnosis_name': diagnosis.name,
                    'confidence': diagnosis.confidence,
                    'recommendations_count': len(created_recommendations),
                    'message': 'Diagnosis and recommendations saved successfully'
                }

                return Response(response_data, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f" Error saving diagnosis: {str(e)}", exc_info=True)
            return Response(
                {'error': f'Failed to save diagnosis: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )