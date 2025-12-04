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
# NESTED & DETAILED SERIALIZERS
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
            'id', 'status', 'description', 'chief_complaint', 
            'created_at', 'user', 'created_by_email', 'profile_info'
        ]
        read_only_fields = ['id', 'created_at', 'created_by_email']

class DiagnosticInputSerializer(serializers.ModelSerializer):
    class Meta:
        model = Diagnosticinput
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
    """ 
    Smart serializer: Checks 'chief_complaint' column first.
    If empty, grabs the 'description' column.
    """
    chief_complaint = serializers.SerializerMethodField()

    class Meta:
        model = Diagnosticcase
        fields = ['id', 'description', 'chief_complaint', 'profile_info', 'created_at']

    def get_chief_complaint(self, obj):
        
        if obj.chief_complaint and str(obj.chief_complaint).strip() not in ['Not Specified', 'NULL', 'None']:
            return obj.chief_complaint
            
      
        if obj.description:
            return obj.description
            
        return "No chief complaint recorded."


 

class RecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recommendation
        
        fields = [
            'id', 'name', 'name', 'category', 'type', 'generated_date', 'is_reviewed'
        ]

class FeedbackSerializer(serializers.ModelSerializer):
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
# REGISTRATION SERIALIZERS
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
        fields = [
            'id', 'first_name', 'last_name', 'gender',
            'date_of_birth', 'email', 'clinician_data',
        ]

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
    id = serializers.UUIDField()

    class Meta:
        model = User
        fields = [
            'id', 'first_name', 'last_name', 'gender',
            'date_of_birth', 'email', 'patient_data',
        ]

    def create(self, validated_data):
        patient_info = validated_data.pop('patient_data')
        user_id = validated_data.pop('id')
        user = User.objects.create(id=user_id, **validated_data)
        Patient.objects.create(id=user, **patient_info)
        return user
    
class FeedbackCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = [
            'diagnosis', 'accuracy_stars', 'accuracy_correctness',
            'actual_diagnosis', 'confidence_score_assessment',
            'next_steps_rating', 'followed_recommendations',
            'missing_info', 'general_comments',
            'data_quality', 'data_quality_issues'
        ]

    def validate(self, data):
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
    diagnosisTitle = serializers.CharField(source='name', read_only=True)
    date = serializers.DateField(source='diagnosis_date', read_only=True)
    status = serializers.CharField(read_only=True)
    confidence = serializers.IntegerField(read_only=True)
    feedback_details = serializers.DictField(read_only=True)

    class Meta:
        model = Diagnosis
        fields = [
            'id', 'diagnosisTitle', 'date',
            'status', 'confidence', 'feedback_details'
        ]

    def to_representation(self, instance):
        has_feedback = hasattr(instance, 'feedback')
        status_val = "given" if has_feedback else "pending"
        confidence_val = int(instance.confidence) if instance.confidence is not None else 0

        feedback_details_val = None
        if has_feedback:
            feedback = instance.feedback
            feedback_details_val = {
                'accuracyRating': feedback.accuracy_stars,
                'usefulnessRating': feedback.next_steps_rating,
                'comments': feedback.general_comments
            }
        
        final_dict = {
            'id': instance.id,
            'diagnosisTitle': instance.name,
            'date': instance.diagnosis_date,
            'status': status_val,
            'confidence': confidence_val,
            'feedback_details': feedback_details_val
        }
        return final_dict

class RecommendationDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for recommendations with all relevant fields.
    Note: recommended_text is deprecated and contains 'NOT NULL' placeholder.
    """
    class Meta:
        model = Recommendation
        fields = [
            'id', 
            'name',        
            'category',    
            'type',        
            'description', 
            'generated_date', 
            'is_reviewed'
        ]
class DiagnosisDetailSerializer(serializers.ModelSerializer):
    """
    The main serializer used for the 'View Details' modal.
    Includes the nested diagnostic_case with the chief_complaint.
    """
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

class CaseComparisonListSerializer(serializers.ModelSerializer):
    diagnosis = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()

    class Meta:
        model = Diagnosticcase
        fields = ['id', 'diagnosis', 'date']

    def get_diagnosis(self, obj):
        primary_diagnosis = obj.diagnoses.first()
        return primary_diagnosis.name if primary_diagnosis and primary_diagnosis.name else (obj.description or "Untitled Case")

    def get_date(self, obj):
        primary_diagnosis = obj.diagnoses.first()
        return primary_diagnosis.diagnosis_date if primary_diagnosis else obj.created_at.date()


class CaseComparisonDetailSerializer(serializers.ModelSerializer):
    date = serializers.SerializerMethodField()
    diagnosis = serializers.SerializerMethodField()
    confidence = serializers.SerializerMethodField()
    age = serializers.SerializerMethodField()
    gender = serializers.SerializerMethodField()
    symptoms = serializers.SerializerMethodField()
    testResults = serializers.SerializerMethodField()
    treatment = serializers.SerializerMethodField()
    outcome = serializers.SerializerMethodField()

    class Meta:
        model = Diagnosticcase
        fields = [
            'id', 'date', 'diagnosis', 'confidence', 'age', 'gender',
            'symptoms', 'testResults', 'treatment', 'outcome'
        ]

    def get_primary_diagnosis(self, obj):
        return obj.diagnoses.order_by('-diagnosis_date').first()

    def get_date(self, obj):
        diag = self.get_primary_diagnosis(obj)
        return diag.diagnosis_date.strftime("%B %d, %Y") if diag else obj.created_at.strftime("%B %d, %Y")

    def get_diagnosis(self, obj):
        diag = self.get_primary_diagnosis(obj)
        return diag.name if diag and diag.name else (obj.description or "N/A")

    def get_confidence(self, obj):
        diag = self.get_primary_diagnosis(obj)
        if not (diag and diag.confidence is not None):
            return 0
        confidence_val = diag.confidence
        if confidence_val > 1:
            return int(confidence_val)
        else:
            return int(confidence_val * 100)

    def get_age(self, obj):
        return obj.profile_info.get('age', 'N/A') if obj.profile_info else 'N/A'

    def get_gender(self, obj):
        return obj.profile_info.get('gender', 'N/A') if obj.profile_info else 'N/A'

    def get_symptoms(self, obj):
        return obj.profile_info.get('symptoms', []) if obj.profile_info else []

    def get_testResults(self, obj):
        return obj.profile_info.get('testResults', []) if obj.profile_info else []

    def get_outcome(self, obj):
        return obj.profile_info.get('outcome', '') if obj.profile_info else ''

    def get_treatment(self, obj):
        diag = self.get_primary_diagnosis(obj)
        if not diag:
            return []
        recommendations = list(diag.recommendations.values_list('name', flat=True))
        filtered_recs = [
            rec for rec in recommendations 
            if rec and rec.strip().upper() != 'NOT NULL'
        ]
        return filtered_recs
    
# ==============================================================================
# patient history serializers
# ==============================================================================
class ActivityHistorySerializer(serializers.Serializer):
    """
    Serializer for patient activity history.
    """
    id = serializers.UUIDField()
    type = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField()
    date = serializers.DateField()
    time = serializers.TimeField()
    status = serializers.CharField(required=False, allow_null=True)
    details = serializers.CharField(required=False, allow_null=True)

class ActivityStatsSerializer(serializers.Serializer):
    """
    Serializer for activity statistics.
    """
    total_activities = serializers.IntegerField()
    uploads = serializers.IntegerField()
    analyses = serializers.IntegerField()
    downloads = serializers.IntegerField()
    views = serializers.IntegerField()
