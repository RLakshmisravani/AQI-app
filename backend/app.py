from flask import Flask, request, jsonify
from flask_cors import CORS   # type: ignore
import pandas as pd
import joblib
from auth import init_user_db, register_user, login_user
from emailer import send_alerts_for_city, send_welcome_email

app = Flask(__name__)
CORS(app)

# 🔹 Initialize user database
init_user_db()

# 🔹 Load dataset and models
df = pd.read_csv("data/final_merged_aqi_weather.csv")
df.columns = df.columns.str.strip().str.lower()

model = joblib.load("model/xgboost_aqi_model.pkl")
model_24h = joblib.load("model/xgb_forecast_24h.pkl")
model_48h = joblib.load("model/xgb_forecast_48h.pkl")
model_72h = joblib.load("model/xgb_forecast_72h.pkl")


# 🔹 Register user
@app.route("/auth/register", methods=["POST"])
def register():
    data = request.get_json()
    required = ["name", "email", "password", "city", "state"]
    if not all(field in data and data[field] for field in required):
        return jsonify({"error": "Missing required fields"}), 400

    success, msg = register_user(
        data["name"], data["email"], data["password"], data["city"], data["state"]
    )
    if success:
        send_welcome_email(data["email"], data["name"])
        return jsonify({"message": msg})
    return jsonify({"error": msg}), 400


# 🔹 Login user
@app.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data.get("email") or not data.get("password"):
        return jsonify({"error": "Missing email or password"}), 400

    success, result = login_user(data["email"], data["password"])
    if success:
        return jsonify({"message": "Login successful", "user": result})
    return jsonify({"error": result}), 401


# 🔹 Predict AQI from custom weather input
@app.route("/predict-from-weather", methods=["POST"])
def predict_from_weather():
    try:
        data = request.get_json()
        features = [[
            float(data["Precipitation"]),
            float(data["Temp_Max"]),
            float(data["Temp_Min"]),
            float(data["Wind_Speed"]),
            float(data["Humidity_Mean"]),
            float(data["Humidity_Max"]),
            float(data["Humidity_Min"]),
            float(data["Dew_Point"])
        ]]
        prediction = model.predict(features)[0]
        return jsonify({"predicted_aqi": round(float(prediction), 2)})
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# 🔹 Predict AQI using dataset (city & date)
@app.route("/predict-from-dataset", methods=["GET"])
def predict_from_dataset():
    city = request.args.get("city")
    date = request.args.get("date")
    if not city or not date:
        return jsonify({"error": "Please provide both 'city' and 'date'."}), 400

    row = df[(df["city"].str.lower() == city.lower()) & (df["date"] == date)]
    if row.empty:
        return jsonify({"error": "Data not found for given city and date."}), 404

    features = row[[
        "precipitation", "temp_max", "temp_min", "wind_speed",
        "humidity_mean", "humidity_max", "humidity_min", "dew_point"
    ]].values

    prediction = model.predict(features)[0]
    return jsonify({
        "city": city,
        "date": date,
        "predicted_aqi": round(float(prediction), 2)
    })


# 🔹 AQI Forecast: 24h / 48h / 72h
@app.route("/forecast", methods=["GET"])
def forecast_aqi():
    city = request.args.get("city")
    date = request.args.get("date")
    if not city or not date:
        return jsonify({"error": "Please provide both 'city' and 'date'."}), 400

    row = df[(df["city"].str.lower() == city.lower()) & (df["date"] == date)]
    if row.empty:
        return jsonify({"error": "Data not available for the given city and date."}), 404

    features = row[[
        "precipitation", "temp_max", "temp_min", "wind_speed",
        "humidity_mean", "humidity_max", "humidity_min", "dew_point"
    ]].values

    try:
        forecast_24h = model_24h.predict(features)[0]
        forecast_48h = model_48h.predict(features)[0]
        forecast_72h = model_72h.predict(features)[0]

        # 🔸 Send alert if AQI increases significantly
        prev_rows = df[(df["city"].str.lower() == city.lower()) & (df["date"] < date)]
        if not prev_rows.empty:
            prev_aqi = float(prev_rows.iloc[-1]["index value"])
            if max(forecast_24h, forecast_48h, forecast_72h) > prev_aqi + 20:
                send_alerts_for_city(city, max(forecast_24h, forecast_48h, forecast_72h))

        return jsonify({
            "city": city,
            "base_date": date,
            "forecast_24h": round(float(forecast_24h), 2),
            "forecast_48h": round(float(forecast_48h), 2),
            "forecast_72h": round(float(forecast_72h), 2)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 🔹 Historical AQI (June 2025 only)
@app.route("/history", methods=["GET"])
def get_city_history():
    city = request.args.get("city")
    if not city:
        return jsonify({"error": "City not provided"}), 400

    city_data = df[df["city"].str.lower() == city.lower()]
    city_data = city_data[city_data["date"].str.startswith("2025-06")].sort_values("date")

    if city_data.empty:
        return jsonify([])

    return jsonify([
        {"date": row["date"], "aqi": float(row["index value"])}
        for _, row in city_data.iterrows()
    ])


# 🔹 Return all city names
@app.route("/cities", methods=["GET"])
def get_cities():
    return jsonify(sorted(df["city"].dropna().unique().tolist()))


# 🔹 Latest AQI for all cities
@app.route("/latest-aqi", methods=["GET"])
def get_latest_aqi():
    latest_data = []
    for city in df["city"].dropna().unique():
        city_df = df[df["city"].str.lower() == city.lower()].sort_values("date")
        if not city_df.empty:
            last_row = city_df.iloc[-1]
            latest_data.append({
                "city": city,
                "aqi": round(float(last_row["index value"]), 2),
                "date": last_row["date"]
            })
    return jsonify(latest_data)


# 🔹 Root
@app.route("/")
def home():
    return "✅ AQI Forecast API is running!"


if __name__ == "__main__":
    app.run(debug=True)
