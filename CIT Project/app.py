from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from sqlalchemy import create_engine, text
from sqlalchemy import Integer, String, Date, Boolean, Float, Text
from sqlalchemy.inspection import inspect


from sqlalchemy import text
import os, logging, subprocess  

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


# Initialize Flask app
app = Flask(__name__)

# Configure PostgreSQL database URI
# Use environment variable for the database URL
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Use environment variable for the database URL
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://ossf_inventory:C1T0ssf!@drhscit.org:5432/ossfdb')


app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://ossf_inventory:C1T0ssf!@drhscit.org:5432/ossfdb'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize SQLAlchemy
db = SQLAlchemy(app)

# Initialize Flask-Migrate
migrate = Migrate(app, db)

engine = create_engine(app.config['SQLALCHEMY_DATABASE_URI'])

# Define Models

class MaintenanceLog(db.Model):
    __tablename__ = 'maintenancelog'

    maintenanceid = db.Column(db.Integer, primary_key=True)
    systemid = db.Column(db.Integer, db.ForeignKey('system.systemid'))
    projectid = db.Column(db.Integer, db.ForeignKey('project.projectid'))
    date = db.Column(db.Date, nullable=False)
    description = db.Column(db.String(255), nullable=False)
    scheduleid = db.Column(db.Integer, db.ForeignKey('schedule.scheduleid'))
    type=db.Column(db.Integer)

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
    manualname = db.Column(db.String(255))  # Updated here
    manualpath = db.Column(db.String(255))

    def __repr__(self):
        return f"<System {self.systemid}>"


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
    manualname = db.Column(db.String(255))  # Updated here
    manualpath = db.Column(db.String(255))

    def __repr__(self):
        return f"<Pump {self.pumpid}>"


