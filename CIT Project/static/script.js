//when page is loaded
document.addEventListener("DOMContentLoaded", function () {
    //fetch and populate data dynamically for all tables
    const fetchData = (endpoint, tableBodyId, headerRowId) => {
        fetch(endpoint)
            .then(response => response.json())
            .then(data => {
                const tableBody = document.getElementById(tableBodyId);
                const headerRow = document.getElementById(headerRowId);
                const columns = data.columns;
                const rows = data.data;

                //clear existing content
                tableBody.innerHTML = "";
                headerRow.innerHTML = `<th>Select</th>`; 

                //crate headers dynamically based on flask
                columns.forEach(col => {
                    const th = document.createElement("th");
                    th.innerHTML = col;
                    headerRow.appendChild(th);
                });

                //populate rows dynamically
                rows.forEach(row => {
                    const tr = document.createElement("tr");

                    const checkboxCell = document.createElement("td");
                    const checkbox = document.createElement("input");
                    checkbox.type = "checkbox";
                    checkbox.classList.add("row-checkbox");

                    //stores the id for each table in that checkbox
                    checkbox.setAttribute("data-project-id", row['projectid']);
                    checkbox.setAttribute("data-system-id", row['systemid']);
                    checkbox.setAttribute("data-pump-id", row['pumpid']);
                    checkbox.setAttribute("data-schedule-id", row['scheduleid']);
                    checkboxCell.appendChild(checkbox);
                    tr.appendChild(checkboxCell);

                    //makes pdf columns into links
                    columns.forEach(col => {
                        const td = document.createElement("td");
                        if (col === "manualname") {
                            const fileName = `${row[col]}.pdf`; 
                            td.innerHTML = `<a href="/static/pdfs/${fileName}" download>${fileName}</a>`; //link to the .pdf file
                        } else {
                            //sets td to the manualname unless null, then just blank spring
                            td.innerHTML = row[col] !== null ? row[col] : '';
                        }
                        tr.appendChild(td);
                    });

                    tableBody.appendChild(tr);
                });
            })
            //catches any errors into the console if necessary and says data has errors loading
            .catch(error => {
                console.error(`Error loading data from ${endpoint}:`, error);
                document.getElementById(tableBodyId).innerHTML = `<tr><td colspan="10">Error loading data.</td></tr>`;
            });
    };

    //fetch data for all tables
    fetchData("/get_maintenance_data", "maintenance-data", "maintenance-header-row");
    fetchData("/get_system_data", "system-data", "system-header-row");
    fetchData("/get_project_data", "project-data", "project-header-row");
    fetchData("/get_schedule_data", "schedule-data", "schedule-header-row");
    fetchData("/get_pump_data", "pump-data", "pump-header-row");

});

//all data needed from the tables
let projectData = [];
let pumpData = [];
let systemData = [];
let scheduleData = [];

//waits till it can get info of table from the flask and stores it in the array
//fetch pump data
async function fetchPumpData() {
    if (pumpData.length === 0) {
        try {
            const response = await fetch("/get_pump_data");
            pumpData = await response.json();
            console.log("Fetched pump data:", pumpData);
        } catch (error) {
            alert("Error loading pump data.");
        }
    }
    return pumpData;
}

//fetch system data
async function fetchSystemData() {
    if (systemData.length === 0) {
        try {
            const response = await fetch("/get_system_data");
            systemData = await response.json();
            console.log("Fetched system data:", systemData);
        } catch (error) {
            alert("Error loading system data.");
        }
    }
    return systemData;
}

//fetch schedule data
//gets schedule data
async function fetchScheduleData() {
    if (!scheduleData || !scheduleData.data || scheduleData.data.length === 0) {
        try {
            const response = await fetch("/get_schedule_data");
            const data = await response.json();
            if (data.columns && data.data) {
                scheduleData = data;
                generateScheduleRows(scheduleData); //call to generate the rows
            } else {
                console.error("Fetched data does not have the expected structure:", data);
            }
        } catch (error) {
            console.error("Error loading schedule data:", error);
        }
    }
}

//gets project data
async function fetchProjectData() {
    if (projectData.length === 0) {  
        try {
            const response = await fetch("/get_project_data");
            projectData = await response.json();
            console.log("Fetched project data:", projectData);            
        } catch (error) {
            alert("Error loading project data.");
        }
    } 
    return projectData; //return the fetched data
}

//ensures schedule data is fetched at beginning
document.addEventListener("DOMContentLoaded", () => {
    console.log("Page loaded, calling fetchScheduleData()...");
    fetchScheduleData();
});


//sets schedule table separately so that later functions can easily access data
function generateScheduleRows(scheduleData) {
    console.log("Generating schedule rows...");
    
    //checks if scheduleData is valid
    if (!scheduleData || !scheduleData.columns || !scheduleData.data || scheduleData.data.length === 0) {
        console.error("Invalid schedule data received:", scheduleData);
        return;
    }

    //checks if table exists
    const tableBody = document.getElementById("schedule-data");
    if (!tableBody) {
        console.error("Table body not found!");
        return;
    }

    const columns = scheduleData.columns;
    const rows = scheduleData.data;

    //clears existing content
    tableBody.innerHTML = "";

    //geneates table headers dynamically
    const headerRow = document.getElementById("schedule-header-row");
    headerRow.innerHTML = "";

    //adds a checkbox header
    const checkboxHeader = document.createElement("th");
    checkboxHeader.innerText = "Select";
    headerRow.appendChild(checkboxHeader);

    //adds dynamic headers based on the columns
    columns.forEach(col => {
        const th = document.createElement("th");
        th.innerText = col;
        headerRow.appendChild(th);
    });

    //geneates rows dynamically
    rows.forEach(entry => {
        const tr = document.createElement("tr");
        tr.id = `schedule-row-${entry.scheduleid}`;

        //adds checkbox to the row
        const tdCheckbox = document.createElement("td");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        tdCheckbox.appendChild(checkbox);
        tr.appendChild(tdCheckbox);

        //adds data for each column in the row
        columns.forEach(col => {
            const td = document.createElement("td");

            //handles the date column with specific class
            if (col === "date") {
                td.className = "schedule-date"; //add a class for the date column
                td.innerText = entry[col] || "";  //or set it empty
            } else {
                td.innerText = entry[col] || "";  //does for the rest of the columns
            }

            tr.appendChild(td);
        });

        tableBody.appendChild(tr);
    });
    schedule(); //call to apply color coding on rows
}

