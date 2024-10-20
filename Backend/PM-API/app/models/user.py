from app import db
from datetime import datetime

class File(db.Model):
    __tablename__ = 'files'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    saved_filename = db.Column(db.String(255), nullable=False)
    upload_path = db.Column(db.String(255), nullable=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', back_populates='files')

    def __repr__(self):
        return f'<File {self.original_filename}>'

class User(db.Model):
    __tablename__ = 'users'  # The table name is 'users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    files = db.relationship('File', back_populates='user', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<User {self.email}>'
