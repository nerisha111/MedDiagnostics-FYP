# api/authentication.py
import jwt
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework import exceptions
from .models import User
import logging


logger = logging.getLogger(__name__)

class SupabaseAuthentication(BaseAuthentication):
    
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            logger.debug("No Authorization header found.")
            return None

        try:
            token = auth_header.split(' ')[1]
        except IndexError:
            return None
        
        try:
            payload = jwt.decode(
                token, 
                settings.SUPABASE_JWT_SECRET,
                algorithms=['HS256'],
                audience='authenticated'
            )

        except Exception as e:
            raise exceptions.AuthenticationFailed(f'Invalid or expired token. Error: {e}')

        user_id = payload.get('sub')
        if not user_id:
            logger.error("Token is valid but contains no user ID ('sub' claim).")
            raise exceptions.AuthenticationFailed('Token contains no user ID.')

        try:
            user = User.objects.get(id=user_id)
            logger.debug(f"User {user_id} found in local database.")
        except User.DoesNotExist:
            logger.error(f"User with ID {user_id} not found in local database.")
            raise exceptions.AuthenticationFailed(f'No such user in local database with ID: {user_id}')
        
        return (user, payload)