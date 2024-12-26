from django.urls import path
from user_management.views import UserTableViewSet, MatchTableViewSet, OTPViewSet
from user_management.viewset_auth import authViewSet

urlpatterns = [
    # User table endpoints
    path('user/create', UserTableViewSet.createUser),
    path('user/update', UserTableViewSet.updateUser),
    path('user/get-all', UserTableViewSet.getAllUsers),
    path('user/getInfo', UserTableViewSet.getInfo),


    # Auth endpoints
    path('auth/login', authViewSet.userLogin),
    path('auth/logout', authViewSet.userLogout),
    path('auth/refresh', authViewSet.tokenRefresh),
    path('auth/OAuth', authViewSet.OAuth),


    # OTP endpoints (2FA)
    path('OTP/get-qr', OTPViewSet.getOrCreateOTP),
    path('OTP/verify', OTPViewSet.verifyOTP),


    # Match table endpoints
    path('match/create', MatchTableViewSet.createMatchEntry),
    path('match/get-all', MatchTableViewSet.getAllMatchEntries),
    path('match/delete', MatchTableViewSet.deleteMatchEntry),
]