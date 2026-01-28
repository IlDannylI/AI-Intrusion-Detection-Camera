from flask import Flask
from .routes import api
from .config import Config


def create_app():
    app = Flask(__name__)
    app.register_blueprint(api)
    return app


def main():
    app = create_app()
    app.run(
        host="0.0.0.0",
        port=Config.STREAM_PORT,
        debug=True
    )


if __name__ == "__main__":
    main()
