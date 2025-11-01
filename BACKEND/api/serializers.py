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
    Recommendation
)

# ==============================================================================
# PROFILE SERIALIZERS (No changes needed here)
# ==============================================================================

class PatientProfileSerializer(serializers.ModelSerializer):
    """A simple serializer for nested patient data."""
    class Meta:
        model = Patient
        fields = ['phone_number', 'address']

class ClinicianProfileSerializer(serializers.ModelSerializer):
    """A simple serializer for nested clinician data."""
    class Meta:
        model = Clinician
        fields = ['role', 'department', 'medical_license_number']

class UserProfileSerializer(serializers.ModelSerializer):
    """
    A smart serializer that returns the full user profile, including
    role-specific details (patient or clinician).
    """
    patient_profile = PatientProfileSerializer(source='patient', read_only=True)
    clinician_profile = ClinicianProfileSerializer(source='clinician', read_only=True)
    user_role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'created_at', 'first_name', 'last_name',
            'gender', 'date_of_birth', 'email', 'user_role',
            'patient_profile', 'clinician_profile'
        ]

    def get_user_role(self, obj):
        """Checks if a related patient or clinician object exists."""
        if hasattr(obj, 'patient'):
            return 'patient'
        if hasattr(obj, 'clinician'):
            return 'clinician'
        return None

# ==============================================================================
# BASE SERIALIZERS (No changes needed here)
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
    created_by_email = serializers.StringRelatedField(source='created_by')
    class Meta:
        model = Diagnosticcase
        fields = [
            'id', 'status', 'description', 'created_at',
            'created_by', 'created_by_email', 'profile_info'
        ]

class DiagnosticInputSerializer(serializers.ModelSerializer):
    class Meta:
        model = Diagnosticinput
        fields = [
            'id', 'diagnostic_case', 'input_type', 'description',
            'file_url', 'file_name', 'file_size', 'upload_date'
        ]
        read_only_fields = ['id', 'upload_date']

class DiagnosisSerializer(serializers.ModelSerializer):
    model_details = ModelSerializer(source='model_used', read_only=True)
    class Meta:
        model = Diagnosis
        fields = [
            'id', 'diagnosis_date', 'probable_condition', 'confidence_score',
            'clinician_comment', 'is_reviewed', 'date_reviewed',
            'model_used', 'model_details'
        ]

class RecommendationSerializer(serializers.ModelSerializer):
    guideline_details = ClinicalGuidelineSerializer(source='guideline_used', read_only=True)
    class Meta:
        model = Recommendation
        fields = [
            'id', 'recommended_text', 'generated_date', 'is_reviewed',
            'guideline_used', 'guideline_details'
        ]

# ==============================================================================
# REGISTRATION SERIALIZERS (Patient serializer is now fixed)
# ==============================================================================

class ClinicianNestedDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = Clinician
        fields = ['role', 'department', 'medical_license_number']

class ClinicianRegistrationSerializer(serializers.ModelSerializer):
    clinician_data = ClinicianNestedDataSerializer(write_only=True)
    id = serializers.UUIDField()
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'gender', 'date_of_birth', 'email', 'clinician_data']
    def create(self, validated_data):
        clinician_info = validated_data.pop('clinician_data')
        user_id = validated_data.pop('id')
        user = User.objects.create(id=user_id, **validated_data)
        Clinician.objects.create(id=user, **clinician_info)
        return user

class PatientNestedDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ['phone_number', 'address']

class PatientRegistrationSerializer(serializers.ModelSerializer):
    patient_data = PatientNestedDataSerializer(write_only=True)
    id = serializers.UUIDField(write_only=True) # Changed to write_only for clarity

    class Meta:
        model = User
        fields = [
            'id', 'first_name', 'last_name', 'gender',
            'date_of_birth', 'email', 'patient_data'
        ]
    
    # --- THIS create METHOD IS NOW FIXED FOR PATIENTS ---
    def create(self, validated_data):
        patient_info = validated_data.pop('patient_data')
        user_id = validated_data.pop('id')

        # This is the crucial fix: we now explicitly save the incoming ID
        # to BOTH the 'id' (primary key) and the 'supabase_user_id' fields.
        user = User.objects.create(
            id=user_id,
            supabase_user_id=user_id,
            **validated_data
        )
        
        Patient.objects.create(id=user, **patient_info)
        return user
