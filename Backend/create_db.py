from app import create_app, db

# Create the Flask app instance
app = create_app()

# Create the database and tables within the app context
with app.app_context():
    # This will create the tables defined in models
    db.create_all()

    print("Database and tables created successfully!")
