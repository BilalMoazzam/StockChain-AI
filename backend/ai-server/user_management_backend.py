# from flask import Flask, jsonify, request
# from flask_cors import CORS
# from datetime import datetime, timezone
# from bson import ObjectId
# from pymongo import MongoClient

# app = Flask(__name__)
# CORS(app)  # Enable CORS for all origins

# # MongoDB setup
# client = MongoClient("mongodb://localhost:27017")
# db = client["clothing_store"]
# users_collection = db["users"]

# # Dummy token-based auth (replace in production)
# def authenticate_token(req):
#     auth_header = req.headers.get("Authorization")
#     if not auth_header or not auth_header.startswith("Bearer "):
#         return False
#     token = auth_header.split(" ")[1]
#     return bool(token)  # Accepts any non-empty token

# # Convert Mongo _id to string
# def serialize_user(user):
#     user["id"] = str(user["_id"])
#     del user["_id"]
#     return user

# # Get all users
# @app.route('/api/admin/users', methods=['GET'])
# def get_users():
#     users = list(users_collection.find())
#     return jsonify({"users": [serialize_user(u) for u in users]})

# # Add a new user
# @app.route('/api/admin/users', methods=['POST'])
# def add_user():
#     if not authenticate_token(request):
#         return jsonify({"message": "Unauthorized"}), 401

#     data = request.get_json()
#     if not data or not all(k in data for k in ['name', 'email', 'role']):
#         return jsonify({"message": "Missing user data"}), 400

#     new_user = {
#         "name": data["name"],
#         "email": data["email"],
#         "role": data.get("role", "employee"),
#         "department": data.get("department", "General"),
#         "status": data.get("status", "Active"),
#         "lastActive": datetime.now(timezone.utc).isoformat()
#     }

#     result = users_collection.insert_one(new_user)
#     new_user["id"] = str(result.inserted_id)
#     return jsonify({"message": "User added successfully", "user": new_user}), 201

# # Update user
# @app.route('/api/admin/users/<user_id>', methods=['PUT'])
# def update_user(user_id):
#     if not authenticate_token(request):
#         return jsonify({"message": "Unauthorized"}), 401

#     data = request.get_json()
#     if not data:
#         return jsonify({"message": "No update data provided"}), 400

#     data["lastActive"] = datetime.now(timezone.utc).isoformat()
#     result = users_collection.update_one({"_id": ObjectId(user_id)}, {"$set": data})

#     if result.matched_count == 0:
#         return jsonify({"message": "User not found"}), 404

#     updated = users_collection.find_one({"_id": ObjectId(user_id)})
#     return jsonify({"message": "User updated successfully", "user": serialize_user(updated)}), 200

# # Delete user
# @app.route('/api/admin/users/<user_id>', methods=['DELETE'])
# def delete_user(user_id):
#     if not authenticate_token(request):
#         return jsonify({"message": "Unauthorized"}), 401

#     result = users_collection.delete_one({"_id": ObjectId(user_id)})
#     if result.deleted_count == 0:
#         return jsonify({"message": "User not found"}), 404

#     return jsonify({"message": "User deleted successfully"}), 200

# if __name__ == '__main__':
#     # Important: do NOT use port 3000 (used by React frontend)
#     app.run(debug=True, port=5001)
