from rest_framework.generics import GenericAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from .permissions import IsTeacher, IsStudent  # Corrected import
from .serializers import *
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.authentication import JWTAuthentication

class UserRegistrationAPIView(GenericAPIView):
    permission_classes = (AllowAny,)
    serializer_class = UserRegistrationSerializer
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token = RefreshToken.for_user(user)
        data = serializer.data
        data["tokens"] = {"refresh": str(token), "access": str(token.access_token)}
        return Response(data, status=status.HTTP_201_CREATED)


class UserLoginAPIView(GenericAPIView):
    permission_classes = (AllowAny,)
    serializer_class = UserLoginSerializer
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        serializer = CustomUserSerializer(user)
        token = RefreshToken.for_user(user)
        data = serializer.data
        data["tokens"] = {"refresh": str(token), "access": str(token.access_token)}
        data["role"] = user.role  # Return the role with the token
        return Response(data, status=status.HTTP_200_OK)


# class UserLogoutAPIView(GenericAPIView):
#     permission_classes = (IsAuthenticated,)

#     def post(self, request, *args, **kwargs):
#         # Check if the Authorization header contains the Bearer token
#         auth_header = request.headers.get("Authorization")
#         if not auth_header:
#             return Response({"detail": "Authorization token missing"}, status=401)

#         try:
#             # Extract the access token from the Authorization header
#             auth_token = auth_header.split(" ")[1]  # "Bearer <token>"
#             # Validate the token using SimpleJWT
#             jwt_authenticator = JWTAuthentication()
#             validated_token = jwt_authenticator.get_validated_token(auth_token)
            
#             # Proceed with refresh token invalidation
#             refresh_token = request.data.get("refresh")
#             if not refresh_token:
#                 return Response({"detail": "No refresh token provided"}, status=400)
            
#             # Blacklist the refresh token
#             token = RefreshToken(refresh_token)
#             token.blacklist()

#             return Response({"detail": "Successfully logged out"}, status=200)

#         except Exception as e:
#             return Response({"detail": str(e)}, status=400)

class UserLogoutAPIView(GenericAPIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return Response({"detail": "Authorization token missing"}, status=401)

        try:
            auth_token = auth_header.split(" ")[1]  # "Bearer <token>"
            jwt_authenticator = JWTAuthentication()
            validated_token = jwt_authenticator.get_validated_token(auth_token)
            
            # Proceed with refresh token invalidation
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response({"detail": "No refresh token provided"}, status=400)

            # Blacklist the refresh token
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response({"detail": "Successfully logged out"}, status=200)

        except ExpiredToken:
            return Response({"detail": "Access token has expired. Please log in again."}, status=401)
        except TokenError as e:
            return Response({"detail": f"Token error: {str(e)}"}, status=401)
        except Exception as e:
            return Response({"detail": str(e)}, status=400)
                        
class UserInfoAPIView(RetrieveAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = CustomUserSerializer
    
    def get(self, request):
        user = request.user
        serializer = CustomUserSerializer(user)
        return Response(serializer.data)
