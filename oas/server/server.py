from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
from auth import auth_bp, db  # import Blueprint and db

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root@localhost:3306/aos'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
app.register_blueprint(auth_bp)

@app.route('/test-db')
def test_db():
    try:
        with app.app_context():
            db.session.execute(text('SELECT 1'))
        return jsonify({"status": "success", "message": "Database connection successful!"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

if __name__ == "__main__":
    app.run(port=8000, debug=True)