//colorcodes schedule data
function schedule() {
    //checks if schedule data exists
    if (!scheduleData || !scheduleData.data || scheduleData.data.length === 0) {
        console.log("No schedule data available.");
        return;
    }

    //set time to 00:00:00 for comparison
    let date = new Date();
    date.setHours(0, 0, 0, 0);  

    //loop through the schedule data
    scheduleData.data.forEach(entry => {
        //ensure data is id or date
        if (!entry.scheduleid || !entry.date) {
            console.error("Invalid schedule entry:", entry);
            return;
        }

        //makes that talbe value into a date and checks if it is
        const scheduleDate = new Date(entry.date);
        if (isNaN(scheduleDate)) {
            console.error("Invalid date format for entry:", entry);
            return;
        }

        //accesses the id of schedule row found in the first fetch method
        const row = document.getElementById(`schedule-row-${entry.scheduleid}`);
        if (!row) {
            console.log(`Row for ScheduleID ${entry.scheduleid} not found.`);
            return;
        }

        //gets the specific element 
        const dateCellElement = row.querySelector('.schedule-date');
        if (!dateCellElement) {
            console.log(`Date cell for ScheduleID ${entry.scheduleid} not found.`);
            return;
        }

        //sets colors red/yellow if 5 days later
        if (scheduleDate < date) {
            dateCellElement.style.backgroundColor = "rgb(255, 42, 46)"; //red
        } else if (scheduleDate <= new Date(date.getTime() + 5 * 24 * 60 * 60 * 1000)) {
            dateCellElement.style.backgroundColor = "rgb(248, 203, 46)"; //yellow
        }
    });
}


//filter maintenance dates
function filterData() {
    const table = document.getElementById('maintenance-data');
    const rows = table.querySelectorAll("tr");

    const startInput = document.getElementById('startDate').value;
    const endInput = document.getElementById('endDate').value;

    if (!startInput || !endInput) return; //prevents errors if date inputs are empty

    //splits up date removing all the dashes and converitng that into a date
    const startParts = startInput.split("-");
    const start = new Date(startParts[0], startParts[1] - 1, startParts[2]);
    start.setHours(0, 0, 0, 0);


    const endParts = endInput.split("-");
    const end = new Date(endParts[0], endParts[1] - 1, endParts[2]);
    end.setHours(23, 59, 59, 999);

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (i === 0) continue; //skip header row

        const dateText = row.children[4]?.textContent?.trim();
        if (!dateText) continue; //skip if has no date

        //checks if valid date and sets display accordingly
        const logDate = new Date(dateText);
        if (isNaN(logDate)) {
            row.style.display = 'none';
            continue;
        }

        if (logDate >= start && logDate <= end) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    }
}

//seraching for project name/pump name/schedule id
function searchMaintenance() {
    const mtable = document.getElementById('maintenance-data');
    const mRows = mtable.querySelectorAll("tr");
    fetchProjectData(); //ensure project data is loaded
    let pid = null;
    let pumpid=null;
    let systemid=null;
    const pump = document.getElementById('searchpump');
    const proj = document.getElementById('searchproj');
    const schedule = document.getElementById('searchschedule');


    if (proj.value !== "") {
        //loop through project data to find matching project
        for (let j = 0; j < projectData.data.length; j++) {
            const pRow = projectData.data[j];

            //if name equal to the input of searchbox then get the id
            if (pRow.projectname.toLowerCase() === proj.value.toLowerCase()) {
                
                pid = Number(pRow.projectid); 
                break; //exit loop once match is found
            }
        }
        
        //displays rows accordingly
        for (let i = 0; i < mRows.length; i++) {
            const mRow = mRows[i];
            if (Number(mRow.children[3].textContent) === pid) {
                mRow.style.display = ''; 
            } else {
                mRow.style.display = 'none';
            }
        }
    }

     //checks if scheduleid column in maintenace is same and changes display accordingly
    if (schedule.value !== "") {
        console.log("Searching for schedule...");
        //filter maintenance rows by ScheduleID
        for (let i = 0; i < mRows.length; i++) {
            const mRow = mRows[i];
            if (Number(mRow.children[6].textContent) === Number(schedule.value)) {
                mRow.style.display = ''; 
            } else {
                mRow.style.display = 'none'; 
            }
        }
    }

    if (pump.value !== "") {
        console.log("Searching for pump...");
        for (let j = 0; j < pumpData.data.length; j++) {
            const uRow = pumpData.data[j];

            //gets pumpid after searching pump name through pump table
            if (uRow.model.toLowerCase() === pump.value.toLowerCase()) {
                pumpid = Number(uRow.pumpid); 
                break; //exit loop once match is found
            }

        }

        //uses that pumpid to search through systemid with that pumpid
        for (let j = 0; j < systemData.data.length; j++) {
            const sRow = systemData.data[j];
            if (Number(sRow.systemid) === pumpid) {
                systemid = Number(sRow.systemid); 
                break; 
            }
        }

        //searches that system id in maintenance
        for (let i = 0; i < mRows.length; i++) {
            const mRow = mRows[i];
            if (Number(mRow.children[2].textContent) === systemid) {
                mRow.style.display = '';
            } else {
                mRow.style.display = 'none';
            }
        }
    }
}



