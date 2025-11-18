# api/serializers.py

from rest_framework import serializers
from .models import (
    User,
    Patient,
    Clinician,
    Model,
    Clinicalguideline,
    Diagnosticcase,
    Diagnosticinput,
    Diagnosis,
    Recommendation,
    Feedback
)

# ==============================================================================
# BASE SERIALIZERS 
# ==============================================================================

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'created_at', 'first_name', 'last_name',
            'gender', 'date_of_birth', 'email'
        ]

class ModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Model
        fields = '__all__'

class ClinicalGuidelineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Clinicalguideline
        fields = '__all__'

# ==============================================================================
# NESTED & DETAILED SERIALIZERS (No changes needed here)
# ==============================================================================

class PatientSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='id', read_only=True)
    class Meta:
        model = Patient
        fields = ['user_details', 'phone_number', 'address']

class ClinicianSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='id', read_only=True)
    class Meta:
        model = Clinician
        fields = ['user_details', 'role', 'department', 'medical_license_number']

class DiagnosticCaseSerializer(serializers.ModelSerializer):
    created_by_email = serializers.StringRelatedField(source='user')
    class Meta:
        model = Diagnosticcase
        fields = [
            'id', 'status', 'description', 'created_at',
            'user', 'created_by_email', 'profile_info'
        ]

class DiagnosticInputSerializer(serializers.ModelSerializer):
    class Meta:
        model = Diagnosticinput
        # List all fields that the frontend will send
        fields = [
            'id',
            'diagnostic_case',
            'input_type',
            'description',
            'file_url',
            'file_name',
            'file_size',
            'upload_date'
        ]
        read_only_fields = ['id', 'upload_date']

class DiagnosisSerializer(serializers.ModelSerializer):
    model_details = ModelSerializer(source='model_used', read_only=True)
    class Meta:
        model = Diagnosis
        fields = [
            'id', 'diagnosis_date', 'name', 'confidence',
            'clinician_comment', 'is_reviewed', 'date_reviewed',
            'model_used', 'model_details'
       ]

class DiagnosticCaseSummarySerializer(serializers.ModelSerializer):
    """ A simple serializer to embed in the diagnosis detail view. """
    class Meta:
        model = Diagnosticcase
        fields = ['id', 'description', 'profile_info', 'created_at']

class RecommendationSerializer(serializers.ModelSerializer):
    #guideline_details = ClinicalGuidelineSerializer(source='guideline_used', read_only=True)
    class Meta:
        model = Recommendation
        fields = [
            'id', 'recommended_text', 'generated_date', 'is_reviewed'
            
        ]
class FeedbackSerializer(serializers.ModelSerializer):
    """
    Serializer for clinician feedback on diagnoses.
    """
    clinician_email = serializers.StringRelatedField(source='clinician', read_only=True)
    diagnosis_details = DiagnosisSerializer(source='diagnosis', read_only=True)
    
    class Meta:
        model = Feedback
        fields = [
            'id',
            'diagnosis',
            'clinician',
            'clinician_email',
            'diagnosis_details',
            'accuracy_stars',
            'accuracy_correctness',
            'actual_diagnosis',
            'confidence_score_assessment',
            'next_steps_rating',
            'followed_recommendations',
            'missing_info',
            'general_comments',
            'data_quality',
            'data_quality_issues',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'clinician']

    def validate(self, data):
        """
        Validate feedback data:
        - If accuracy_correctness is 'incorrect', actual_diagnosis should be provided
        - If data_quality is 'no', data_quality_issues should be provided
        """
        if data.get('accuracy_correctness') == 'incorrect' and not data.get('actual_diagnosis'):
            raise serializers.ValidationError({
                'actual_diagnosis': 'This field is required when diagnosis is marked as incorrect.'
            })
        
        if data.get('data_quality') == 'no' and not data.get('data_quality_issues'):
            raise serializers.ValidationError({
                'data_quality_issues': 'Please describe the data quality issues.'
            })
        
        return data

# ==============================================================================
# REGISTRATION SERIALIZERS (Corrected and Organized)
# ==============================================================================

# --- Clinician Registration ---

class ClinicianNestedDataSerializer(serializers.ModelSerializer):
    """
    A simple nested serializer to handle the fields for the Clinician model.
    """
    class Meta:
        model = Clinician
        fields = ['role', 'department', 'medical_license_number']

class ClinicianRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for clinician registration with Supabase.
    Creates a User and a related Clinician instance from a single API call.
    """
    clinician_data = ClinicianNestedDataSerializer(write_only=True)
    id = serializers.UUIDField()

    class Meta:
        model = User
        fields = [
            'id',
            'first_name',
            'last_name',
            'gender',
            'date_of_birth',
            'email',
            'clinician_data',
        ]

    def create(self, validated_data):
        clinician_info = validated_data.pop('clinician_data')
        user_id = validated_data.pop('id')
        user = User.objects.create(id=user_id, **validated_data)
        Clinician.objects.create(id=user, **clinician_info)
        return user

# --- Patient Registration ---

class PatientNestedDataSerializer(serializers.ModelSerializer):
    """
    A simple nested serializer to handle the fields for the Patient model.
    """
    class Meta:
        model = Patient
        fields = ['phone_number', 'address']

class PatientRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for patient registration with Supabase.
    Creates a User and a related Patient instance from a single API call.
    """
    patient_data = PatientNestedDataSerializer(write_only=True)
    id = serializers.UUIDField()

    class Meta:
        model = User
        fields = [
            'id',
            'first_name',
            'last_name',
            'gender',
            'date_of_birth',
            'email',
            'patient_data',
        ]

    def create(self, validated_data):
        patient_info = validated_data.pop('patient_data')
        user_id = validated_data.pop('id')
        user = User.objects.create(id=user_id, **validated_data)

        Patient.objects.create(id=user, **patient_info)
        return user
    
class FeedbackCreateSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for creating feedback (used by the frontend).
    """

    class Meta:
        model = Feedback
        fields = [
            'diagnosis',
            'accuracy_stars',
            'accuracy_correctness',
            'actual_diagnosis',
            'confidence_score_assessment',
            'next_steps_rating',
            'followed_recommendations',
            'missing_info',
            'general_comments',
            'data_quality',
            'data_quality_issues'
        ]

    def validate(self, data):
        """
        Same validation as FeedbackSerializer
        """
        if data.get('accuracy_correctness') == 'incorrect' and not data.get('actual_diagnosis'):
            raise serializers.ValidationError({
                'actual_diagnosis': 'This field is required when diagnosis is marked as incorrect.'
            })
        
        if data.get('data_quality') == 'no' and not data.get('data_quality_issues'):
            raise serializers.ValidationError({
                'data_quality_issues': 'Please describe the data quality issues.'
            })
        
        return data
    
class DiagnosisWithFeedbackSerializer(serializers.ModelSerializer):
    """
    Serializer for the Diagnosis model that includes related feedback details.
    This version uses to_representation for maximum control over the output.
    """
    # We still declare the fields here so DRF's tooling can see them.
    diagnosisTitle = serializers.CharField(source='name', read_only=True)
    date = serializers.DateField(source='diagnosis_date', read_only=True)
    status = serializers.CharField(read_only=True)
    confidence = serializers.IntegerField(read_only=True)
    feedback_details = serializers.DictField(read_only=True)


    class Meta:
        model = Diagnosis
        # The fields here must match the keys in the dictionary we return below.
        fields = [
            'id',
            'diagnosisTitle',
            'date',
            'status',
            'confidence',
            'feedback_details'
        ]

    def to_representation(self, instance):
        """
        This method manually constructs the dictionary for each object.
        It is the final step before the data is converted to JSON.
        """
        # Determine status
        has_feedback = hasattr(instance, 'feedback')
        status_val = "given" if has_feedback else "pending"

        # Determine confidence, with a fallback
        confidence_val = 0
        if instance.confidence is not None:
            confidence_val = int(instance.confidence)

        # Determine feedback_details
        feedback_details_val = None
        if has_feedback:
            feedback = instance.feedback
            feedback_details_val = {
                'accuracyRating': feedback.accuracy_stars,
                'usefulnessRating': feedback.next_steps_rating,
                'comments': feedback.general_comments
            }
        
        # Manually build the dictionary
        final_dict = {
            'id': instance.id,
            'diagnosisTitle': instance.name,
            'date': instance.diagnosis_date,
            'status': status_val,
            'confidence': confidence_val,
            'feedback_details': feedback_details_val
        }

        # This print statement will show us the *absolute final* dictionary
        # just before it is sent.
        print(f"--- FINAL DICT for ID {instance.id}: {final_dict} ---")

        return final_dict

    
class RecommendationDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recommendation
        fields = '__all__' 

class DiagnosisDetailSerializer(serializers.ModelSerializer):
    """ Serializer for a single, detailed diagnosis view. """
    
    recommendations = RecommendationDetailSerializer(many=True, read_only=True)
    diagnostic_case = DiagnosticCaseSummarySerializer(read_only=True)


    class Meta:
        model = Diagnosis
        fields = [
            'id',
            'diagnostic_case',
            'name',
            'diagnosis_date',
            'confidence',
            'clinician_comment',
            'recommendations' 
            
        ]
