# api/models.py
from django.db import models
import uuid

# ==============================================================================
# Core Models (Fewest Dependencies)
# ==============================================================================

class User(models.Model):
    id = models.UUIDField(primary_key=True, editable=False) 
    supabase_user_id = models.UUIDField(unique=True, null=False)
    created_at = models.DateTimeField(auto_now_add=True)
    first_name = models.CharField(max_length=255, blank=True, null=True)
    last_name = models.CharField(max_length=255, blank=True, null=True)
    gender = models.CharField(max_length=50, blank=True, null=True)
    role = models.CharField(max_length=100, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    email = models.EmailField(unique=True, blank=True, null=True)
    
    @property
    def is_authenticated(self):
        """
        Always return True. If a user instance exists and is attached to the request,
        it means our SupabaseAuthentication class has already validated them.
        """
        return True

    @property
    def is_active(self):
        """
        You could add custom logic here to deactivate users if needed.
        For now, we'll consider all existing users to be active.
        """
        return True

    class Meta:
        managed = False
        db_table = 'User'
        db_table_comment = 'Base table for all users (both clinicians and patients)'
        ordering = ['-created_at']

    def __str__(self):
        return self.email or str(self.id)


class Model(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    model_name = models.CharField(max_length=255, blank=True, null=True)
    version = models.CharField(max_length=50, blank=True, null=True)
    dataset_used = models.TextField(blank=True, null=True)
    accuracy = models.FloatField(blank=True, null=True)
    f1_score = models.FloatField(blank=True, null=True)
    date_trained = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Model'
        db_table_comment = 'AI/ML models used for diagnosis'

    def __str__(self):
        return f"{self.model_name} (v{self.version})"


class Clinicalguideline(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    disease_name = models.CharField(max_length=255, blank=True, null=True)
    recommended_tests = models.JSONField(blank=True, null=True)
    recommended_treatments = models.JSONField(blank=True, null=True)
    source = models.TextField(blank=True, null=True)
    country_region = models.CharField(max_length=100, blank=True, null=True)
    version = models.CharField(max_length=50, blank=True, null=True)
    last_updated = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'ClinicalGuideline'
        db_table_comment = 'Medical guidelines for diseases/conditions'

    def __str__(self):
        return f"{self.disease_name} Guideline (v{self.version})"


# ==============================================================================
# Models with Dependencies
# ==============================================================================

class Patient(models.Model):
    id = models.OneToOneField(User, models.CASCADE, db_column='id', primary_key=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Patient'
        db_table_comment = 'Extends user with patient-specific information'

    def __str__(self):
        return f"Patient: {self.id.email}"


class Clinician(models.Model):
    id = models.OneToOneField(User, models.CASCADE, db_column='id', primary_key=True)
    role = models.CharField(max_length=100, blank=True, null=True)
    department = models.CharField(max_length=100, blank=True, null=True)
    medical_license_number = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Clinician'
        db_table_comment = 'Extends user with clinician-specific information'

    def __str__(self):
        return f"Clinician: {self.id.email}"


class Diagnosticcase(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    status = models.CharField(max_length=50, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    chief_complaint = models.TextField(blank=True, null=True)  # Make sure this exists
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    user = models.ForeignKey(User, models.SET_NULL, db_column='user_id', blank=True, null=True)
    profile_info = models.JSONField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'DiagnosticCase'
        db_table_comment = 'Represents a diagnostic case created by a user'
        ordering = ['-created_at']

    def __str__(self):
        return f"Case {self.id} (Status: {self.status})"


class Diagnosticinput(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    diagnostic_case = models.ForeignKey(
        Diagnosticcase, 
        on_delete=models.CASCADE, 
        db_column='case_id',
        related_name='inputs' 
    )
    input_type = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    file_url = models.URLField(max_length=1024, blank=True, null=True)
    file_name = models.CharField(max_length=255, blank=True, null=True)
    file_size = models.BigIntegerField(blank=True, null=True)
    upload_date = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    
    class Meta:
        managed = False
        db_table = 'DiagnosticInput'
        db_table_comment = 'Inputs (images, lab results, notes, genetic) for a diagnostic case'

    def __str__(self):
        return f"Input for Case {self.id}"


class Diagnosis(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    diagnostic_case = models.ForeignKey(
        Diagnosticcase, 
        on_delete=models.CASCADE, 
        related_name='diagnoses',
        db_column='case_id' 
    )
    model_used = models.ForeignKey(Model, models.PROTECT, blank=True, null=True)
    diagnosis_date = models.DateField(auto_now_add=True, blank=True, null=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    confidence = models.FloatField(blank=True, null=True)
    clinician_comment = models.TextField(blank=True, null=True)
    is_reviewed = models.BooleanField(default=False, blank=True, null=True)
    date_reviewed = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Diagnosis'
        db_table_comment = 'AI-generated diagnosis for a case using a specific model'

    def __str__(self):
        return f"Diagnosis for Case {self.id}: {self.name}"
class Feedback(models.Model):
    """
    Stores detailed clinician feedback on AI-generated diagnoses.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    diagnosis = models.OneToOneField(
        Diagnosis, 
        on_delete=models.CASCADE, 
        related_name='feedback',
        db_column='diagnosis_id'
    )
    clinician = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        related_name='submitted_feedback',
        db_column='clinician_id'
    )
    
    # Diagnostic Accuracy
    accuracy_stars = models.IntegerField(
        blank=True, 
        null=True,
        help_text="Star rating (1-5) for diagnostic accuracy"
    )
    accuracy_correctness = models.CharField(
        max_length=20, 
        blank=True, 
        null=True,
        choices=[
            ('correct', 'Correct'),
            ('partial', 'Partially Correct'),
            ('incorrect', 'Incorrect')
        ]
    )
    actual_diagnosis = models.CharField(
        max_length=255, 
        blank=True, 
        null=True,
        help_text="The actual/correct diagnosis if AI was incorrect"
    )
    
    # Confidence Score Assessment
    confidence_score_assessment = models.CharField(
        max_length=20, 
        blank=True, 
        null=True,
        choices=[
            ('too-low', 'Too Low'),
            ('appropriate', 'Appropriate'),
            ('too-high', 'Too High')
        ]
    )
    
    # Recommended Actions
    next_steps_rating = models.IntegerField(
        blank=True, 
        null=True,
        help_text="Star rating (1-5) for recommended next steps"
    )
    followed_recommendations = models.JSONField(
        blank=True, 
        null=True,
        help_text="JSON array of recommendations that were followed"
    )
    
    # Missing Information
    missing_info = models.TextField(
        blank=True, 
        null=True,
        help_text="Critical information that was missed by AI"
    )
    
    # General Comments
    general_comments = models.TextField(
        blank=True, 
        null=True,
        help_text="General feedback comments"
    )
    
    # Data Quality
    data_quality = models.CharField(
        max_length=10, 
        blank=True, 
        null=True,
        choices=[
            ('yes', 'Yes'),
            ('no', 'No')
        ]
    )
    data_quality_issues = models.TextField(
        blank=True, 
        null=True,
        help_text="Description of data quality issues"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'Feedback'
        db_table_comment = 'Stores detailed clinician feedback on AI-generated diagnoses'
        ordering = ['-created_at']

    def __str__(self):
        return f"Feedback for Diagnosis {self.diagnosis_id} by {self.clinician.email}"

class Recommendation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    diagnosis = models.ForeignKey(
        Diagnosis, 
        on_delete=models.CASCADE,
        related_name='recommendations'
    )
    
    #recommended_text = models.TextField(blank=True, null=True) 
    category = models.CharField(max_length=255, blank=True, null=True) 
    type = models.CharField(max_length=100, blank=True, null=True)     
    description = models.TextField(blank=True, null=True)              
    name = models.TextField(blank=True, null=True) 
    
    generated_date = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    is_reviewed = models.BooleanField(default=False, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Recommendation'
        db_table_comment = 'Treatment recommendation based on diagnosis and guidelines'

    def __str__(self):
        return f"{self.type}: {self.name[:30]}..."