function addMaintenanceInputs() {
    const d=document.getElementById('mjsinput');

    if (document.getElementById('row').value === "addrow") {

        //fetches the name of all columns
        fetch('/get_all_model_columns')
        .then(response => response.json())
        .then(allModelColumns => {

            //clear the previous inputs if any
            d.innerHTML = "";
        
            //get only the MaintenanceLog model columns
            const modelColumns = allModelColumns['MaintenanceLog'];  

            if (!modelColumns) {
                console.error('MaintenanceLog columns not found!');
                return;
            }

            //loop through the model columns and create input fields
            for (let columnName in modelColumns) {
                const columnType = modelColumns[columnName];

                const label = document.createElement('label');
                label.setAttribute('for', columnName);  //associate label with the input field
                label.innerHTML = columnName.charAt(0).toUpperCase() + columnName.slice(1);  

                const input = document.createElement('input');
                input.placeholder = columnName.charAt(0).toUpperCase() + columnName.slice(1); //capitalizes first letter
                input.id = columnName; 
                input.name = columnName; 

                //handles different types based on columnType
                if (columnType.includes('INTEGER') || columnType.includes('INT')) {
                    input.type = 'number';  //column is of type integer, use number input
                } else if (columnType.includes('DATE')) {
                    input.type = 'date';  //column is of type date, use date input
                } else if (columnType.includes('VARCHAR') || columnType.includes('TEXT')) {
                    input.type = 'text';  //column is of type varchar/text, use test input
                } else {
                    input.type = 'text';  //default to text for any unknown or unsupported types
                }
                d.appendChild(label);
                d.appendChild(input); //append the input to the form
                d.appendChild(document.createElement('br'));

            }

            //onclick to trigger button to add data
            document.getElementById('maintenanceimplement').onclick = function () {
                let isValid = true;
                const formData = {};

                //gather all inputs and check for validity
                for (let columnName in modelColumns) {
                    const inputValue = document.getElementById(columnName).value;
                    if (!inputValue) {
                        isValid = false; //if any input is empty, mark as invalid
                        break;
                    }
                    formData[columnName] = inputValue;
                }

                //triggers addmaintenancedata function only if all data is valid 
                if (isValid) {
                    addMaintenanceData(formData);
                } else {
                    alert('Invalid input. All fields must be filled.');
                }
            };
        })
        .catch(error => {
            console.error('Error fetching model columns:', error);
        });
    }
}

//connects with flask toa dd data to sql
function addMaintenanceData(data) {

    //sends to backend
    fetch('/add_maintenance_data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Maintenance data added successfully.');
        } else {
            alert('Error adding maintenance data.');
        }
    })
    .catch(error => {
        alert('Error: ' + error);
    });
}

//similar process as addmaintenancedata but for project
function addProjectInputs() {
    const d = document.getElementById('projectjsinput');
    if (document.getElementById('projectrow').value === "addrow") {
        fetch('/get_all_model_columns')
        .then(response => response.json())
        .then(allModelColumns => {

            //clear inputs if any
            d.innerHTML = "";
        
            //get only the project model columns
            const modelColumns = allModelColumns['Project'];  

            if (!modelColumns) {
                console.error('Project columns not found!');
                return;
            }

            //loop through the model columns and create  input fields
            for (let columnName in modelColumns) {
                const columnType = modelColumns[columnName];

                if (columnName.toLowerCase() === 'projectid') continue;

                const label = document.createElement('label');
                label.setAttribute('for', columnName);  //associate label with the input field
                label.innerHTML = columnName.charAt(0).toUpperCase() + columnName.slice(1);  

                const input = document.createElement('input');

                input.placeholder = columnName.charAt(0).toUpperCase() + columnName.slice(1); //capitalize first letter
                input.id = columnName; //set the id to the column name
                input.name = columnName; 

                //handle different types based on columnType
                if (columnType.includes('INTEGER') || columnType.includes('INT')) {
                    input.type = 'number';
                } else if (columnType.includes('DATE')) {
                    input.type = 'date';
                } else if (columnType.includes('BOOLEAN') || columnType.includes('TINYINT(1)')) {
                    input.value = "true";  
                } else {
                    input.type = 'text';
                }
            
                d.appendChild(label); 
                d.appendChild(input); 
                d.appendChild(document.createElement('br'));

            }

            //add onclick to trigger button 
            document.getElementById('projectimplement').onclick = function () {
                let isValid = true;
                const formData = {};

                //gather all inputs and check for validity
                for (let columnName in modelColumns) {
                    console.log(columnName);
                    const inputElement = document.getElementById(columnName);
                    if (inputElement) {

                        const inputValue = inputElement.value;
                        
                        if (inputValue) { 
                            formData[columnName] = inputValue; 
                        }
                        
                    };
                }

                //submit the form data only if data is valid
                if (isValid) {
                    addProjectData(formData);
                } else {
                    alert('Invalid input. All fields must be filled.');
                }
            };
        })
        .catch(error => {
            console.error('Error fetching model columns:', error);
        });
    }
}
    
//connects to flask to add data
function addProjectData(data) {
    fetch('/add_project_data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(responseData => {
        if (responseData.message) {
            alert("Project added successfully!");
        } else {
            alert("Failed to add project.");
        }
    })
    .catch(error => {
        console.error('Error:', error);
        //alert("There was an error with the request.");
    });
}

//adding system inputs
function addSystemInputs() {
    const d = document.getElementById('systemjsinput');
    if (document.getElementById('systemrow').value === "addrow") {
        fetch('/get_all_model_columns')
        .then(response => response.json())
        .then(allModelColumns => {

            //clear the previous inputs if any
            d.innerHTML = "";

            //get only the system model columns
            const modelColumns = allModelColumns['System'];  

            if (!modelColumns) {
                console.error('System columns not found!');
                return;
            }

            //loop through the model columns and create  input fields
            for (let columnName in modelColumns) {
                const columnType = modelColumns[columnName];
                
                if (columnName.toLowerCase() === 'systemid') continue;

                const label = document.createElement('label');
                label.setAttribute('for', columnName);  //associate label with the input field
                label.innerHTML = columnName.charAt(0).toUpperCase() + columnName.slice(1);  

                const input = document.createElement('input');
                input.placeholder = columnName.charAt(0).toUpperCase() + columnName.slice(1); //capitalize first letter
                input.id = columnName; //set the id to the column name
                input.name = columnName;

                //handle different types based on columnType
                if (columnType.includes('INTEGER') || columnType.includes('INT')) {
                    input.type = 'number';  
                } else if (columnType.includes('DATE')) {
                    input.type = 'date'; 
                } else if (columnType.includes('VARCHAR') || columnType.includes('TEXT')) {
                    input.type = 'text'; 
                } else {
                    input.type = 'text'; 
                }
                
                d.appendChild(label);
                d.appendChild(input); 
                d.appendChild(document.createElement('br'));

            }

            //trigger button to add data
            document.getElementById('systemimplement').onclick = function () {
                let isValid = true;
                const formData = {};

                //gather all inputs and check for validity
                for (let columnName in modelColumns) {
                    console.log(columnName);
                    const inputElements = document.getElementsByName(columnName);
                    inputElements.forEach((inputElement) => {
                        const inputValue = inputElement.value;
                        
                        if (!inputValue) {
                            isValid = false; 
                        } else {
                            formData[columnName] = inputValue; 
                        }
                    });
                }
                    
                //submit the form data if all is valid
                if (isValid) {
                    addSystemData(formData);
                } else {
                    alert('Invalid input. All fields must be filled.');
                }
            };
        })
        .catch(error => {
            console.error('Error fetching model columns:', error);
        });
    }
}

