# api/authentication.py
import jwt
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework import exceptions
from .models import User

class SupabaseAuthentication(BaseAuthentication):
    """
    Custom authentication class to validate JWTs issued by Supabase.
    """
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return None

        try:
            token = auth_header.split(' ')[1]
            
            # --- THIS IS THE FINAL FIX ---
            # We must tell PyJWT what audience to expect. For Supabase user tokens,
            # this is 'authenticated'.
            payload = jwt.decode(
                token, 
                settings.SUPABASE_JWT_SECRET,
                algorithms=['HS256'],
                audience='authenticated' # <-- THIS IS THE CRITICAL ADDITION
            )
            # --- END OF FIX ---

        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, IndexError) as e:
            # This will now catch the "Invalid audience" error as well.
            raise exceptions.AuthenticationFailed(f'Invalid or expired token. Error: {e}')

        user_id = payload.get('sub')
        if not user_id:
            raise exceptions.AuthenticationFailed('Token contains no user ID.')

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise exceptions.AuthenticationFailed(f'No such user in local database with ID: {user_id}')
        
        # If everything succeeds, return the user and payload.
        return (user, payload)