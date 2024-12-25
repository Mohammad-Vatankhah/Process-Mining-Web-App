# Process Mining Web App - Setup Guide

## Project Description
The Process Mining Web App is a full-stack application that leverages Flask for the backend and Next.js for the frontend. It allows users to upload their event logs and apply various process mining algorithms, ranging from discovery algorithms to conformance checking. The results are displayed in an interactive graph, enabling users to explore the insights visually.

---

## Backend Setup

### 1. Navigate to the Backend Directory
Change the current working directory to the backend folder of the project:
```bash
cd Backend
```

---

### 2. Create a Virtual Environment
A virtual environment helps isolate project dependencies. Create one using the following command:
```bash
python -m venv venv
```
This will create a folder named `venv` inside the `Backend` directory.

---

### 3. Activate the Virtual Environment
Activate the virtual environment depending on your operating system:

- **On Linux/Mac**:
  ```bash
  source venv/bin/activate
  ```

- **On Windows**:
  ```bash
  venv\Scripts\activate
  ```

Once activated, you should see the virtual environment's name (e.g., `(venv)`) in your terminal prompt.

---

### 4. Install Dependencies
Install the required Python packages listed in `requirements.txt`:
```bash
pip install -r requirements.txt
```
This ensures all necessary libraries are available for the backend to function.

---

### 5. Prepare a MySQL Database
Create a MySQL database on your machine. Make sure to note down the database name, as it will be required in the `.env` file.

---

### 6. Create the Database Schema
Run the following script to initialize the database schema:
```bash
python create_db.py
```
This script will set up the necessary tables in your MySQL database.

---

### 7. Prepare a `.env` File
Create a file named `.env` in the `Backend` folder with the following content:
```plaintext
FLASK_APP=server.py
FLASK_ENV=development
FLASK_RUN_PORT=8000
FLASL_SECRET_KEY=your-secret-key
FLASK_JWT_SECRET_KEY=your-jwt-secret-key
FLASK_SQLALCHEMY_DATABASE_URI=mysql+mysqlconnector://root@localhost/your-database-name
FLASK_MAIL_USERNAME=your-email@example.com
FLASK_MAIL_PASSWORD=your-email-password
```
- Replace `your-secret-key` with a strong secret key.
- Replace `your-jwt-secret-key` with a secret key for JWT tokens.
- Replace `your-database-name` with the name of the MySQL database you created.
- Replace `your-email@example.com` and `your-email-password` with your email credentials for Flask-Mail.

---

### 8. Run the Backend Server
Start the Flask development server:
```bash
flask run
```
This will run the backend server on `http://localhost:8000` (or the port specified in `.env`).

---

## Frontend Setup

### 1. Navigate to the Frontend Directory
Change the current working directory to the frontend folder of the project:
```bash
cd Frontend
```

---

### 2. Install Dependencies
Install the required Node.js packages:
```bash
npm install
```
This ensures all necessary libraries and frameworks are available for the frontend to function.

---

### 3. Run the Development Server
Start the Next.js development server:
```bash
npm run dev
```
This will run the frontend on `http://localhost:3000` (or another port if specified).

---

## Additional Notes

- **Deactivate Virtual Environment**: When you're done working with the backend, deactivate the virtual environment using:
  ```bash
  deactivate
  ```
- **Ensure MySQL Server is Running**: The backend requires a running MySQL server. Verify that the server is active before running the app.
- **Environment Variables**: Ensure the `.env` file is properly set up; missing or incorrect values may cause errors.

By following these steps, both the backend and frontend of the Process Mining Web App should be up and running successfully.

