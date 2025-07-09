import sqlite3
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from emailer import send_welcome_email          # 🔹 Send welcome mail
from config import DB_PATH                      # 🔹 Central DB path

# 🔹 Ensure users table exists
def init_user_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            city TEXT NOT NULL,
            state TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

# 🔹 Register logic
def register_user(name, email, password, city, state):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    try:
        c.execute("""
            INSERT INTO users (name, email, password, city, state)
            VALUES (?, ?, ?, ?, ?)
        """, (name, email, generate_password_hash(password), city, state))
        conn.commit()
        return True, "Registered successfully!"
    except sqlite3.IntegrityError:
        return False, "Email already exists."
    finally:
        conn.close()

# 🔹 Login logic
def login_user(email, password):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = c.fetchone()
    conn.close()
    if user and check_password_hash(user[3], password):
        return True, {
            "name": user[1],
            "email": user[2],
            "city": user[4],
            "state": user[5]
        }
    return False, "Invalid credentials"

# 🔹 Flask Blueprint
auth_bp = Blueprint("auth", __name__)

# 🔸 /register
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    required = ["name", "email", "password", "city", "state"]
    if not all(k in data and data[k] for k in required):
        return jsonify({"error": "All fields are required"}), 400

    success, msg = register_user(
        data["name"], data["email"], data["password"],
        data["city"], data["state"]
    )
    if success:
        send_welcome_email(data["email"], data["name"])  # ✅ Send welcome
        return jsonify({"message": msg})
    return jsonify({"error": msg}), 400

# 🔸 /login
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data.get("email") or not data.get("password"):
        return jsonify({"error": "Email and password required"}), 400

    success, info = login_user(data["email"], data["password"])
    if success:
        return jsonify({"message": "Login successful", "user": info})
    return jsonify({"error": info}), 401
