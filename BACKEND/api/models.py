# api/models.py
from django.db import models
import uuid

# ==============================================================================
# Core Models (Fewest Dependencies)
# ==============================================================================

class User(models.Model):
    id = models.UUIDField(primary_key=True, editable=False) 
    created_at = models.DateTimeField(auto_now_add=True)
    first_name = models.CharField(max_length=255, blank=True, null=True)
    last_name = models.CharField(max_length=255, blank=True, null=True)
    gender = models.CharField(max_length=50, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    email = models.EmailField(unique=True, blank=True, null=True)
    

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
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    created_by = models.ForeignKey(User, models.SET_NULL, db_column='created_by', blank=True, null=True)
    profile_info = models.JSONField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'DiagnosticCase'
        db_table_comment = 'Represents a diagnostic case created by a user'
        ordering = ['-created_at']

    def __str__(self):
        return f"Case {self.id} (Status: {self.status})"


class Diagnosticinput(models.Model):
    id = models.OneToOneField(Diagnosticcase, models.CASCADE, db_column='id', primary_key=True)
    input_type = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    file_url = models.URLField(max_length=1024, blank=True, null=True)
    file_name = models.CharField(max_length=255, blank=True, null=True)
    file_size = models.BigIntegerField(blank=True, null=True) # BinaryField is not appropriate for size
    upload_date = models.DateTimeField(auto_now_add=True, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'DiagnosticInput'
        db_table_comment = 'Inputs (images, lab results, notes, genetic) for a diagnostic case'

    def __str__(self):
        return f"Input for Case {self.id}"


class Diagnosis(models.Model):
    id = models.OneToOneField(Diagnosticcase, models.CASCADE, db_column='id', primary_key=True) # Changed from Model to Diagnosticcase
    model_used = models.ForeignKey(Model, models.PROTECT, blank=True, null=True) # Added link to the model used
    diagnosis_date = models.DateField(auto_now_add=True, blank=True, null=True)
    probable_condition = models.CharField(max_length=255, blank=True, null=True)
    confidence_score = models.FloatField(blank=True, null=True)
    clinician_comment = models.TextField(blank=True, null=True)
    is_reviewed = models.BooleanField(default=False, blank=True, null=True)
    date_reviewed = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Diagnosis'
        db_table_comment = 'AI-generated diagnosis for a case using a specific model'

    def __str__(self):
        return f"Diagnosis for Case {self.id}: {self.probable_condition}"


class Recommendation(models.Model):
    id = models.OneToOneField(Diagnosis, models.CASCADE, db_column='id', primary_key=True) # Changed from Guideline to Diagnosis
    guideline_used = models.ForeignKey(Clinicalguideline, models.PROTECT, blank=True, null=True) # Added link to guideline
    recommended_text = models.TextField(blank=True, null=True)
    generated_date = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    is_reviewed = models.BooleanField(default=False, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Recommendation'
        db_table_comment = 'Treatment recommendation based on diagnosis and guidelines'

    def __str__(self):
        return f"Recommendation for Diagnosis {self.id}"