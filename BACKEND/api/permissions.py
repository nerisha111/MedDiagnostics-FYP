# api/permissions.py
from rest_framework import permissions

class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to view or edit it.
    """

    def has_permission(self, request, view):
        """
        This check runs first. We just need to ensure the user is logged in,
        which is already guaranteed by the default IsAuthenticated setting.
        So, we can simply return True.
        """
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        """
        This check runs after the object has been fetched from the database.
        'obj' is the Clinician/Patient profile instance.
        """
        # We check if the object's primary key matches the authenticated user's primary key.
        # This works for OneToOneFields where the PK is the related user.
        if hasattr(obj, 'user'):
            # This handles models with a direct 'user' foreign key.
            return obj.user.pk == request.user.pk
        elif hasattr(obj, 'id') and hasattr(obj.id, 'pk'):
             # This handles your specific case where the 'id' is a OneToOneField to User.
             # obj.id is the User object.
            return obj.id.pk == request.user.pk
        
        return False