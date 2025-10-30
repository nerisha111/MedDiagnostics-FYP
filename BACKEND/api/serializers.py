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
        fields = '__all__'

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