function addSystemData(data) {
        fetch('/add_system_data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(responseData => {
            if (responseData.message) {
                alert("System added successfully!");
            } else {
                alert("Failed to add system.");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            //alert("There was an error with the request.");
        });
}
    

//function to add schedule data and inputs
function addScheduleInputs() {
	const d = document.getElementById('schedulejsinput');
	
	if (document.getElementById('schedulerow').value === "addrow") {
		fetch('/get_all_model_columns')
		.then(response => response.json())
		.then(allModelColumns => {
			const d = document.getElementById('schedulejsinput');

			//clear previous inputs if any
			d.innerHTML = "";

			//get only the schedule model columns
			const modelColumns = allModelColumns['Schedule'];

			if (!modelColumns) {
				console.error('schedule columns not found!');
				return;
			}

			//loop through the model columns and create corresponding input fields
			for (let columnName in modelColumns) {
				const columnType = modelColumns[columnName];

				if (columnName.toLowerCase() === 'scheduleid') continue;

				const label = document.createElement('label');
				label.setAttribute('for', columnName);
				label.innerHTML = columnName.charAt(0).toUpperCase() + columnName.slice(1);

				const input = document.createElement('input');
				input.placeholder = columnName.charAt(0).toUpperCase() + columnName.slice(1);
				input.id = columnName;
				input.name = columnName;

				//handle different types based on columntype
				if (columnType.includes('INTEGER') || columnType.includes('INT')) {
					input.type = 'number';
				} else if (columnType.includes('DATE')) {
					input.type = 'date';
				} else if (columnType.includes('VARCHAR') || columnType.includes('TEXT')) {
					input.type = 'text';
				} else {
					input.type = 'text';
				}

				d.appendChild(label);
				d.appendChild(input);
				d.appendChild(document.createElement('br'));
			}

			//add the button  for submitting the data
			document.getElementById('scheduleimplement').onclick = function () {
				let isValid = true;
				const formData = {};

				//gather all inputs and check for validity
				for (let columnName in modelColumns) {
					const inputElements = document.getElementsByName(columnName);
					inputElements.forEach((inputElement) => {
						const inputValue = inputElement.value;
						if (!inputValue) {
							isValid = false;
						} else {
							formData[columnName] = inputValue;
						}
					});
				}

				//submit the form data if valid
				if (isValid) {
					addScheduleData(formData);
				} else {
					alert('invalid input. all fields must be filled.');
				}
			};
		})
		.catch(error => {
			console.error('error fetching model columns:', error);
		});
	}
}

function addScheduleData(data) {
	fetch('/add_schedule_data', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	})
	.then(response => response.json())
	.then(responseData => {
		if (responseData.message) {
			alert("schedule added successfully!");
		}
	})
	.catch(error => {
		console.error('error:', error);
	});
}

//adds to pump inputs 
function addPumpInputs() {
	const d = document.getElementById('pumpjsinput');

	if (document.getElementById('pumprow').value === "addrow") {
		fetch('/get_all_model_columns')
		.then(response => response.json())
		.then(allModelColumns => {

			//clear existing content
			d.innerHTML = "";

			//get only the pump model columns
			const modelColumns = allModelColumns['Pump'];

			if (!modelColumns) {
				console.error('pump columns not found!');
				return;
			}

			//loop through the model columns and create corresponding input fields
			for (let columnName in modelColumns) {
				const columnType = modelColumns[columnName];

				if (columnName.toLowerCase() === 'pumpid') continue;

				const label = document.createElement('label');
				label.setAttribute('for', columnName);
				label.innerHTML = columnName.charAt(0).toUpperCase() + columnName.slice(1);

				const input = document.createElement('input');
				input.placeholder = columnName.charAt(0).toUpperCase() + columnName.slice(1);
				input.id = columnName;
				input.name = columnName;

				//handle different types based on columntype
				if (columnType.includes('INTEGER') || columnType.includes('INT')) {
					input.type = 'number';
				} else if (columnType.includes('DATE')) {
					input.type = 'date';
				} else if (columnType.includes('VARCHAR') || columnType.includes('TEXT')) {
					input.type = 'text';
				} else {
					input.type = 'text';
				}

				d.appendChild(label);
				d.appendChild(input);
				d.appendChild(document.createElement('br'));
			}

			//add the button click handler for submitting the data
			document.getElementById('pumpimplement').onclick = function () {
				let isValid = true;
				const formData = {};
				const pumpID = "PUMP-" + new Date().getTime();

				//gather all inputs and check for validity
				for (let columnName in modelColumns) {
					const inputElements = document.getElementsByName(columnName);
					inputElements.forEach((inputElement) => {
						const inputValue = inputElement.value;
						if (!inputValue) {
							isValid = false;
						} else {
							formData[columnName] = inputValue;
						}
					});
				}

                //submit form if valid
				if (isValid) {
					formData['PumpID'] = pumpID;
					addPumpData(formData);
				} else {
					alert('invalid input. all fields must be filled.');
				}
			};
		})
		.catch(error => {
			console.error('error fetching model columns:', error);
		});
	}
}

