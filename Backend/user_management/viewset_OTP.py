from .models import User
from rest_framework.response import Response # for the response class
from rest_framework.decorators import api_view, permission_classes # for the api_view decorators (eg: @api_view(['GET']))
from django.shortcuts import get_object_or_404
from rest_framework import status
from .viewset_auth import generate_login_response
import pyotp
import qrcode
import io
import base64
from rest_framework.permissions import IsAuthenticated

class OTPViewSet:

    @api_view(['POST'])
    @permission_classes([IsAuthenticated])
    def verifyOTP(request):
        OTPCode = request.data.get("code")
        username = request.data.get("username")
        if not OTPCode or not username:
            return Response({"error": "OTP code or username is missing"}, status=status.HTTP_400_BAD_REQUEST)
        user = get_object_or_404(User, username=username)
        if user.pass_to_2fa == False:
            return Response({"error": "user didn't authenticated with username and password first"}, status=status.HTTP_401_UNAUTHORIZED)

        totp = pyotp.TOTP(user.two_factor_secret)
        if totp.verify(OTPCode) == False:
            return Response({"error": "invalid OTP code"}, status=status.HTTP_401_UNAUTHORIZED)

        return generate_login_response(user)


    @api_view(['POST'])
    def getOrCreateOTP(request):
        print(request.user_data)
        print(request.user)
        user = request.user
        if not user.two_factor_secret:
            user.two_factor_secret = pyotp.random_base32()
            user.save()

        otp_uri = pyotp.totp.TOTP(s=user.two_factor_secret).provisioning_uri(
            name=user.email,
            issuer_name="JAIJA HOLDING",
        )

        qr = qrcode.make(otp_uri)
        buffer = io.BytesIO()
        qr.save(buffer, format="PNG")

        buffer.seek(0)
        qr_code = base64.b64encode(buffer.getvalue()).decode("utf-8")

        qr_code_data_uri = f"data:image/png;base64,{qr_code}"
        return Response(status=status.HTTP_200_OK, data={"qr_code": qr_code_data_uri})