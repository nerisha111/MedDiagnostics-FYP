# api/middleware.py

class DebugRequestMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # This code runs for every single request before the view is called.
        
        # We will run our debug prints here.
        print("\n--- MIDDLEWARE DEBUGGER ---")
        
        # The 'user' attribute is attached by authentication middleware/classes.
        user = getattr(request, 'user', 'Not Set')
        print(f"Request User object:  {user}")
        print(f"Type of Request User: {type(user)}")
        
        if user != 'Not Set':
            is_auth = hasattr(user, 'is_authenticated') and user.is_authenticated
            print(f"Is Authenticated?       {is_auth}")
        else:
            print(f"Is Authenticated?       N/A")

        # Let's see the raw header the frontend is sending.
        auth_header = request.headers.get('Authorization', 'Not Found')
        print(f"Authorization Header: {auth_header}")
        print("---------------------------\n")
        
        response = self.get_response(request)
        return response