function addPumpData(data) {
	fetch('/add_pump_data', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	})
	.then(response => response.json())
	.then(responseData => {
		if (responseData.message) {
			alert("pump data added successfully!");
		} else {
			alert("failed to add pump.");
		}
	})
	.catch(error => {
		console.error('error:', error);
	});
}



//editing current rows for maintenancelog
function changeMaintenanceData() {
    const d=document.getElementById('mjsinput');

    if (document.getElementById('row').value === "changerow") {
        //clear any previous inputs
        d.innerHTML = '';
    
        //fetch the model columns for all tables and filter for maintenancelog
        fetch('/get_all_model_columns')
            .then(response => response.json())
            .then(allModelColumns => {

                //get only the maintenancelog columns
                const columns = allModelColumns['MaintenanceLog'];  

                if (!columns) {
                    console.error('MaintenanceLog columns not found!');
                    alert('Error: MaintenanceLog columns not found.');
                    return;
                }

                // create the maintenancelog id input field dynamically
                const maintenanceIDInput = document.createElement('input');
                maintenanceIDInput.type = 'text';
                maintenanceIDInput.placeholder = 'Enter Maintenance ID';
                maintenanceIDInput.id = 'maintenanceID';

                d.appendChild(maintenanceIDInput);
                d.appendChild(document.createElement('br'));

                //loop through the columns and create input fields
                for (const [columnName, columnType] of Object.entries(columns)) {

                    const label = document.createElement('label');
                    label.setAttribute('for', columnName);  //associate label with the input field
                    label.innerHTML = columnName.charAt(0).toUpperCase() + columnName.slice(1);  

                    const input = document.createElement('input');
                    input.placeholder = columnName.charAt(0).toUpperCase() + columnName.slice(1);  //capitalize the first letter of the field name
                    input.id = columnName;  
                    input.name = columnName; 
                    
                    
                    //same process as adding rows
                    if (columnType.includes('INTEGER') || columnType.includes('INT')) {
                        input.type = 'number';  
                    } else if (columnType.includes('DATE')) {
                        input.type = 'date';  
                    } else if (columnType.includes('VARCHAR') || columnType.includes('TEXT')) {
                        input.type = 'text';  
                    } else {
                        input.type = 'text';  
                    }
                
    

                    //append input fields to the form container
                    d.appendChild(label);
                    d.appendChild(input);
                    d.appendChild(document.createElement('br'));  
                }
    
                
                


                //add button to update
                document.getElementById('maintenanceimplement').onclick = function () {
                    const maintenanceID = document.getElementById('maintenanceID').value; 
                    if (!maintenanceID) {
                        alert('Please enter a valid maintenance ID.');
                        return;
                    }
    
                    const updatedData = { maintenanceID }; 
    
                    //gather all input
                    for (const [columnName] of Object.entries(columns)) {
                        const inputValue = document.getElementById(columnName).value;
                        if (inputValue) {
                            updatedData[columnName] = inputValue;  
                        }
                    }
    
                    //send the updated data to the server
                    fetch('/update_maintenance_data', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(updatedData),
                    })
                    .then(response => response.json())
                    .then(responseData => {
                        if (responseData.message) {
                            alert("Maintenance data updated successfully!");
                        } else {
                            alert("Failed to update maintenance data.");
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('There was an error with the request.');
                    });
                };
            })
            .catch(error => {
                console.error('Error fetching table columns:', error);
                alert('Error fetching table columns.');
            });
    }
}

//updating system table rows
function changeSystemData() {
    const d = document.getElementById('systemjsinput');
    
    if (document.getElementById('systemrow').value === "changerow") {
        //clear any previous inputs
        d.innerHTML = '';

        //fetch the model columns for all tables and filter for system
        fetch('/get_all_model_columns')
            .then(response => response.json())
            .then(allModelColumns => {

                //get only the system columns
                const columns = allModelColumns['System'];  

                if (!columns) {
                    console.error('System columns not found!');
                    alert('Error: System columns not found.');
                    return;
                }

                //create the systemid input field first
                const systemIdLabel = document.createElement('label');
                systemIdLabel.setAttribute('for', 'SystemID');
                systemIdLabel.innerHTML = 'System ID';
                d.appendChild(systemIdLabel);
                
                const system_id = document.createElement('input');
                system_id.type = 'text';
                system_id.placeholder = 'Enter System ID';
                system_id.id = 'SystemID';
                d.appendChild(system_id);
                d.appendChild(document.createElement('br'));

                //loop through the columns and create corresponding input fields
                for (const [columnName, columnType] of Object.entries(columns)) {
                    if (columnName.toLowerCase() === 'systemid') {
                        continue;  
                    }
                    
                    const label = document.createElement('label');
                    label.setAttribute('for', columnName);
                    label.innerHTML = columnName.charAt(0).toUpperCase() + columnName.slice(1);
                    d.appendChild(label);
                    
                    const input = document.createElement('input');
                    input.placeholder = columnName.charAt(0).toUpperCase() + columnName.slice(1);
                    input.id = columnName;
                    input.name = columnName;
                
                    //set input types based on column type
                    if (columnType.includes('INTEGER') || columnType.includes('INT')) {
                        input.type = 'number';
                    } else if (columnType.includes('DATE')) {
                        input.type = 'date';
                    } else if (columnType.includes('VARCHAR') || columnType.includes('TEXT')) {
                        input.type = 'text';
                    } else {
                        input.type = 'text';
                    }

                    d.appendChild(input);
                    d.appendChild(document.createElement('br'));
                }

                //add button to update
                document.getElementById('systemimplement').onclick = function () {
                    //checks if systemid exists
                    const systemId = document.getElementById('SystemID');
                    if (!systemId || !systemId.value) {
                        alert('Please enter a valid system ID.');
                        return;
                    }
                    
                    //create object with correct format
                    const updatedData = { system_id: systemId.value };
                    
                    console.log("Starting to gather input values...");
                    
                    //gather all input values with proper error handling
                    for (const columnName in columns) {
                        if (columnName.toLowerCase() === 'systemid') {
                            continue;
                        }
                        
                        try {
                            const inputElement = document.getElementById(columnName);
                            
                            if (!inputElement) {
                                console.warn(`Input element with ID '${columnName}' not found`);
                                continue;
                            }
                            
                            console.log(`Found element for ${columnName}:`, inputElement);
                            
                            const inputValue = inputElement.value;
                            console.log(`Value for ${columnName}:`, inputValue);
                            
                            if (inputValue) {
                                updatedData[columnName] = inputValue;
                            }
                        } catch (err) {
                            console.error(`Error processing ${columnName}:`, err);
                        }
                    }
                    
                    console.log("Final data to send:", updatedData);

                    //send the updated data to the server
                    fetch('/update_system_data', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(updatedData),
                    })
                    .then(response => response.json())
                    .then(responseData => {
                        if (responseData.message) {
                            alert("System data updated successfully!");
                            fetchSystemData();
                        } else {
                            alert("Failed to update system data.");
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('There was an error with the request: ' + error.message);
                    });
                };
            })
            .catch(error => {
                console.error('Error fetching table columns:', error);
                alert('Error fetching table columns: ' + error.message);
            });
    }
}



