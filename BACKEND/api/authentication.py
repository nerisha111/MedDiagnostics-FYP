# api/authentication.py

import jwt
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework import exceptions
from .models import User

class SupabaseAuthentication(BaseAuthentication):
    """
    Custom authentication class for a 'managed = False' User model.
    It validates the Supabase JWT and retrieves the corresponding user from
    the database, but does NOT attempt to create one.
    """
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return None

        payload = None
        try:
            token = auth_header.split(' ')[1]
            payload = jwt.decode(
                token, 
                settings.SUPABASE_JWT_SECRET,
                algorithms=['HS256'],
                audience='authenticated' 
            )
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, IndexError) as e:
            raise exceptions.AuthenticationFailed(f'Invalid or expired token. Error: {e}')

        user_id = payload.get('sub')
        if not user_id:
            raise exceptions.AuthenticationFailed('Token contains no user ID (sub claim).')

        # --- THIS IS THE FINAL LOGIC CHANGE ---
        # Since our models are unmanaged (managed=False), we cannot use get_or_create.
        # The user MUST have been created in the database during the sign-up flow.
        # We will only attempt to GET the user.
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            # This is now a critical error. It means the user is authenticated with
            # Supabase, but their profile does not exist in our public User table.
            raise exceptions.AuthenticationFailed(f'User with ID {user_id} authenticated successfully but has no profile in the database.')
        except Exception as e:
            # Catch any other potential database errors.
            raise exceptions.AuthenticationFailed(f'Error retrieving user from database. Error: {e}')
        # --- END OF CHANGE ---
        
        # If the user is found, return them.
        return (user, payload)