# Routes to get data in JSON format
@app.route('/get_maintenance_data', methods=['GET'])
def get_maintenance_data():
    try:
        # Fetching maintenance logs
        maintenance_logs = MaintenanceLog.query.all()

        # Dynamically get column names from the table schema
        columns = [column.name for column in MaintenanceLog.__table__.columns]

        # Debugging: print the columns to ensure the new column is included
        app.logger.info(f"Columns in MaintenanceLog: {columns}")

        # Gathering data dynamically based on column names
        data = []
        for log in maintenance_logs:
            log_data = {col: getattr(log, col) for col in columns}
            data.append(log_data)

        return jsonify({"columns": columns, "data": data})
    except Exception as e:
        app.logger.error(f"Error fetching maintenance data: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/get_system_data', methods=['GET'])
@app.route('/get_system_data', methods=['GET'])
def get_system_data():
    try:
        systems = System.query.all()
        columns = [column.name for column in System.__table__.columns]
        app.logger.info(f"Columns in System: {columns}")
        data = [{col: getattr(system, col) for col in columns} for system in systems]
        return jsonify({"columns": columns, "data": data})
    except Exception as e:
        app.logger.error(f"Error fetching system data: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/get_project_data', methods=['GET'])
def get_project_data():
    try:
        projects = Project.query.all()
        columns = [column.name for column in Project.__table__.columns]
        app.logger.info(f"Columns in Project: {columns}")
        data = [{col: getattr(project, col) for col in columns} for project in projects]
        return jsonify({"columns": columns, "data": data})
    except Exception as e:
        app.logger.error(f"Error fetching project data: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/get_schedule_data', methods=['GET'])
def get_schedule_data():
    try:
        schedules = Schedule.query.all()
        columns = [column.name for column in Schedule.__table__.columns]
        app.logger.info(f"Columns in Schedule: {columns}")
        data = [{col: getattr(schedule, col) for col in columns} for schedule in schedules]
        return jsonify({"columns": columns, "data": data})
    except Exception as e:
        app.logger.error(f"Error fetching schedule data: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/get_pump_data', methods=['GET'])
def get_pump_data():
    try:
        pumps = Pump.query.all()
        columns = [column.name for column in Pump.__table__.columns]
        app.logger.info(f"Columns in Pump: {columns}")
        data = [{col: getattr(pump, col) for col in columns} for pump in pumps]
        return jsonify({"columns": columns, "data": data})
    except Exception as e:
        app.logger.error(f"Error fetching pump data: {e}")
        return jsonify({'error': str(e)}), 500



# Routes to add data
@app.route('/add_maintenance_data', methods=['POST'])
def add_maintenance_data():
    data = request.get_json()
    logger.info("Received Data: %s", data)  # Log received data

    try:
        # Get all column names except the primary key (maintenanceid)
        columns = [column.name for column in inspect(MaintenanceLog).columns if column.name != "maintenanceid"]
        logger.debug("Detected columns for insertion: %s", columns)

        # Build a dictionary of only the relevant columns
        new_data = {col: data.get(col) for col in columns}
        logger.info("Extracted Data for Database Insert: %s", new_data)

        # Validate required fields
        missing_fields = [col for col, value in new_data.items() if value is None]
        if missing_fields:
            logger.warning("Missing required fields: %s", missing_fields)
            return jsonify({'error': f'Missing required fields: {missing_fields}'}), 400

        # Convert date format if needed
        if 'date' in new_data:
           
            from datetime import datetime
            try:
                # Try multiple date formats
                new_data['date'] = datetime.strptime(new_data['date'], "%Y-%m-%d").date()
            except ValueError:
                try:
                    new_data['date'] = datetime.strptime(new_data['date'], "%m/%d/%y").date()
                except ValueError as ve:
                    logger.error("Date conversion error: %s", str(ve))
                    return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD or MM/DD/YY'}), 400


        # Create new log entry dynamically
        new_log = MaintenanceLog(**new_data)  
        db.session.add(new_log)
        db.session.commit()
        logger.info("Maintenance data added successfully with ID: %s", new_log.maintenanceid)

        return jsonify({'message': 'Maintenance data added successfully'}), 200

    except Exception as e:
        logger.error("Error while inserting maintenance data: %s", str(e))
        return jsonify({'error': str(e)}), 500

@app.route('/add_system_data', methods=['POST'])
def add_system_data():
    data = request.get_json()
    logger.info("Received Data: %s", data)  # Log received data

    try:
        # Get all column names except the primary key (systemid)
        columns = [column.name for column in inspect(System).columns if column.name != "systemid"]
        logger.debug("Detected columns for insertion: %s", columns)

        # Build a dictionary of only the relevant columns
        new_data = {col: data.get(col) for col in columns}
        logger.info("Extracted Data for Database Insert: %s", new_data)

        # Validate required fields
        missing_fields = [col for col, value in new_data.items() if value is None]
        if missing_fields:
            logger.warning("Missing required fields: %s", missing_fields)
            return jsonify({'error': f'Missing required fields: {missing_fields}'}), 400

        # Create new system entry dynamically
        new_system = System(**new_data)
        db.session.add(new_system)
        db.session.commit()
        logger.info("System data added successfully with ID: %s", new_system.systemid)

        return jsonify({'message': 'System data added successfully'}), 200

    except Exception as e:
        logger.error("Error while inserting system data: %s", str(e))
        return jsonify({'error': str(e)}), 500


@app.route('/add_project_data', methods=['POST'])
def add_project_data():
    try:
        data = request.get_json()
        logger.info(f"Received project data: {data}")

        # Convert 'funded' to a Boolean if it exists
        if 'funded' in data:
            if isinstance(data['funded'], str):
                data['funded'] = data['funded'].lower() in ['true', '1', 'yes']
            else:
                data['funded'] = bool(data['funded'])

        logger.info(f"Processed project data: {data}")

        new_project = Project(**data)
        db.session.add(new_project)
        db.session.commit()

        logger.info("Project added successfully!")
        return jsonify({'message': 'Project added successfully!'})

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error while inserting project data: {e}", exc_info=True)
        return jsonify({'error': str(e)}), 500


@app.route('/add_schedule_data', methods=['POST'])
def add_schedule_data():
    data = request.get_json()
    logger.info("Received Data: %s", data)  # Log received data

    try:
        # Get all column names except the primary key (scheduleid)
        columns = [column.name for column in inspect(Schedule).columns if column.name != "scheduleid"]
        logger.debug("Detected columns for insertion: %s", columns)

        # Build a dictionary of only the relevant columns
        new_data = {col: data.get(col) for col in columns}
        logger.info("Extracted Data for Database Insert: %s", new_data)

        # Validate required fields
        missing_fields = [col for col, value in new_data.items() if value is None]
        if missing_fields:
            logger.warning("Missing required fields: %s", missing_fields)
            return jsonify({'error': f'Missing required fields: {missing_fields}'}), 400

        # Create new schedule entry dynamically
        new_schedule = Schedule(**new_data)
        db.session.add(new_schedule)
        db.session.commit()
        logger.info("Schedule data added successfully with ID: %s", new_schedule.scheduleid)

        return jsonify({'message': 'Schedule data added successfully'}), 200

    except Exception as e:
        logger.error("Error while inserting schedule data: %s", str(e))
        return jsonify({'error': str(e)}), 500


@app.route('/add_pump_data', methods=['POST'])
def add_pump_data():
    data = request.get_json()
    logger.info("Received Data: %s", data)  # Log received data

    try:
        # Get all column names except the primary key (pumpid)
        columns = [column.name for column in inspect(Pump).columns if column.name != "pumpid"]
        logger.debug("Detected columns for insertion: %s", columns)

        # Build a dictionary of only the relevant columns
        new_data = {col: data.get(col) for col in columns}
        logger.info("Extracted Data for Database Insert: %s", new_data)

        # Validate required fields
        missing_fields = [col for col, value in new_data.items() if value is None]
        if missing_fields:
            logger.warning("Missing required fields: %s", missing_fields)
            return jsonify({'error': f'Missing required fields: {missing_fields}'}), 400

        # Create new pump entry dynamically
        new_pump = Pump(**new_data)
        db.session.add(new_pump)
        db.session.commit()
        logger.info("Pump data added successfully with ID: %s", new_pump.pumpid)

        return jsonify({'message': 'Pump data added successfully'}), 200

    except Exception as e:
        logger.error("Error while inserting pump data: %s", str(e))
        return jsonify({'error': str(e)}), 500

@app.route('/update_maintenance_data', methods=['POST'])
def update_maintenance_data():
    try:
        updated_data = request.get_json()
        maintenance_id = updated_data.get('maintenanceID')

        # Query for the row by maintenanceID
        maintenance = MaintenanceLog.query.get(maintenance_id)
        
        if not maintenance:
            return jsonify({'error': 'Maintenance ID not found'}), 404
        
        # Update the fields
        for column, value in updated_data.items():
            if column != 'maintenanceID':  # Skip updating maintenanceID
                setattr(maintenance, column, value)

        db.session.commit()  # Commit the changes to the database

        return jsonify({'message': 'Maintenance data updated successfully'})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/update_system_data', methods=['POST'])
def update_system_data():
    try:
        updated_data = request.get_json()  # Get the updated data from the client
        system_id = updated_data.get('system_id')  # Get system_id from the incoming data
        
        logger.info(f"Received update request for system_id: {system_id}")

        # Ensure that the system exists
        system = System.query.get(system_id)  # Assuming 'System' is your model

        if not system:
            logger.error(f"System with ID {system_id} not found.")
            return jsonify({'error': 'System not found'}), 404

        # Update the fields dynamically
        for column, value in updated_data.items():
            if column.lower() != 'system_id':  # Skip updating system_id
                setattr(system, column, value)  # Update the field
                logger.debug(f"Updated {column} to {value} for system_id {system_id}")

        db.session.commit()  # Commit the changes to the database
        logger.info(f"System data with system_id {system_id} updated successfully.")

        return jsonify({'message': 'System data updated successfully'})

    except Exception as e:
        db.session.rollback()  # Rollback in case of error
        logger.error(f"Error occurred while updating system data: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/update_project_data', methods=['POST'])
def update_project_data():
    try:
        updated_data = request.get_json()  # Get the updated data from the client
        project_id = updated_data.get('project_id')  # Get ProjectID from the incoming data

        if not project_id:
            logger.error("Project ID is missing or invalid.")
            return jsonify({'error': 'Project ID is required'}), 400  # Return an error if project_id is missing

        logger.info(f"Received update request for project_id: {project_id}")

        # Query for the project by ProjectID
        project = Project.query.get(project_id)

        if not project:
            logger.error(f"Project with ID {project_id} not found.")
            return jsonify({'error': 'Project not found'}), 404

        # Update the fields dynamically
        for column, value in updated_data.items():
            if column.lower() != 'project_id':  # Skip updating ProjectID
                setattr(project, column, value)  # Update the field
                logger.debug(f"Updated {column} to {value} for project_id {project_id}")

        db.session.commit()  # Commit the changes to the database
        logger.info(f"Project data with project_id {project_id} updated successfully.")

        return jsonify({'message': 'Project data updated successfully'})

    except Exception as e:
        db.session.rollback()  # Rollback in case of error
        logger.error(f"Error occurred while updating project data: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/update_pump_data', methods=['POST'])
def update_pump_data():
    try:
        updated_data = request.get_json()  # Get the updated data from the client
        pump_id = updated_data.get('PumpID')  # Get PumpID from the incoming data
        
        logger.info(f"Received update request for pump_id: {pump_id}")

        # Query for the pump by PumpID
        pump = Pump.query.get(pump_id)

        if not pump:
            logger.error(f"Pump with ID {pump_id} not found.")
            return jsonify({'error': 'Pump not found'}), 404

        # Update the fields dynamically
        for column, value in updated_data.items():
            if column.lower() != 'pumpid':  # Skip updating PumpID
                setattr(pump, column, value)  # Update the field
                logger.debug(f"Updated {column} to {value} for pump_id {pump_id}")

        db.session.commit()  # Commit the changes to the database
        logger.info(f"Pump data with pump_id {pump_id} updated successfully.")

        return jsonify({'message': 'Pump data updated successfully'})

    except Exception as e:
        db.session.rollback()  # Rollback in case of error
        logger.error(f"Error occurred while updating pump data: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/update_schedule_data', methods=['POST'])
def update_schedule_data():
    try:
        updated_data = request.get_json()
        schedule_id = updated_data.get('ScheduleID')

        # Query for the schedule by ScheduleID
        schedule = Schedule.query.get(schedule_id)

        if not schedule:
            return jsonify({'error': 'Schedule not found'}), 404

        # Update the fields dynamically
        for column, value in updated_data.items():
            if column != 'scheduleid':  # Skip updating ScheduleID
                setattr(schedule, column, value)

        db.session.commit()  # Commit the changes to the database

        return jsonify({'message': 'Schedule data updated successfully'})

    except Exception as e:
        db.session.rollback()
        print("Error:", str(e))
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
            logging.warning('No IDs provided in the request')
            return jsonify({'error': 'No IDs provided'}), 400

        logging.info(f'Received request to delete rows with IDs: {ids}')

        # Delete projects matching the IDs
        deleted = Project.query.filter(Project.projectid.in_(ids)).delete(synchronize_session=False)
        db.session.commit()  # Commit the deletion

        # Reset the serial sequence after deletion
        reset_sequence('project', 'projectid')

        if deleted == 0:
            logging.warning(f'No rows found for the IDs: {ids}')
            return jsonify({'error': 'No matching rows found'}), 404

        logging.info(f'{deleted} rows deleted successfully with IDs: {ids}')
        return jsonify({'success': True, 'message': f'{deleted} rows deleted'}), 200

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error occurred while deleting rows: {str(e)}")
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
            logger.warning('No IDs provided in the request.')
            return jsonify({'error': 'No IDs provided'}), 400

        # Delete systems matching the IDs
        deleted = System.query.filter(System.systemid.in_(ids)).delete(synchronize_session=False)
        db.session.commit()  # Commit the deletion

        # Reset the serial sequence for the system table after deletion
        reset_sequence('system', 'systemid')

        if deleted == 0:
            logger.info('No matching rows found for deletion.')
            return jsonify({'error': 'No matching rows found'}), 404

        logger.info(f'{deleted} rows deleted successfully.')
        return jsonify({'success': True, 'message': f'{deleted} rows deleted'}), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"An error occurred during deletion: {str(e)}", exc_info=True)
        return jsonify({'error': f"An error occurred: {str(e)}"}), 500

@app.route('/add_column', methods=['POST'])
def add_column():
    try:
        data = request.get_json()
        table_name = data.get('table_name')
        column_name = data.get('column_name')
        column_type = data.get('column_type')

        if not table_name or not column_name or not column_type:
            return jsonify({'error': 'Invalid column data'}), 400

        # Create the SQL query to add the column
        query = text(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type}")

        # Execute the raw SQL query
        db.session.execute(query)
        db.session.commit()

        return jsonify({'message': f'Column {column_name} added successfully.'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
def get_column_type(column_obj):
    column_type = column_obj.type

    if isinstance(column_type, Integer):
        return "INTEGER"
    elif isinstance(column_type, String):
        return f"VARCHAR({column_type.length})" if column_type.length else "VARCHAR"
    elif isinstance(column_type, Text):
        return "TEXT"
    elif isinstance(column_type, Date):
        return "DATE"
    elif isinstance(column_type, Boolean):
        return "BOOLEAN"
    elif isinstance(column_type, Float):
        return "FLOAT"
    else:
        return "UNKNOWN"

@app.route('/get_all_model_columns', methods=['GET'])
def get_all_model_columns():
    try:
        logger.info('Fetching model columns for all tables')

        all_columns = {}

        # Get the list of all models in your application (tables)
        models = [MaintenanceLog, System, Schedule,Project,Pump]  # Add all your models here

        # Loop through each model and get its columns
        for model in models:
            model_columns = {}

            # Get the columns of the model
            for column in model.__table__.columns:
                column_name = column.name  
                
                # Exclude any columns if needed
                if column_name == "maintenanceid":
                    continue  

                column_type = get_column_type(column)  # Helper function to get column type

                # Debugging log for each column
                logger.debug(f'Column name: {column_name}, Type: {column_type}')

                model_columns[column_name] = column_type

            # Add model columns to the all_columns dictionary
            all_columns[model.__name__] = model_columns

        logger.debug(f'Fetched columns for all models: {all_columns}')
        return jsonify(all_columns)
    except Exception as e:
        logger.error(f'Error while fetching model columns: {str(e)}')
        return jsonify({'error': str(e)}), 500


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


