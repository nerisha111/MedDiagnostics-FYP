import os 
from pathlib import Path
from dotenv import load_dotenv

# 1. Ensure load_dotenv() is called early
load_dotenv() 

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
# It's good practice to move this to your .env file as well, e.g., SECRET_KEY = os.getenv('DJANGO_SECRET_KEY')
SECRET_KEY = 'django-insecure-a43k*#62iw-abe&m#q43!-rrs=8ct8tm923bd#r2vesh*pz@sy'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = [] # In production, you'll need to add your domain here.

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'api',
]

MIDDLEWARE = [

    'django.middleware.security.SecurityMiddleware',
    
    
    'django.contrib.sessions.middleware.SessionMiddleware',
    
    'corsheaders.middleware.CorsMiddleware',
    
    'django.middleware.common.CommonMiddleware',
   
    'django.middleware.csrf.CsrfViewMiddleware',

    'django.contrib.auth.middleware.AuthenticationMiddleware',
  
    'django.contrib.messages.middleware.MessageMiddleware',

    'django.middleware.clickjacking.XFrameOptionsMiddleware',

    'api.middleware.DebugRequestMiddleware',
]


CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173", # Often used by Vite (React)
]
# Or for even more flexibility in local dev:
# CORS_ALLOW_CREDENTIALS = True
# CORS_ORIGIN_WHITELIST = ('http://localhost:3000', 'http://localhost:5173')


# 3. READ THE SUPABASE SECRET FROM YOUR .env FILE
SUPABASE_JWT_SECRET = os.getenv('SUPABASE_JWT_SECRET')


# 4. THIS IS THE MOST IMPORTANT CHANGE
# Replace the old REST_FRAMEWORK settings with the new ones for Supabase.
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'api.authentication.SupabaseAuthentication',
    ),
}


ROOT_URLCONF = 'backend_project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend_project.wsgi.application'

# Database
# It's highly recommended to move these credentials to your .env file as well
# to keep them out of your source code.
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'HOST': 'aws-1-eu-north-1.pooler.supabase.com',
        'PORT': '5432',
        'NAME': 'postgres',
        'USER': 'postgres.oqgvbmsrhnrwsxwfnfbw',
        'PASSWORD': 'N0L9xInbzLaieb2y', 
        'OPTIONS': {
            'sslmode': 'require',
        },
    }
}

# Password validation - No longer used by our custom User model, but good to keep for Django admin
AUTH_PASSWORD_VALIDATORS = [
    # ...
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'