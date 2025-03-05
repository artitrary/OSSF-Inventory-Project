from flask import Flask, render_template, jsonify
import pyodbc
import os
os.chdir(os.path.dirname(os.path.abspath(__file__)))


app = Flask(__name__)

# Path to Microsoft Access databa   se
db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "database.accdb")

def get_connection():
    """Establish connection to the Access database."""
    return pyodbc.connect(
        r"DRIVER={Microsoft Access Driver (*.mdb, *.accdb)};DBQ=" + db_path
    )

@app.route("/")
def index():
    """Render the frontend page."""
    return render_template("Schedule.html")  # No data passed here

@app.route("/get_data", methods=["GET"])
def get_data():
    """Fetch all rows from the Schedule table and return as JSON."""
    conn = get_connection()
    cursor = conn.cursor()

    # Query the database
    cursor.execute("SELECT * FROM Schedule")
    columns = [column[0] for column in cursor.description]  # Get column names
    data = [dict(zip(columns, row)) for row in cursor.fetchall()]  # Convert rows to dictionaries

    cursor.close()
    conn.close()

    return jsonify(data)  # Send JSON response

if __name__ == "__main__":
    app.run(debug=True)
