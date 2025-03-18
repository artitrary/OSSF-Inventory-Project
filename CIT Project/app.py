from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from sqlalchemy import text


# Initialize Flask app
app = Flask(__name__)

# Configure PostgreSQL database URI
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://ossf_inventory:C1T0ssf!@drhscit.org:5432/ossfdb'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize SQLAlchemy
db = SQLAlchemy(app)

# Initialize Flask-Migrate
migrate = Migrate(app, db)

# Define Models

class MaintenanceLog(db.Model):
    __tablename__ = 'maintenancelog'

    maintenanceid = db.Column(db.Integer, primary_key=True)
    systemid = db.Column(db.Integer, db.ForeignKey('system.systemid'))
    projectid = db.Column(db.Integer, db.ForeignKey('project.projectid'))
    date = db.Column(db.Date, nullable=False)
    description = db.Column(db.String(255), nullable=False)
    scheduleid = db.Column(db.Integer, db.ForeignKey('schedule.scheduleid'))

    def __repr__(self):
        return f"<MaintenanceLog {self.maintenanceid}>"


class System(db.Model):
    __tablename__ = 'system'
    systemid = db.Column(db.Integer, primary_key=True)
    systemname = db.Column(db.String(100))
    aerator = db.Column(db.String(100))
    pumpid = db.Column(db.Integer, db.ForeignKey('pump.pumpid'))
    description = db.Column(db.String(255))
    additionalcomp = db.Column(db.String(255))
    manufacturer = db.Column(db.String(100))
    gpd = db.Column(db.Float)
    manualname = db.Column(db.String(255))
    manualpath = db.Column(db.String(255))

    def __repr__(self):
        return f"<System {self.systemid}>"

class Project(db.Model):
    __tablename__ = 'project'
    projectid = db.Column(db.Integer, primary_key=True)
    projectname = db.Column(db.String(100))
    description = db.Column(db.String(255))
    funded = db.Column(db.Boolean)
    startdate = db.Column(db.Date)
    enddate = db.Column(db.Date)

    def __repr__(self):
        return f"<Project {self.projectid}>"

class Schedule(db.Model):
    __tablename__ = 'schedule'
    scheduleid = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date)
    description = db.Column(db.String(255))

    def __repr__(self):
        return f"<Schedule {self.scheduleid}>"

class Pump(db.Model):
    __tablename__ = 'pump'
    pumpid = db.Column(db.Integer, primary_key=True)
    model = db.Column(db.String(100))
    quantity = db.Column(db.Integer)
    partnumber = db.Column(db.String(50))
    brand = db.Column(db.String(100))
    manualname = db.Column(db.String(255))
    manualpath = db.Column(db.String(255))

    def __repr__(self):
        return f"<Pump {self.pumpid}>"

# Routes to get data in JSON format
@app.route('/get_maintenance_data', methods=['GET'])
def get_maintenance_data():
    maintenance_logs = MaintenanceLog.query.all()
    data = [{
        "MaintenanceID": log.maintenanceid,
        "SystemID": log.systemid,
        "ProjectID": log.projectid,
        "MaintenanceDate": log.date.strftime("%Y-%m-%d"),
        "Description": log.description,
        "ScheduleID": log.scheduleid
    } for log in maintenance_logs]
    return jsonify(data)

@app.route('/get_system_data', methods=['GET'])
def get_system_data():
    systems = System.query.all()
    data = [{
        "SystemID": system.systemid,
        "SystemName": system.systemname,
        "Aerator": system.aerator,
        "PumpID": system.pumpid,
        "Description": system.description,
        "AdditionalComp": system.additionalcomp,
        "Manufacturer": system.manufacturer,
        "GPD": system.gpd,
        "Manual": system.manualname,
        "manual_path": system.manualpath
    } for system in systems]
    return jsonify(data)

@app.route('/get_project_data', methods=['GET'])
def get_project_data():
    projects = Project.query.all()
    data = [{
        "ProjectID": project.projectid,
        "ProjectName": project.projectname,
        "Description": project.description,
        "Funded": project.funded,
        "StartDate": project.startdate.strftime("%Y-%m-%d"),
        "EndDate": project.enddate.strftime("%Y-%m-%d")
    } for project in projects]
    return jsonify(data)