//edit project data rows
function changeProjectData() {
    const d = document.getElementById('projectjsinput');
    
    if (document.getElementById('projectrow').value === "changerow") {
        d.innerHTML = ''; 

        //fetch the model columns for all tables and filter for project
        fetch('/get_all_model_columns')
            .then(response => response.json())
            .then(allModelColumns => {
                const columns = allModelColumns['Project'];  

                if (!columns) {
                    console.error('Project columns not found!');
                    alert('Error: Project columns not found.');
                    return;
                }

                //add projectid input box
                const projectIdLabel = document.createElement('label');
                projectIdLabel.setAttribute('for', 'project_id');  
                projectIdLabel.innerHTML = 'Project ID';
                d.appendChild(projectIdLabel);
                
                const project_id_input = document.createElement('input');
                project_id_input.type = 'number';  
                project_id_input.placeholder = 'Enter Project ID';
                project_id_input.id = 'project_id';  
                d.appendChild(project_id_input);
                d.appendChild(document.createElement('br'));

                //loop through the columns and create  input fields
                for (const [columnName, columnType] of Object.entries(columns)) {
                    if (columnName.toLowerCase() === 'projectid') {
                        continue; 
                    }

                    const label = document.createElement('label');
                    label.setAttribute('for', columnName);
                    label.innerHTML = columnName.charAt(0).toUpperCase() + columnName.slice(1);
                    const input = document.createElement('input');
                    input.placeholder = columnName.charAt(0).toUpperCase() + columnName.slice(1);
                    input.id = columnName;
                    input.name = columnName;

                    if (columnType.includes('INTEGER') || columnType.includes('INT')) {
                        input.type = 'number';
                    } else if (columnType.includes('DATE')) {
                        input.type = 'date';
                    } else if (columnType.includes('VARCHAR') || columnType.includes('TEXT')) {
                        input.type = 'text';
                    } else if (columnType.includes('BOOLEAN')) {
                        input.type = 'text'; 
                    } else {
                        input.type = 'text';  
                    }

                    d.appendChild(label);
                    d.appendChild(input);
                    d.appendChild(document.createElement('br'));
                }

                //button handling to update record
                document.getElementById('projectimplement').onclick = function () {

                    //check projectid has value
                    const projectIdElement = document.getElementById('project_id');
                    if (!projectIdElement || !projectIdElement.value) {
                        alert('Project ID is required!');
                        return;
                    }
                    
                    //initialize object with correct format
                    const updatedData = {
                        project_id: projectIdElement.value  
                    };

                    console.log("Initial data with project_id:", updatedData);

                    //gather all input values with error handling
                    for (const [columnName, columnType] of Object.entries(columns)) {
                        if (columnName.toLowerCase() === 'projectid') {
                            continue; 
                        }
                        
                        const inputElement = document.getElementById(columnName);
                        if (!inputElement) {
                            console.warn(`Input element with ID ${columnName} not found`);
                            continue;
                        }
                        
                        const inputValue = inputElement.value;
                        
                        //only add non-empty values
                        if (inputValue !== "" && inputValue !== null) {
                            if (columnType.includes('BOOLEAN')) {
                                //handle  boolean fields by converting 'true'/'false' string to boolean
                                if (inputValue.toLowerCase() === 'true') {
                                    updatedData[columnName] = true;
                                } else if (inputValue.toLowerCase() === 'false') {
                                    updatedData[columnName] = false;
                                } else {
                                    updatedData[columnName] = inputValue; //keep original value if not recognized
                                }
                            } else {
                                updatedData[columnName] = inputValue;
                            }
                        }
                    }

                    console.log("Final data to be sent:", updatedData);

                    //send the updated data to the server
                    fetch('/update_project_data', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(updatedData),
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(responseData => {
                        if (responseData.message) {
                            alert("Project data updated successfully!");
                            fetchProjectData();
                        } else {
                            alert("Failed to update project data: " + 
                                  (responseData.error || "Unknown error"));
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('There was an error with the request: ' + error.message);
                    });
                };
            })
            .catch(error => {
                console.error('Error fetching table columns:', error);
                alert('Error fetching table columns: ' + error.message);
            });
    }
}

//edits schedule table rows
function changeScheduleData() {
    const d = document.getElementById('schedulejsinput');

    if (document.getElementById('schedulerow').value === "changerow") {
        d.innerHTML = ""; 

        //fetch schedule columns and dynamically create inputs
        fetch('/get_all_model_columns')
            .then(response => response.json())
            .then(allModelColumns => {
                const columns = allModelColumns['Schedule'];  

                if (!columns) {
                    console.error('Schedule columns not found!');
                    alert('Error: Schedule columns not found.');
                    return;
                }

                //loop through the columns and create input fields
                for (const [columnName, columnType] of Object.entries(columns)) {

                    const label = document.createElement('label');
                    label.setAttribute('for', columnName);  //associate label with the input field
                    label.innerHTML = columnName.charAt(0).toUpperCase() + columnName.slice(1);  

                    const input = document.createElement('input');
                    input.placeholder = columnName.charAt(0).toUpperCase() + columnName.slice(1);
                    input.id = columnName;
                    input.name = columnName;

                    if (columnType.includes('INTEGER') || columnType.includes('INT')) {
                        input.type = 'number';
                    } else if (columnType.includes('DATE')) {
                        input.type = 'date';
                    } else if (columnType.includes('VARCHAR') || columnType.includes('TEXT')) {
                        input.type = 'text';
                    } else {
                        input.type = 'text';  
                    }

                    d.appendChild(label);
                    d.appendChild(input);
                    d.appendChild(document.createElement('br'));
                }

                //button handler to update record
                document.getElementById('scheduleimplement').onclick = function () {
                    const updatedData = {};

                    //gather all input values
                    for (const [columnName] of Object.entries(columns)) {
                        const inputValue = document.getElementById(columnName).value;
                        if (inputValue) {
                            updatedData[columnName] = inputValue;
                        }
                    }

                    //ensure scheduleid is in updated data
                    const scheduleId = document.getElementById('scheduleid').value; 
                    updatedData['ScheduleID'] = scheduleId; 

                    //send the updated data to the server
                    fetch('/update_schedule_data', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(updatedData),
                    })
                    .then(response => response.json())
                    .then(responseData => {
                        if (responseData.message) {
                            alert("Schedule data updated successfully!");
                            d.innerHTML = ""; 
                        } else {
                            alert("Failed to update schedule data.");
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('There was an error with the request.');
                    });
                };
            })
            .catch(error => {
                console.error('Error fetching schedule columns:', error);
                alert('Error fetching schedule columns.');
            });
    }
}


//edits pump table rows
function changePumpData() {
    const d = document.getElementById('pumpjsinput');

    if (document.getElementById('pumprow').value === "changerow") {
        d.innerHTML = ""; 

        //fetch pump columns and dynamically create inputs
        fetch('/get_all_model_columns')
            .then(response => response.json())
            .then(allModelColumns => {
                const columns = allModelColumns['Pump'];  

                if (!columns) {
                    console.error('Pump columns not found!');
                    alert('Error: Pump columns not found.');
                    return;
                }

                //create pumpid input field first
                const pumpIdInput = document.createElement('input');
                pumpIdInput.placeholder = "PumpID";
                pumpIdInput.id = "PumpID";
                pumpIdInput.name = "PumpID";
                pumpIdInput.type = "number"; 

                d.appendChild(pumpIdInput);
                d.appendChild(document.createElement('br'));

                //loop through the columns and create input fields (excluding PumpID)
                for (const [columnName, columnType] of Object.entries(columns)) {
                    if (columnName.toLowerCase() !== 'pumpid') {  

                        const label = document.createElement('label');
                        label.setAttribute('for', columnName);  //associate label with the input field
                        label.innerHTML = columnName.charAt(0).toUpperCase() + columnName.slice(1);  

                        const input = document.createElement('input');
                        input.placeholder = columnName.charAt(0).toUpperCase() + columnName.slice(1);
                        input.id = columnName;
                        input.name = columnName;

                        if (columnType.includes('INTEGER') || columnType.includes('INT')) {
                            input.type = 'number';
                        } else if (columnType.includes('DATE')) {
                            input.type = 'date';
                        } else if (columnType.includes('VARCHAR') || columnType.includes('TEXT')) {
                            input.type = 'text';
                        } else {
                            input.type = 'text';  
                        }

                        d.appendChild(label);
                        d.appendChild(input);
                        d.appendChild(document.createElement('br'));
                    }
                }

                //button handler to update record
                document.getElementById('pumpimplement').onclick = function () {
                    const updatedData = {};
                    const pumpIdValue = document.getElementById("PumpID").value;

                    if (!pumpIdValue) {
                        alert("PumpID is required!");
                        return;
                    }

                    updatedData["PumpID"] = pumpIdValue; 

                    //gather all input values
                    for (const [columnName] of Object.entries(columns)) {
                        if (columnName.toLowerCase() !== 'pumpid') {  
                            const inputValue = document.getElementById(columnName).value;
                            if (inputValue) {
                                updatedData[columnName] = inputValue;
                            }
                        }
                    }

                    //send the updated data to the server
                    fetch('/update_pump_data', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(updatedData),
                    })
                    .then(response => response.json())
                    .then(responseData => {
                        if (responseData.message) {
                            alert("Pump data updated successfully!");
                        } else {
                            alert("Failed to update pump data.");
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('There was an error with the request.');
                    });
                };
            })
            .catch(error => {
                console.error('Error fetching pump columns:', error);
                alert('Error fetching pump columns.');
            });
    }
}

//deleting project data rows
function deleteProjectData() {
    const selectedIds = [];
    const tableBody = document.getElementById("projecttable");
    const checkboxes = tableBody.querySelectorAll(".row-checkbox");

    //get projetid from checkbox and adds it to id list
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selectedIds.push(Number(checkbox.dataset.projectId)); 
        }
    });

    if (selectedIds.length > 0) {
        

        //send ids to flask
        fetch('/delete_project_rows', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ids: selectedIds })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                selectedIds.forEach(id => {
                    //find row matching id
                    const rowToDelete = tableBody.querySelector(`input[data-project-id="${id}"]`).closest("tr");
                    if (rowToDelete) {
                        rowToDelete.remove(); //removing entire row
                    }
                });
                alert('Rows deleted successfully');
            }
        })
        .catch(error => {
            console.error('Error deleting rows:', error);
        });
    } else {
        alert('No rows selected');
    }
}

