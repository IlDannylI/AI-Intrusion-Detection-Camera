from flask import Flask
from backend.app.routes import api
from backend.db.db import init_db


def create_app():
    init_db()
    app = Flask(__name__)
    app.register_blueprint(api)
    return app


def main():
    app = create_app()
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )


if __name__ == "__main__":
    main()