@app.route('/get_schedule_data', methods=['GET'])
def get_schedule_data():
    schedules = Schedule.query.all()
    data = [{
        "ScheduleID": schedule.scheduleid,
        "Date": schedule.date.strftime("%Y-%m-%d"),
        "Description": schedule.description
    } for schedule in schedules]
    return jsonify(data)

@app.route('/get_pump_data', methods=['GET'])
def get_pump_data():
    pumps = Pump.query.all()
    data = [{
        "PumpID": pump.pumpid,
        "Model": pump.model,
        "Quantity": pump.quantity,
        "PartNumber": pump.partnumber,
        "Brand": pump.brand,
        "Manual": pump.manualname,
        "manual_path": pump.manualpath
    } for pump in pumps]
    return jsonify(data)

# Routes to add data
@app.route('/add_maintenance_data', methods=['POST'])
def add_maintenance_data():
    data = request.get_json()

    systemid = data.get('SystemID')
    projectid = data.get('ProjectID')
    date = data.get('Date')
    description = data.get('Description')
    scheduleid = data.get('ScheduleID')

    # Ensure the required fields are provided
    if not systemid or not projectid or not date or not description or not scheduleid:
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        # Create a new log and add to database
        new_log = MaintenanceLog(
            systemid=systemid,
            projectid=projectid,
            date=date,
            description=description,
            scheduleid=scheduleid
        )
        db.session.add(new_log)
        db.session.commit()

        return jsonify({'message': 'Maintenance data added successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500  # Return the error message from the exception


@app.route('/add_system_data', methods=['POST'])
def add_system_data():
    data = request.get_json()
    new_system = System(
        systemname=data['SystemName'],
        aerator=data['Aerator'],
        pumpid=data['PumpID'],
        description=data['Description'],
        additionalcomp=data['AdditionalComp'],
        manufacturer=data['Manufacturer'],
        gpd=data['GPD'],
        manual=data['Manual'],
        manual_path=data['manual_path']
    )
    db.session.add(new_system)
    db.session.commit()
    return jsonify({'message': 'System data added successfully'}), 200

@app.route('/add_project_data', methods=['POST'])
def add_project_data():
    data = request.get_json()
    new_project = Project(
        projectname=data['ProjectName'],
        description=data['Description'],
        funded=data['Funded'],
        startdate=data['StartDate'],
        enddate=data['EndDate']
    )
    db.session.add(new_project)
    db.session.commit()
    return jsonify({'message': 'Project data added successfully'}), 200

@app.route('/add_schedule_data', methods=['POST'])
def add_schedule_data():
    data = request.get_json()
    new_schedule = Schedule(
        date=data['Date'],
        description=data['Description']
    )
    db.session.add(new_schedule)
    db.session.commit()
    return jsonify({'message': 'Schedule data added successfully'}), 200

@app.route('/add_pump_data', methods=['POST'])
def add_pump_data():
    data = request.get_json()
    new_pump = Pump(
        model=data['Model'],
        quantity=data['Quantity'],
        partnumber=data['PartNumber'],
        brand=data['Brand'],
        manual=data['Manual'],
        manualpath=data['manualpath']
    )
    db.session.add(new_pump)
    db.session.commit()
    return jsonify({'message': 'Pump data added successfully'}), 200

@app.route('/update_maintenance_data', methods=['POST'])
@app.route('/update_maintenance_data', methods=['POST'])
def update_maintenance_data():
    try:
        data = request.get_json()  # Get the data from the frontend
        maintenance_id = data.get('maintenanceID')
        project_id = data.get('projectID')
        date = data.get('date')
        description = data.get('description')
        schedule_id = data.get('scheduleID')

        # Validate maintenanceID
        if not maintenance_id:
            return jsonify({'error': 'maintenanceID is required'}), 400

        # Find the record in the database
        maintenance_log = MaintenanceLog.query.get(maintenance_id)
        if not maintenance_log:
            return jsonify({'error': 'Maintenance record not found'}), 404

        # Update fields only if they are provided
        if project_id:
            maintenance_log.projectid = project_id
        if date:
            maintenance_log.date = date
        if description:
            maintenance_log.description = description
        if schedule_id:
            maintenance_log.scheduleid = schedule_id

        db.session.commit()  # Commit the changes

        return jsonify({'message': 'Maintenance data updated successfully'}), 200

    except Exception as e:
        app.logger.error(f"Error updating maintenance data: {e}")
        return jsonify({'error': str(e)}), 500


def reset_sequence(table_name, column_name):
    with db.engine.connect() as connection:
        query = text(f"""
            SELECT setval(pg_get_serial_sequence(:table_name, :column_name),
                          COALESCE(MAX({column_name}), 1), false)
            FROM {table_name};
        """)
        connection.execute(query, {'table_name': table_name, 'column_name': column_name})


@app.route('/delete_project_rows', methods=['POST'])
def delete_project_rows():
    try:
        data = request.get_json()
        ids = data.get('ids')

        if not ids:
            return jsonify({'error': 'No IDs provided'}), 400

        # Delete projects matching the IDs
        deleted = Project.query.filter(Project.projectid.in_(ids)).delete(synchronize_session=False)
        db.session.commit()  # Commit the deletion

        # Reset the serial sequence after deletion using direct connection to the database
        reset_sequence('project','projectid');

        if deleted == 0:
            return jsonify({'error': 'No matching rows found'}), 404

        return jsonify({'success': True, 'message': f'{deleted} rows deleted'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f"An error occurred: {str(e)}"}), 500
@app.route('/delete_pump_rows', methods=['POST'])
def delete_pump_rows():
    try:
        data = request.get_json()
        ids = data.get('ids')

        if not ids:
            return jsonify({'error': 'No IDs provided'}), 400

        # Delete pumps matching the IDs
        deleted = Pump.query.filter(Pump.pumpid.in_(ids)).delete(synchronize_session=False)
        db.session.commit()  # Commit the deletion

        # Reset the serial sequence for the pump table after deletion
        reset_sequence('pump', 'pumpid')

        if deleted == 0:
            return jsonify({'error': 'No matching rows found'}), 404

        return jsonify({'success': True, 'message': f'{deleted} rows deleted'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f"An error occurred: {str(e)}"}), 500
@app.route('/delete_schedule_rows', methods=['POST'])
def delete_schedule_rows():
    try:
        data = request.get_json()
        ids = data.get('ids')

        if not ids:
            return jsonify({'error': 'No IDs provided'}), 400

        # Delete schedules matching the IDs
        deleted = Schedule.query.filter(Schedule.scheduleid.in_(ids)).delete(synchronize_session=False)
        db.session.commit()  # Commit the deletion

        # Reset the serial sequence for the schedule table after deletion
        reset_sequence('schedule', 'scheduleid')

        if deleted == 0:
            return jsonify({'error': 'No matching rows found'}), 404

        return jsonify({'success': True, 'message': f'{deleted} rows deleted'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f"An error occurred: {str(e)}"}), 500
@app.route('/delete_system_rows', methods=['POST'])
def delete_system_rows():
    try:
        data = request.get_json()
        ids = data.get('ids')

        if not ids:
            return jsonify({'error': 'No IDs provided'}), 400

        # Delete systems matching the IDs
        deleted = System.query.filter(System.systemid.in_(ids)).delete(synchronize_session=False)
        db.session.commit()  # Commit the deletion

        # Reset the serial sequence for the system table after deletion
        reset_sequence('system', 'systemid')

        if deleted == 0:
            return jsonify({'error': 'No matching rows found'}), 404

        return jsonify({'success': True, 'message': f'{deleted} rows deleted'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f"An error occurred: {str(e)}"}), 500

@app.route('/')
def home():
    return render_template('Maintenance.html')

@app.route('/System')  # Flask route
def system():
    return render_template('System.html')

@app.route('/Pump')
def pump():
    return render_template('Pump.html')

@app.route('/Schedule')
def schedule():
    return render_template('Schedule.html')

@app.route('/Project')
def project():
    return render_template('Project.html')

if __name__ == '__main__':
    app.run(debug=True)