//deleting schedule rows, same as projectdeletion
function deleteScheduleData() {
    
    const selectedIds = [];
    const tableBody = document.getElementById("schedule-data"); 
    const checkboxes = tableBody.querySelectorAll("input[type='checkbox']");
    
    //adds selected ids if checkbox is checked
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            console.log('Selected Schedule ID:', checkbox.dataset.scheduleId); 
            selectedIds.push(Number(checkbox.parentNode.parentNode.querySelector("td:nth-child(2)").textContent));
        }
    });

    //sends data to flask to delete
    if (selectedIds.length > 0) {
        fetch('/delete_schedule_rows', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ids: selectedIds })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                selectedIds.forEach(id => {

                    //deletes the row in HTML
                    const rowToDelete = tableBody.querySelector(`input[data-schedule-id="${id}"]`).closest("tr");
                    if (rowToDelete) {
                        rowToDelete.remove();
                    }
                });
                alert('Rows deleted successfully');
            } 
        })
        .catch(error => {
            console.error('Error deleting rows:', error);
        });
    } else {
        alert('No rows selected');
    }
}


    

//delete rows from  schedule table
function deletePumpData() {
    const selectedIds = [];
    const tableBody = document.getElementById("pumptable");
    const checkboxes = tableBody.querySelectorAll("input[type='checkbox']");

    //get schedule id from checked box and add it to list
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selectedIds.push(Number(checkbox.parentNode.parentNode.querySelector("td:nth-child(2)").textContent)); 
        }
    });

    //send data to flask 
    if (selectedIds.length > 0) {
        fetch('/delete_pump_rows', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ids: selectedIds })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                selectedIds.forEach(id => {
                    //find row with id and remove
                    const rowToDelete = tableBody.querySelector(`input[data-pump-id="${id}"]`).closest("tr");
                    if (rowToDelete) {
                        rowToDelete.remove(); 
                    }
                });
                alert('Rows deleted successfully');
            } 
        })
        .catch(error => {
            console.error('Error deleting rows:', error);
            alert('An error occurred while deleting rows');
        });
    } else {
        alert('No rows selected');
    }
}

