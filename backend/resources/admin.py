
from flask import request
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required, get_jwt

from extensions import db
from models import User, EmailOTP
from utils.otp import generate_otp, otp_expiry
from utils.emailer import send_email

api = Namespace('admin', description='Admin user management')

user_model = api.model('User', {
    'id': fields.Integer(readonly=True),
    'profilePictureUrl': fields.String(attribute='profile_picture_url'),
    'firstName': fields.String(attribute='first_name'),
    'lastName': fields.String(attribute='last_name'),
    'email': fields.String,
    'mobileNumber': fields.String(attribute='mobile_number'),
    'role': fields.String,
    'isActive': fields.Boolean(attribute='is_active'),
    'isVerified': fields.Boolean(attribute='is_verified'),
})

create_user_model = api.model('CreateUser', {
    'profilePictureUrl': fields.String(required=False),
    'firstName': fields.String(required=True),
    'lastName': fields.String(required=True),
    'email': fields.String(required=True),
    'password': fields.String(required=True),
    'mobileNumber': fields.String(required=False),
    'role': fields.String(required=True),
})


def require_admin():
    # Read role/type from JWT custom claims populated at login
    claims = get_jwt()
    if claims.get('type') != 'admin':
        api.abort(403, 'Admin access required')


class UsersList(Resource):
    @jwt_required()
    def get(self):
        require_admin()
        users = User.query.order_by(User.created_at.desc()).all()
        return api.marshal(users, user_model), 200

    @jwt_required()
    @api.expect(create_user_model, validate=True)
    def post(self):
        require_admin()
        data = request.json
        if User.query.filter_by(email=data['email']).first():
            api.abort(400, 'Email already exists')

        user = User(
            profile_picture_url=data.get('profilePictureUrl'),
            first_name=data['firstName'],
            last_name=data['lastName'],
            email=data['email'],
            mobile_number=data.get('mobileNumber'),
            role=data.get('role', 'USER'),
            is_verified=False,  # Start as unverified
        )
        user.set_password(data['password'])
        db.session.add(user)
        db.session.flush()  # Get the user ID
        print(f"Created user {data['email']} with ID {user.id}, is_verified: {user.is_verified}")
        
        # Generate and send OTP for verification
        otp_code = generate_otp()
        print(f"Generated OTP {otp_code} for user {data['email']}")
        otp = EmailOTP(
            email=data['email'],
            otp_code=otp_code,
            purpose='admin_verification',
            expires_at=otp_expiry(30)  # 30 minutes expiry
        )
        db.session.add(otp)
        db.session.commit()
        print(f"OTP record created for {data['email']}")
        
        # Send verification email
        email_subject = "Account Verification - Galvan AI"
        email_body = f"""
        Hello {data['firstName']} {data['lastName']},
        
        Your account has been created by an administrator. Please verify your email address using the OTP below:
        
        Verification Code: {otp_code}
        
        This code will expire in 30 minutes.
        
        If you did not request this account, please contact support.
        
        Best regards,
        Galvan AI Team
        """
        
        try:
            send_email(data['email'], email_subject, email_body)
        except Exception as e:
            print(f"Failed to send verification email: {e}")
        
        return api.marshal(user, user_model), 201


class UserItem(Resource):
    @jwt_required()
    def get(self, user_id):
        require_admin()
        user = User.query.get_or_404(user_id)
        return api.marshal(user, user_model), 200

    @jwt_required()
    def put(self, user_id):
        require_admin()
        user = User.query.get_or_404(user_id)
        data = request.json
        user.profile_picture_url = data.get('profilePictureUrl', user.profile_picture_url)
        user.first_name = data.get('firstName', user.first_name)
        user.last_name = data.get('lastName', user.last_name)
        user.mobile_number = data.get('mobileNumber', user.mobile_number)
        user.role = data.get('role', user.role)
        user.is_active = data.get('isActive', user.is_active)
        user.is_verified = data.get('isVerified', user.is_verified)
        if 'password' in data and data['password']:
            user.set_password(data['password'])
        db.session.commit()
        return api.marshal(user, user_model), 200

    @jwt_required()
    def delete(self, user_id):
        require_admin()
        user = User.query.get_or_404(user_id)
        db.session.delete(user)
        db.session.commit()
        return {"message": "Deleted"}, 200


api.add_resource(UsersList, '/users')
api.add_resource(UserItem, '/users/<int:user_id>')
