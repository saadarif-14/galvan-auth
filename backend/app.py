
import os
from datetime import timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_jwt_extended.exceptions import JWTExtendedException
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_restx import Api
from dotenv import load_dotenv
from werkzeug.utils import secure_filename

from extensions import db
from resources.auth import api as auth_ns
from resources.admin import api as admin_ns
from seed import ensure_admin

load_dotenv()


def create_app():
    app = Flask(__name__)

    # --- Core config ---
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///app.db")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret")
    
    # --- File upload config ---
    app.config["UPLOAD_FOLDER"] = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
    app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16MB max file size
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

    # --- JWT config ---
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret")
    app.config["JWT_TOKEN_LOCATION"] = ["headers", "cookies"]
    app.config["JWT_COOKIE_SECURE"] = os.getenv("FLASK_ENV") == "production"  # True in production
    app.config["JWT_COOKIE_HTTPONLY"] = True  # Prevent XSS attacks
    app.config["JWT_COOKIE_SAMESITE"] = "Strict" if os.getenv("FLASK_ENV") == "production" else "Lax"
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=30)
    app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=7)
    app.config["JWT_BLACKLIST_ENABLED"] = True
    app.config["JWT_BLACKLIST_TOKEN_CHECKS"] = ["access", "refresh"]

    # --- CORS ---
    frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
    CORS(app, 
         supports_credentials=True, 
         origins=[
             frontend_origin, 
             "http://127.0.0.1:3000", 
             "http://localhost:3000",
             "http://127.0.0.1:5000",
             "http://localhost:5000"
         ],
         allow_headers=["Content-Type", "Authorization", "X-Requested-With", "X-CSRF-TOKEN"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         expose_headers=["Content-Type", "Authorization"])

    # --- Init ---
    db.init_app(app)
    jwt = JWTManager(app)
    
    # Rate limiting
    limiter = Limiter(
        key_func=get_remote_address,
        default_limits=["200 per day", "50 per hour"]
    )
    limiter.init_app(app)
    
    # Token blacklist for logout functionality
    blacklisted_tokens = set()
    
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        return jwt_payload['jti'] in blacklisted_tokens
    
    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        return jsonify({"message": "Token has been revoked"}), 401
    
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"message": "Token has expired"}), 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({"message": "Invalid token"}), 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({"message": "Authorization token required"}), 401

    # --- API ---
    api = Api(app, version="1.0", title="Galvan AI API", doc="/api/docs", prefix="/api")
    api.add_namespace(auth_ns, path="/auth")
    api.add_namespace(admin_ns, path="/admin")
    
    # Add a simple health check endpoint
    @app.route('/api/health')
    def health_check():
        return {"status": "ok", "message": "Server is running"}, 200
    
    # File upload utility functions
    def allowed_file(filename):
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
    
    def save_uploaded_file(file, user_id):
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            # Create unique filename with user_id
            name, ext = os.path.splitext(filename)
            unique_filename = f"user_{user_id}_{name}{ext}"
            
            # Ensure upload directory exists
            os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
            
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            file.save(file_path)
            
            # Return relative URL for the uploaded file
            return f"/uploads/{unique_filename}"
        return None
    
    # File upload endpoint
    @app.route('/api/upload/profile-picture', methods=['POST'])
    def upload_profile_picture():
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        if not allowed_file(file.filename):
            return jsonify({"error": "Invalid file type. Allowed: png, jpg, jpeg, gif, webp"}), 400
        
        # For now, use a temporary user_id (in real app, get from JWT)
        temp_user_id = request.form.get('user_id', 'temp')
        file_url = save_uploaded_file(file, temp_user_id)
        
        if file_url:
            return jsonify({"url": file_url}), 200
        else:
            return jsonify({"error": "Failed to save file"}), 500

    # Serve uploaded files
    @app.route('/uploads/<filename>')
    def uploaded_file(filename):
        from flask import send_from_directory
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    
    # --- DB & seed ---
    with app.app_context():
        db.create_all()
        ensure_admin()

    return app


app = create_app()

if __name__ == "__main__":
    host = os.getenv("BACKEND_HOST", "0.0.0.0")  # Listen on all interfaces
    port = int(os.getenv("BACKEND_PORT", "5000"))
    app.run(host=host, port=port, debug=True)