//delete rows from system
function deleteSystemData() {
    const selectedIds = [];
    const tableBody = document.getElementById("systemtable");
    const checkboxes = tableBody.querySelectorAll("input[type='checkbox']");

    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selectedIds.push(Number(checkbox.parentNode.parentNode.querySelector("td:nth-child(2)").textContent)); //get scheduleid from data attribute
        }
    });

    if (selectedIds.length > 0) {
        //send the ids to flask to delete
        fetch('/delete_system_rows', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ids: selectedIds })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                selectedIds.forEach(id => {
                    //find the row by matching the id
                    const rowToDelete = tableBody.querySelector(`input[data-system-id="${id}"]`).closest("tr");
                    if (rowToDelete) {
                        rowToDelete.remove(); 
                    }
                });
                alert('Rows deleted successfully');
            } 
        })
        .catch(error => {
            console.error('Error deleting rows:', error);
            alert('An error occurred while deleting rows');
        });
    } else {
        alert('No rows selected');
    }
}

//adding column functionality 
function addColumn() {
    const tableName = document.getElementById("tableName").value;
    const columnName = document.getElementById("columnName").value;
    const columnType = document.getElementById("columnType").value;

    const data = {
        table_name: tableName,
        column_name: columnName,
        column_type: columnType
    };

    //sends data into app route;
    fetch("/add_column", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        //adds message to screen
        const responseMessage = document.getElementById("responseMessage");
        if (result.message) {
            responseMessage.textContent = result.message;
        } else if (result.error) {
            responseMessage.textContent = "Error: " + result.error;
        }
    })
    .catch(error => {
        alert("Error while adding column.");
    });
}

//filtering schedule data by month
function filterByMonth() {
    const mRows = document.getElementById('scheduletable').querySelectorAll("tr");
    const scheduleValue = document.getElementById('searchdate').value.toLowerCase(); 

    //checks if that value not null
    if (scheduleValue !== "") {
        for (let i = 1; i < mRows.length; i++) { // start from 1 to skip header
            const mRow = mRows[i];
            const rowDate = mRow.children[2]?.textContent.toLowerCase(); //ensure lowercase for comparison

            //if value is included in rowdate, then display, else don't
            if (rowDate.includes(scheduleValue)) {
                mRow.style.display = '';
            } else {
                mRow.style.display = 'none';
            }
        }
    }
}

//fetch all data
fetchProjectData();
fetchPumpData();
fetchScheduleData();
fetchSystemData();

//when page is loaded
document.addEventListener("DOMContentLoaded", function () {
    //ensures elements exist before attaching event listeners
    const rowElement = document.getElementById('row');
    const searchMaintenanceButton = document.getElementById('searchmaintenance');
    const searchDateButton = document.getElementById('searchdate');
    const systemRowElement = document.getElementById('systemrow');
    const projRowElement=document.getElementById('projectrow');
    const scheduleRowElement=document.getElementById('schedulerow')
    const pumpRowElement=document.getElementById('pumprow');
    const projDelete=document.getElementById('projectdelete');
    const systemDelete=document.getElementById('systemdelete');
    const pumpDelete=document.getElementById('pumpdelete');
    const scheduleDelete=document.getElementById('scheduledelete');
    const searchDate=document.getElementById('clickdate');

    //checks if all elmements exist before adding listeners 
    if (rowElement) {
        rowElement.addEventListener('change', addMaintenanceInputs);
        rowElement.addEventListener('change', changeMaintenanceData);
    }

    if (searchMaintenanceButton) {
        searchMaintenanceButton.addEventListener('click', searchMaintenance);
    }

    if (searchDateButton) {
        searchDateButton.addEventListener('click', filterData);
    }

    if (systemRowElement) {
        systemRowElement.addEventListener('change', addSystemInputs);
        systemRowElement.addEventListener('change', changeSystemData);

    }
    if(projRowElement){
        projRowElement.addEventListener('change',addProjectInputs);
        projRowElement.addEventListener('change',changeProjectData);

    }
    if(scheduleRowElement){
        scheduleRowElement.addEventListener('change',addScheduleInputs);
        scheduleRowElement.addEventListener('change',changeScheduleData);

    }
    if(pumpRowElement){
        pumpRowElement.addEventListener('change',addPumpInputs);
        pumpRowElement.addEventListener('change',changePumpData);

    }
    if (projDelete){
        projDelete.addEventListener('click', deleteProjectData);
    }
    if (systemDelete){
        systemDelete.addEventListener('click', deleteSystemData);
    }
    if (pumpDelete){
        pumpDelete.addEventListener('click', deletePumpData);
    }
    if (scheduleDelete){
        scheduleDelete.addEventListener('click', deleteScheduleData);
    }
    if(searchDate){
        searchDate.addEventListener('click',filterByMonth);
    }
});
