from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import random
from datetime import datetime

app = Flask(__name__)
CORS(app)


def read_user_data(username):
    try:
        with open(f"{username}.txt", "r") as file:
            user_data = file.readlines()
        return {
            "name": user_data[0].split(":")[1].strip(),
            "surname": user_data[1].split(":")[1].strip(),
            "phone_number": user_data[2].split(":")[1].strip(),
            "id_number": user_data[3].split(":")[1].strip(),
            "account_number": user_data[4].split(":")[1].strip(),
            "password": user_data[5].split(":")[1].strip(),
            "balance": float(user_data[6].split(":")[1].strip()),
        }
    except FileNotFoundError:
        return None

def write_user_data(username, data):
    with open(f"{username}.txt", "w") as file:
        file.write(f"Name: {data['name']}\n")
        file.write(f"Surname: {data['surname']}\n")
        file.write(f"Phone Number: {data['phone_number']}\n")
        file.write(f"ID Number: {data['id_number']}\n")
        file.write(f"Account Number: {data['account_number']}\n")
        file.write(f"Password: {data['password']}\n")
        file.write(f"Balance: {data['balance']}\n")

def log_transaction(username, transaction_details):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(f"{username}_transactions.txt", "a") as file:
        file.write(f"{timestamp} - {transaction_details}\n")

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')

    if os.path.exists(f"{username}.txt"):
        return jsonify({"error": "Account already exists"}), 400

    account_number = str(random.randint(100000, 999999))
    user_data = {
        "name": data.get("name"),
        "surname": data.get("surname"),
        "phone_number": data.get("phoneNumber"),
        "id_number": data.get("identityNumber"),
        "account_number": account_number,
        "password": data.get("password"),
        "balance": 0,
    }

    write_user_data(username, user_data)
    return jsonify({"message": "Account created successfully", "account_number": account_number}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    user_data = read_user_data(username)
    if not user_data or user_data['password'] != password:
        return jsonify({"error": "Invalid username or password"}), 401

    return jsonify({"message": "Login successful", "account_number": user_data['account_number']}), 200

@app.route('/dashboard/<account_number>', methods=['GET'])
def dashboard(account_number):
    for file in os.listdir():
        if not file.endswith(".txt"):
            continue
        user_data = read_user_data(file[:-4])
        if user_data and user_data['account_number'] == account_number:
            transaction_history = []
            transaction_file = f"{file[:-4]}_transactions.txt"
            if os.path.exists(transaction_file):
                with open(transaction_file, "r") as tf:
                    transaction_history = tf.readlines()
            return jsonify({
                "balance": user_data['balance'],
                "transactions": transaction_history,
            })
    return jsonify({"error": "Account not found"}), 404

@app.route('/deposit', methods=['POST'])
def deposit():
    data = request.json
    account_number = data.get('account_number')
    amount = data.get('amount')

    if not isinstance(amount, (int, float)) or amount <= 0:
        return jsonify({"error": "Deposit amount must be a positive number"}), 400

    for file in os.listdir():
        if not file.endswith(".txt"):
            continue
        user_data = read_user_data(file[:-4])
        if user_data and user_data['account_number'] == account_number:
            user_data['balance'] += amount
            write_user_data(file[:-4], user_data)
            log_transaction(file[:-4], f"Deposited {amount}")
            return jsonify({"message": f"Deposited {amount} successfully"}), 200

    return jsonify({"error": "Account not found"}), 404

@app.route('/withdraw', methods=['POST'])
def withdraw():
    data = request.json
    account_number = data.get('account_number')
    amount = data.get('amount')

    if not isinstance(amount, (int, float)) or amount <= 0:
        return jsonify({"error": "Withdrawal amount must be a positive number"}), 400

    for file in os.listdir():
        if not file.endswith(".txt"):
            continue
        user_data = read_user_data(file[:-4])
        if user_data and user_data['account_number'] == account_number:
            if user_data['balance'] < amount:
                return jsonify({"error": "Insufficient funds"}), 400

            user_data['balance'] -= amount
            write_user_data(file[:-4], user_data)
            log_transaction(file[:-4], f"Withdrew {amount}")
            return jsonify({"message": f"Withdrew {amount} successfully"}), 200

    return jsonify({"error": "Account not found"}), 404

@app.route('/transfer', methods=['POST'])
def transfer():
    data = request.get_json()
    account_number = data.get('account_number')
    amount = float(data.get('amount', 0))  
    _account_number = data.get('recipient_account_number')  
    if not self.logged_in_user:
        return jsonify({"error": "Please login first."}), 400

    if recipient_account_number not in self.users:
        return jsonify({"error": "Recipient account number not found."}), 404

    if amount <= 0: 
        return jsonify({"error": "Amount must be a positive number."}), 400

    if amount > self.logged_in_user["balance"]:
        return jsonify({"error": "Insufficient funds."}), 400
    self.logged_in_user['balance'] -= amount
    recipient_user = self.users[recipient_account_number]
    recipient_user['balance'] += amount

  
    write_user_data(file[:-4], self.users)
    log_transaction(file[:-4], f"Transferred {amount} to account number {recipient_account_number}")

    return jsonify({"message": f"Transferred {amount} to account number {recipient_account_number} successfully"}), 200


def log_transaction(username, transaction_details):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(f"{username}_transactions.txt", "a") as file:
        file.write(f"{timestamp} - {transaction_details}\n")


def read_transaction_history(username):
    transaction_file = f"{username}_transactions.txt"
    if not os.path.exists(transaction_file):
        return [] 
    with open(transaction_file, "r") as file:
        transactions = file.readlines()
    return [line.strip() for line in transactions]


@app.route('/transaction_history/<account_number>', methods=['GET'])
def transaction_history(account_number):
    try:
        username = None
        for file in os.listdir():
            if file.endswith(".txt"):
                user_data = read_user_data(file[:-4])
                if user_data and user_data['account_number'] == account_number:
                    username = file[:-4]
                    break

        if not username:
            return jsonify({"error": "Account not found"}), 404

        transactions = read_transaction_history(username)
        if not transactions:
            return jsonify({"error": "No transactions found for this account"}), 404

        return jsonify({"transactions": transactions}), 200
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500




if __name__ == '__main__':
    app.run(port=5000, debug=True)

