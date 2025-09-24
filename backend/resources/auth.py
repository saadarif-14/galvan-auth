
import os
from flask import request, make_response
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    get_jwt,
    set_access_cookies,
    set_refresh_cookies,
    unset_jwt_cookies,
)

from extensions import db
from models import User, Admin, EmailOTP  # EmailOTP kept if you use it elsewhere

api = Namespace('auth', description='Authentication endpoints')

login_model = api.model('Login', {
    'email': fields.String(required=True),
    'password': fields.String(required=True),
    'user_type': fields.String(required=False, description='admin or user')  # optional in this implementation
})


class AdminLogin(Resource):
    @api.expect(login_model, validate=False)
    def post(self):
        try:
            data = request.get_json()
            if not data:
                return {"message": "No JSON data provided"}, 400

            email = (data.get('email') or '').strip().lower()
            password = data.get('password', '')

            if not email or '@' not in email:
                return {"message": "Invalid email format"}, 400

            admin = Admin.query.filter_by(email=email, is_active=True).first()
            if not admin or not admin.check_password(password):
                return {"message": "Invalid admin credentials"}, 401

            identity = str(admin.id)
            claims = {"role": "ADMIN", "type": "admin"}

            access_token = create_access_token(identity=identity, additional_claims=claims)
            refresh_token = create_refresh_token(identity=identity, additional_claims=claims)

            # Build a Response and return it directly (no tuple)
            resp = make_response({
                "accessToken": access_token,
                "refreshToken": refresh_token,
                "role": "ADMIN",
                "type": "admin",
            })
            resp.status_code = 200
            set_access_cookies(resp, access_token)
            set_refresh_cookies(resp, refresh_token)
            return resp
        except Exception as e:
            return {"message": f"Server error: {str(e)}"}, 500


class UserLogin(Resource):
    @api.expect(login_model, validate=False)
    def post(self):
        try:
            data = request.get_json()
            if not data:
                return {"message": "No JSON data provided"}, 400

            email = (data.get('email') or '').strip().lower()
            password = data.get('password', '')

            if not email or '@' not in email:
                return {"message": "Invalid email format"}, 400

            user = User.query.filter_by(email=email, is_active=True).first()
            if not user or not user.check_password(password):
                return {"message": "Invalid user credentials"}, 401
            print(f"User {email} login attempt - is_verified: {user.is_verified}")
            if not user.is_verified:
                return {"message": "Account not verified"}, 403

            identity = str(user.id)
            claims = {"role": "USER", "type": "user"}

            access_token = create_access_token(identity=identity, additional_claims=claims)
            refresh_token = create_refresh_token(identity=identity, additional_claims=claims)

            resp = make_response({
                "accessToken": access_token,
                "refreshToken": refresh_token,
                "role": "USER",
                "type": "user",
            })
            resp.status_code = 200
            set_access_cookies(resp, access_token)
            set_refresh_cookies(resp, refresh_token)
            return resp
        except Exception as e:
            return {"message": f"Server error: {str(e)}"}, 500


class Refresh(Resource):
    @jwt_required(refresh=True)
    def post(self):
        identity = get_jwt_identity()
        access_token = create_access_token(identity=identity)
        resp = make_response({"accessToken": access_token})
        resp.status_code = 200
        set_access_cookies(resp, access_token)
        return resp


class Logout(Resource):
    @jwt_required()
    def post(self):
        # Get the JWT token and add it to the blacklist
        jti = get_jwt()['jti']
        
        # Import the blacklist from app.py (in a real app, use Redis or database)
        from app import blacklisted_tokens
        blacklisted_tokens.add(jti)
        
        resp = make_response({"message": "Logged out successfully"})
        resp.status_code = 200
        unset_jwt_cookies(resp)
        return resp





class UserProfile(Resource):
    @jwt_required()
    def get(self):
        identity = get_jwt_identity()
        user = User.query.get_or_404(identity)
        return {
            'id': user.id,
            'firstName': user.first_name,
            'lastName': user.last_name,
            'email': user.email,
            'mobileNumber': user.mobile_number,
            'profilePictureUrl': user.profile_picture_url,
            'isActive': user.is_active,
            'isVerified': user.is_verified,
            'createdAt': user.created_at.isoformat() if user.created_at else None
        }, 200

class VerifyOTP(Resource):
    def post(self):
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        otp_code = data.get('otp', '').strip()

        print(f"OTP verification request for {email} with code {otp_code}")

        if not email or not otp_code:
            return {"message": "Email and OTP code are required"}, 400
        
        # Find the most recent OTP for this email
        otp_record = EmailOTP.query.filter_by(
            email=email, 
            purpose='admin_verification',
            is_used=False
        ).order_by(EmailOTP.created_at.desc()).first()
        
        print(f"Found OTP record: {otp_record}")
        
        if not otp_record:
            print(f"No OTP record found for {email}")
            return {"message": "No verification code found for this email"}, 404
        
        # Check if OTP is expired
        from datetime import datetime
        if datetime.utcnow() > otp_record.expires_at:
            return {"message": "Verification code has expired"}, 400
        
        # Verify OTP code
        print(f"Comparing OTP: stored={otp_record.otp_code}, provided={otp_code}")
        if otp_record.otp_code != otp_code:
            print(f"OTP mismatch for {email}")
            return {"message": "Invalid verification code"}, 400
        
        # Mark OTP as used and verify the user
        otp_record.is_used = True
        
        # Update user verification status
        user = User.query.filter_by(email=email).first()
        if user:
            user.is_verified = True
            db.session.commit()
            print(f"User {email} has been verified successfully")
            return {"message": "OTP verified successfully. User account is now verified."}, 200
        else:
            print(f"User {email} not found during OTP verification")
            return {"message": "User not found"}, 404


class CheckSession(Resource):
    @jwt_required()
    def get(self):
        """Check if the current session is valid"""
        try:
            current_user_id = get_jwt_identity()
            claims = get_jwt()
            
            return {
                "valid": True,
                "user_id": current_user_id,
                "role": claims.get("role"),
                "type": claims.get("type")
            }, 200
        except Exception as e:
            return {"message": "Invalid session", "valid": False}, 401


api.add_resource(AdminLogin, '/admin-login')
api.add_resource(UserLogin, '/user-login')
api.add_resource(Refresh, '/refresh')
api.add_resource(Logout, '/logout')
api.add_resource(UserProfile, '/profile')
api.add_resource(VerifyOTP, '/verify-otp')
api.add_resource(CheckSession, '/check')
