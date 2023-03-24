from flask import Flask, render_template, request, redirect, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from logger import TextLogger
import email_validate 
import json
import os


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///customers.db'
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)
Log = TextLogger()

@app.route("/")
def redirect_to_main():
    return redirect("/home")

@app.route("/home", methods=["GET", "POST"])
def main_page():
    return render_template("mainPage.html")

@app.route("/user/", methods=["GET"])
def user_page():
    try:
        user_name = request.args.get("user_name")
        user_email = request.args.get("user_email")
        if user_name and user_email:
            return render_template("userAuthorized.html", name=user_name, email=user_email)
        return redirect("/error")
    except Exception as err:
        Log.log(err)
        return redirect("/error")

@app.route("/error", methods=["GET"])
def error():
    return render_template("unknownError.html")

@app.route("/authorization", methods=["POST"])
def authorization():
    """Авторизация пользователя"""
    data = json.loads(request.data.decode("utf-8"))
    check_status, error, user = check_login_form(data)
    if (error == "NO"):
        try:
            name = user.name
            email = user.email
            return jsonify(status = check_status, errors=error, body={"user_email": email, "user_name": name})
        except Exception as err:
            Log.log(err)
            return jsonify(status = "ERROR", errors="UNSIGNED ERROR")
    else:
        return jsonify(status = check_status, errors=error)


@app.route("/registration", methods=["POST"])
def registration():
    """Регистрация пользователя"""
    data = json.loads(request.data.decode("utf-8"))
    check_status, error = check_reg_form(data)
    if (error == "NO"):
        try:
            user = Customer(name = data["user_name"], email = data["user_email"], password=generate_password_hash(password=data["user_pass"], method="pbkdf2:sha256", salt_length=16))
            db.session.add(user)
            db.session.commit()
            return jsonify(status = check_status, errors=error)
        except Exception as err:
            Log.log(err)
            db.session.rollback()
            return jsonify(status = "ERROR", errors="UNSIGNED ERROR")
    else:
        db.session.rollback()
        return jsonify(status = check_status, errors=error)


def check_reg_form(data):
    """Валидация формы на стороне сервера (вдруг чё)"""
    try:
        if (data["action"] == "REGISTRATION"):
            if (data["user_name"] and data["user_email"] and data["user_pass"]):
                if (Customer.query.filter_by(name=data["user_name"]).first() != None):
                    return "ERROR", "Это имя уже занято."
                if (email_validate.validate(email_address=data["user_email"]) == False):
                    return "ERROR", "Электронная почта недействительна."
                if (Customer.query.filter_by(email=data["user_email"]).first() != None):
                    return "ERROR", "Пользователь с такой же почтой<br/> уже существует."
                if (len(data["user_pass"]) <= 3):
                    return "ERROR", "Ваш пароль должен состоять<br/> более чем из трёх символов."
                return "OK", "NO"       
            else:
                return "ERROR", "Заполните все поля."
    except Exception as err:
        Log.log(err)
        return "ERROR", "Неверный формат входящих данных. Свяжитесь с нами по адресу: example@gmail.com"
    

def check_login_form(data):
    try:
        if (data["action"] == "AUTHORIZATION"):
            if (data["user_email"] and data["user_pass"]):
                if (Customer.query.filter_by(email=data["user_email"]).first() == None):
                    return "ERROR", "Пользователя с такой почтой<br/> не существует.", None
                else:
                    user = Customer.query.filter_by(email=data["user_email"]).first()
                if (check_password_hash(user.password, data["user_pass"]) == False):
                    return "ERROR", "Пароль не верен.", None
                return "OK", "NO", user       
            else:
                return "ERROR", "Заполните все поля.", None
    except Exception as err:
        Log.log(err)
        return "ERROR", "Неверный формат входящих<br/> данных. Свяжитесь с нами<br/> по адресу: example@gmail.com", None



class Customer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(500), nullable=False)
    regDate = db.Column(db.DateTime, default=datetime.utcnow())

    def __repr__(self):
        return f"<customers {self.id}>"


if __name__ == "__main__":
    app.run(debug=True)
