from flask import Flask, jsonify
from backend.app.routes import api
from backend.db.db import init_db


def create_app():
    init_db()

    app = Flask(__name__)

    # Register API blueprint
    app.register_blueprint(api)

    # Root route (so / doesn't 404)
    @app.route("/")
    def home():
        return jsonify({
            "status": "AI Intrusion Detection API running",
            "endpoints": [
                "/api/stream",
                "/api/events",
                "/api/stats"
            ]
        })

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
