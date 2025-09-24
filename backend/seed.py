import os
from extensions import db
from models import Admin


def ensure_admin():
    email = os.getenv('SUPERADMIN_EMAIL', 'admin@galvan.ai')
    if Admin.query.filter_by(email=email).first():
        return
    admin = Admin(
        first_name=os.getenv('SUPERADMIN_FIRST_NAME', 'Super'),
        last_name=os.getenv('SUPERADMIN_LAST_NAME', 'Admin'),
        email=email,
        is_active=True,
    )
    admin.set_password(os.getenv('SUPERADMIN_PASSWORD', 'Admin@1234'))
    db.session.add(admin)
    db.session.commit()