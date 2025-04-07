const mtable = document.getElementById('maintenance-data');
const d=document.getElementById('mjsinput');
console.log("Checking button:", document.getElementById('projectdelete')); 

document.addEventListener("DOMContentLoaded", function () {

    // Fetch Maintenance Logs
    // Fetch and populate data dynamically for all tables
    const fetchData = (endpoint, tableBodyId, headerRowId) => {
        fetch(endpoint)
            .then(response => response.json())
            .then(data => {
                const tableBody = document.getElementById(tableBodyId);
                const headerRow = document.getElementById(headerRowId);
                const columns = data.columns;
                const rows = data.data;
    
                // Clear existing content
                tableBody.innerHTML = "";
                headerRow.innerHTML = `<th>Select</th>`; // Add "Select" header
    
                // Create headers dynamically
                columns.forEach(col => {
                    const th = document.createElement("th");
                    th.innerHTML = col;
                    headerRow.appendChild(th);
                });
    
                // Populate rows dynamically
                rows.forEach(row => {
                    const tr = document.createElement("tr");
    
                    // Checkbox column
                    const checkboxCell = document.createElement("td");
                    const checkbox = document.createElement("input");
                    checkbox.type = "checkbox";

                    checkbox.classList.add("row-checkbox");

                    checkbox.setAttribute("data-project-id", row['projectid']);    // Set data-project-id with the ProjectID
                    checkbox.setAttribute("data-system-id", row['systemid']);      // Set data-system-id with the SystemID
                    checkbox.setAttribute("data-pump-id", row['pumpid']);        // Set data-pump-id with the PumpID
                    checkbox.setAttribute("data-schedule-id", row['scheduleid']); // Set data-schedule-id with the ScheduleID

                    checkboxCell.appendChild(checkbox);
                    tr.appendChild(checkboxCell);
    
                    // Data columns
                    columns.forEach(col => {
                        const td = document.createElement("td");
                        td.innerHTML = row[col] !== null ? row[col] : '';
                        tr.appendChild(td);
                    });
    
                    tableBody.appendChild(tr);
                });
            })
            .catch(error => {
                console.error(`Error loading data from ${endpoint}:`, error);
                document.getElementById(tableBodyId).innerHTML = `<tr><td colspan="10">Error loading data.</td></tr>`;
            });
    };
    
    // Fetch data for all tables
    fetchData("/get_maintenance_data", "maintenance-data", "maintenance-header-row");
    fetchData("/get_system_data", "system-data", "system-header-row");
    fetchData("/get_project_data", "project-data", "project-header-row");
    fetchData("/get_schedule_data", "schedule-data", "schedule-header-row");
    fetchData("/get_pump_data", "pump-data", "pump-header-row");

});

let projectData = [];
let pumpData = [];
let systemData = [];
let scheduleData = [];
// Fetch Pump Data
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

// Fetch System Data
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

async function fetchScheduleData() {
    if (!scheduleData || !scheduleData.data || scheduleData.data.length === 0) {
        try {
            const response = await fetch("/get_schedule_data");
            const data = await response.json();
            console.log("Fetched schedule data (raw):", data); // Log the raw data

            if (data.columns && data.data) {
                scheduleData = data;
                console.log("Schedule data loaded successfully:", scheduleData);
                generateScheduleRows(scheduleData); // Call to generate the rows
            } else {
                console.error("Fetched data does not have the expected structure:", data);
            }
        } catch (error) {
            console.error("Error loading schedule data:", error);
        }
    }
}

async function fetchProjectData() {
    if (projectData.length === 0) {  // Only fetch if data is empty
        try {
            const response = await fetch("/get_project_data");
            projectData = await response.json();
            console.log("Fetched project data:", projectData);

            
        } catch (error) {
            alert("Error loading project data.");
        }
    } else {
    }
    return projectData; // Return the fetched data
}
function generateScheduleRows(scheduleData) {
    console.log("Generating schedule rows...");
    
    // Check if scheduleData is valid
    if (!scheduleData || !scheduleData.columns || !scheduleData.data || scheduleData.data.length === 0) {
        console.error("Invalid schedule data received:", scheduleData);
        return;
    }

    const tableBody = document.getElementById("schedule-data");
    if (!tableBody) {
        console.error("Table body not found!");
        return;
    }

    const columns = scheduleData.columns;
    const rows = scheduleData.data;

    // Clear existing content
    tableBody.innerHTML = "";

    // Generate table headers dynamically
    const headerRow = document.getElementById("schedule-header-row");
    headerRow.innerHTML = "";

    // Add a checkbox header
    const checkboxHeader = document.createElement("th");
    checkboxHeader.innerText = "Select";
    headerRow.appendChild(checkboxHeader);

    // Add dynamic headers based on the columns
    columns.forEach(col => {
        const th = document.createElement("th");
        th.innerText = col;
        headerRow.appendChild(th);
    });

    // Generate rows dynamically
    rows.forEach(entry => {
        const tr = document.createElement("tr");
        tr.id = `schedule-row-${entry.scheduleid}`;

        // Add checkbox to the row
        const tdCheckbox = document.createElement("td");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        tdCheckbox.appendChild(checkbox);
        tr.appendChild(tdCheckbox);

        // Add data for each column in the row
        columns.forEach(col => {
            const td = document.createElement("td");

            // Handle the date column with a special class
            if (col === "date") {
                td.className = "schedule-date"; // Add a class for the date column
                td.innerText = entry[col] || "";  // Set the date value (empty if not available)
            } else {
                td.innerText = entry[col] || "";  // Set other values
            }

            tr.appendChild(td);
        });

        tableBody.appendChild(tr);
    });

    console.log("Rows generated.");
    schedule(); // Call to apply color coding on rows
}


function schedule() {
    if (!scheduleData || !scheduleData.data || scheduleData.data.length === 0) {
        console.log("No schedule data available.");
        return;
    }

    let date = new Date();
    date.setHours(0, 0, 0, 0);  // Set time to 00:00:00 for comparison
    console.log("Today's date:", date);

    // Loop through the schedule data (accessing the 'data' property of scheduleData)
    scheduleData.data.forEach(entry => {
        console.log("Processing schedule entry:", entry);

        // Ensure the entry has the expected properties
        if (!entry.scheduleid || !entry.date) {
            console.error("Invalid schedule entry:", entry);
            return;
        }

        const scheduleDate = new Date(entry.date);
        if (isNaN(scheduleDate)) {
            console.error("Invalid date format for entry:", entry);
            return;
        }

        const row = document.getElementById(`schedule-row-${entry.scheduleid}`);
        if (!row) {
            console.log(`Row for ScheduleID ${entry.scheduleid} not found.`);
            return;
        }

        const dateCellElement = row.querySelector('.schedule-date');
        if (!dateCellElement) {
            console.log(`Date cell for ScheduleID ${entry.scheduleid} not found.`);
            return;
        }

        console.log("Comparing with date:", scheduleDate);

        if (scheduleDate < date) {
            dateCellElement.style.backgroundColor = "rgb(255, 42, 46)"; // Red
            console.log(`Date is earlier than today, set to red: ${entry.scheduleid}`);
        } else if (scheduleDate <= new Date(date.getTime() + 5 * 24 * 60 * 60 * 1000)) {
            dateCellElement.style.backgroundColor = "rgb(248, 203, 46)"; // Yellow
            console.log(`Date is within the next 5 days, set to yellow: ${entry.scheduleid}`);
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("Page loaded, calling fetchScheduleData()...");
    fetchScheduleData();
});


function filterData() {
    const table = document.getElementById('maintenance-data');
    const rows = table.querySelectorAll("tr"); // Get all rows in the tbody

    const startParts = document.getElementById('startDate').value.split("-");
    const start = new Date(startParts[0], startParts[1] - 1, startParts[2]);
    start.setHours(0, 0, 0, 0);
    console.log("Start:", start);

    const endParts = document.getElementById('endDate').value.split("-");
    const end = new Date(endParts[0], endParts[1] - 1, endParts[2]);
    end.setHours(23, 59, 59, 999);
    console.log("End:", end);

    for (let i = 0; i < rows.length; i++) { 
        const row = rows[i];
        const logDate = new Date(row.children[4].textContent); 
        
        logDate.setHours(0, 0, 0, 0);
        console.log("Log Date:", logDate);

        if (logDate >= start && logDate <= end) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    }
}
function searchMaintenance() {
    console.log('what');
    const mRows = mtable.querySelectorAll("tr");
    fetchProjectData(); // Ensure project data is loaded

    let pid = null;
    let pumpid=null;
    let systemid=null;
    const pump = document.getElementById('searchpump');
    const proj = document.getElementById('searchproj');
    const schedule = document.getElementById('searchschedule');


    if (proj.value !== "") {
        // Loop through project data to find matching project
        for (let j = 0; j < projectData.length; j++) {
            const pRow = projectData[j];
            if (pRow.ProjectName.toLowerCase() === proj.value.toLowerCase()) {
                pid = Number(pRow.ProjectID); // Get ProjectID for the matched project name
                break; // Exit loop once match is found
            }
        }
        console.log("Project ID found:", pid);
        for (let i = 0; i < mRows.length; i++) {
            const mRow = mRows[i];
            if (Number(mRow.children[3].textContent) === pid) {
                mRow.style.display = ''; // Show row if ProjectID matches
            } else {
                mRow.style.display = 'none'; // Hide row if ProjectID doesn't match
            }
        }
    }

    if (schedule.value !== "") {
        console.log("Searching for schedule...");
        // Filter maintenance rows by ScheduleID
        for (let i = 0; i < mRows.length; i++) {
            const mRow = mRows[i];
            if (Number(mRow.children[6].textContent) === Number(schedule.value)) {
                mRow.style.display = ''; // Show row if ScheduleID matches
            } else {
                mRow.style.display = 'none'; // Hide row if ScheduleID doesn't match
            }
        }
    }

    if (pump.value !== "") {
        console.log("Searching for pump...");
        for (let j = 0; j < pumpData.length; j++) {
            const uRow = pumpData[j];
            if (uRow.Model.toLowerCase() === pump.value.toLowerCase()) {
                
                pumpid = Number(uRow.PumpID); // Get ProjectID for the matched project name
                break; // Exit loop once match is found
            }
        }
        console.log("Pump ID found:", pid);
        for (let j = 0; j < systemData.length; j++) {
            const sRow = systemData[j];
            if (Number(sRow.SystemID) === pumpid) {
                systemid = Number(sRow.SystemID); // Get ProjectID for the matched project name
                break; // Exit loop once match is found
            }
        }
        for (let i = 0; i < mRows.length; i++) {
            const mRow = mRows[i];
            if (Number(mRow.children[2].textContent) === systemid) {
                mRow.style.display = ''; // Show row if ProjectID matches
            } else {
                mRow.style.display = 'none'; // Hide row if ProjectID doesn't match
            }
        }
    }
}


//ADDING MAINTENANCE DATA
/*
You want to copy this input elsewhere but change the categoreis accoridnly
*/
function addMaintenanceInputs() {
    if (document.getElementById('row').value === "addrow") {
        fetch('/get_all_model_columns')
        .then(response => response.json())
        .then(allModelColumns => {
            // Clear the previous inputs if any
            d.innerHTML = "";
        
            // Get only the MaintenanceLog model columns
            const modelColumns = allModelColumns['MaintenanceLog'];  // Select only MaintenanceLog

            if (!modelColumns) {
                console.error('MaintenanceLog columns not found!');
                return;
            }

            // Loop through the model columns and create corresponding input fields
            for (let columnName in modelColumns) {
                const columnType = modelColumns[columnName];

                const input = document.createElement('input');
                input.placeholder = columnName.charAt(0).toUpperCase() + columnName.slice(1); // Capitalize first letter
                input.id = columnName; // Set the id to the column name
                input.name = columnName; // Optionally, set the name attribute as well

                // Handle different types based on columnType
                if (columnType.includes('INTEGER') || columnType.includes('INT')) {
                    input.type = 'number';  // If column is of type Integer, use number input
                } else if (columnType.includes('DATE')) {
                    input.type = 'date';  // If column is of type Date, use date input
                } else if (columnType.includes('VARCHAR') || columnType.includes('TEXT')) {
                    input.type = 'text';  // Default to text for other types like VARCHAR or TEXT
                } else {
                    input.type = 'text';  // Default to text for any unknown or unsupported types
                }

                d.appendChild(input); // Append the input to the form
            }

            // Add the button click handler for submitting the data
            document.getElementById('maintenanceimplement').onclick = function () {
                let isValid = true;
                const formData = {};

                // Gather all inputs and check for validity
                for (let columnName in modelColumns) {
                    const inputValue = document.getElementById(columnName).value;
                    if (!inputValue) {
                        isValid = false; // If any input is empty, mark as invalid
                        break;
                    }
                    formData[columnName] = inputValue;
                }

                if (isValid) {
                    // Submit the form data (you can modify the method and URL as needed)
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

function addMaintenanceData(data) {
    // Send data to the backend (modify this function as per your API endpoint)
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

function addProjectInputs() {
    const d = document.getElementById('projectjsinput');
        if (document.getElementById('projectrow').value === "addrow") {
            fetch('/get_all_model_columns')
            .then(response => response.json())
            .then(allModelColumns => {
                // Clear the previous inputs if any
                d.innerHTML = "";
            
                // Get only the Project model columns
                const modelColumns = allModelColumns['Project'];  // Select only Project
    
                if (!modelColumns) {
                    console.error('Project columns not found!');
                    return;
                }
    
                // Loop through the model columns and create corresponding input fields
                for (let columnName in modelColumns) {
                    const columnType = modelColumns[columnName];
    
                    if (columnName.toLowerCase() === 'projectid') continue;

                    const label = document.createElement('label');
                    label.setAttribute('for', columnName);  // Associate label with the input field
                    label.innerHTML = columnName.charAt(0).toUpperCase() + columnName.slice(1);  //
                    const input = document.createElement('input');
                    input.placeholder = columnName.charAt(0).toUpperCase() + columnName.slice(1); // Capitalize first letter
                    input.id = columnName; // Set the id to the column name
                    input.name = columnName; // Optionally, set the name attribute as well
                    // Handle different types based on columnType
                    if (columnType.includes('INTEGER') || columnType.includes('INT')) {
                        input.type = 'number';
                    } else if (columnType.includes('DATE')) {
                        input.type = 'date';
                    } else if (columnType.includes('BOOLEAN') || columnType.includes('TINYINT(1)')) {
                        input.value = "true";  // Value when checked
                    } else {
                        input.type = 'text'; // Default to text
                    }
                
                    d.appendChild(label); // Append the input to the form

                    d.appendChild(input); // Append the input to the form
                }
    
                // Add the button click handler for submitting the data
                document.getElementById('projectimplement').onclick = function () {
                    let isValid = true;
                    const formData = {};
    
                    // Gather all inputs and check for validity
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
                    if (isValid) {
                        // Submit the form data (you can modify the method and URL as needed)
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
                updateTable(); // Refresh the table to show the new row
            } else {
                alert("Failed to add project.");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            //alert("There was an error with the request.");
        });
    }
    
    function addSystemInputs() {
        fetchPumpData(); // Ensure pump data is loaded before checking validity
        const d = document.getElementById('systemjsinput');
        if (document.getElementById('systemrow').value === "addrow") {
            fetch('/get_all_model_columns')
            .then(response => response.json())
            .then(allModelColumns => {
                // Clear the previous inputs if any
                d.innerHTML = "";
    
                // Get only the System model columns
                const modelColumns = allModelColumns['System'];  // Select only System
    
                if (!modelColumns) {
                    console.error('System columns not found!');
                    return;
                }
    
                // Loop through the model columns and create corresponding input fields
                for (let columnName in modelColumns) {
                    const columnType = modelColumns[columnName];
                    
                    if (columnName.toLowerCase() === 'systemid') continue;

                    const input = document.createElement('input');
                    input.placeholder = columnName.charAt(0).toUpperCase() + columnName.slice(1); // Capitalize first letter
                    input.id = columnName; // Set the id to the column name
                    input.name = columnName; // Optionally, set the name attribute as well
    
                    // Handle different types based on columnType
                    if (columnType.includes('INTEGER') || columnType.includes('INT')) {
                        input.type = 'number';  // If column is of type Integer, use number input
                    } else if (columnType.includes('DATE')) {
                        input.type = 'date';  // If column is of type Date, use date input
                    } else if (columnType.includes('VARCHAR') || columnType.includes('TEXT')) {
                        input.type = 'text';  // Default to text for other types like VARCHAR or TEXT
                    } else {
                        input.type = 'text';  // Default to text for any unknown or unsupported types
                    }
    
                    d.appendChild(input); // Append the input to the form
                }
    
                // Add the button click handler for submitting the data
                document.getElementById('systemimplement').onclick = function () {
                    let isValid = true;
                    const formData = {};
    
                    // Gather all inputs and check for validity
                    for (let columnName in modelColumns) {
                        console.log(columnName);
                        const inputElements = document.getElementsByName(columnName);
                        inputElements.forEach((inputElement) => {
                            const inputValue = inputElement.value;
                            
                            if (!inputValue) {
                                isValid = false; // If any input is empty, mark as invalid
                            } else {
                                formData[columnName] = inputValue; // Store the input value
                            }
                        });
                    }
    
                    if (isValid) {
                        // Submit the form data (you can modify the method and URL as needed)
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
                updateTable(); // Refresh the table to show the new row
            } else {
                alert("Failed to add system.");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            //alert("There was an error with the request.");
        });
    }
    

// Function to create input fields for adding schedule data
function addScheduleInputs() {
    const d = document.getElementById('schedulejsinput');
    
    if (document.getElementById('schedulerow').value === "addrow") {
        fetch('/get_all_model_columns')
        .then(response => response.json())
        .then(allModelColumns => {
            const d = document.getElementById('schedulejsinput');
            // Clear previous inputs if any
            d.innerHTML = "";

            // Get only the Schedule model columns
            const modelColumns = allModelColumns['Schedule'];  // Select only Schedule

            if (!modelColumns) {
                console.error('Schedule columns not found!');
                return;
            }

            // Loop through the model columns and create corresponding input fields
            for (let columnName in modelColumns) {
                const columnType = modelColumns[columnName];

                if (columnName.toLowerCase() === 'scheduleid') continue;

                const input = document.createElement('input');
                input.placeholder = columnName.charAt(0).toUpperCase() + columnName.slice(1); // Capitalize first letter
                input.id = columnName; // Set the id to the column name
                input.name = columnName; // Optionally, set the name attribute as well

                // Handle different types based on columnType
                if (columnType.includes('INTEGER') || columnType.includes('INT')) {
                    input.type = 'number';  // If column is of type Integer, use number input
                } else if (columnType.includes('DATE')) {
                    input.type = 'date';  // If column is of type Date, use date input
                } else if (columnType.includes('VARCHAR') || columnType.includes('TEXT')) {
                    input.type = 'text';  // Default to text for other types like VARCHAR or TEXT
                } else {
                    input.type = 'text';  // Default to text for any unknown or unsupported types
                }

                d.appendChild(input); // Append the input to the form
            }

            // Add the button click handler for submitting the data
            document.getElementById('scheduleimplement').onclick = function () {
                let isValid = true;
                const formData = {};
                // Gather all inputs and check for validity
                for (let columnName in modelColumns) {
                    console.log(columnName);
                    const inputElements = document.getElementsByName(columnName);
                    inputElements.forEach((inputElement) => {
                        const inputValue = inputElement.value;
                        
                        if (!inputValue) {
                            isValid = false; // If any input is empty, mark as invalid
                        } else {
                            formData[columnName] = inputValue; // Store the input value
                        }
                    });
                }

                if (isValid) {
                    // Submit the form data (you can modify the method and URL as needed)
                    addScheduleData(formData);
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

function addScheduleData(data) {
    fetch('/add_schedule_data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(responseData => {
        if (responseData.message) {
            alert("Schedule added successfully!");
            updateTable(); // Refresh the table to show the new row
        } else {
            //alert("Failed to add schedule.");
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
function addPumpInputs() {
    const d = document.getElementById('pumpjsinput');

    if (document.getElementById('pumprow').value === "addrow") {
        fetch('/get_all_model_columns')
        .then(response => response.json())
        .then(allModelColumns => {
            // Clear existing content
            d.innerHTML = "";

            // Get only the Pump model columns
            const modelColumns = allModelColumns['Pump'];  // Select only Pump

            if (!modelColumns) {
                console.error('Pump columns not found!');
                return;
            }

            // Loop through the model columns and create corresponding input fields
            for (let columnName in modelColumns) {
                const columnType = modelColumns[columnName];

                if (columnName.toLowerCase() === 'pumpid') continue;

                const input = document.createElement('input');
                input.placeholder = columnName.charAt(0).toUpperCase() + columnName.slice(1); // Capitalize first letter
                input.id = columnName; // Set the id to the column name
                input.name = columnName; // Optionally, set the name attribute as well

                // Handle different types based on columnType
                if (columnType.includes('INTEGER') || columnType.includes('INT')) {
                    input.type = 'number';  // If column is of type Integer, use number input
                } else if (columnType.includes('DATE')) {
                    input.type = 'date';  // If column is of type Date, use date input
                } else if (columnType.includes('VARCHAR') || columnType.includes('TEXT')) {
                    input.type = 'text';  // Default to text for other types like VARCHAR or TEXT
                } else {
                    input.type = 'text';  // Default to text for any unknown or unsupported types
                }

                d.appendChild(input); // Append the input to the form
            }

            // Add the button click handler for submitting the data
            document.getElementById('pumpimplement').onclick = function () {
                let isValid = true;
                const formData = {};
                const pumpID = "PUMP-" + new Date().getTime(); // Generate unique PumpID

                // Gather all inputs and check for validity
                for (let columnName in modelColumns) {
                    console.log(columnName);
                    const inputElements = document.getElementsByName(columnName);
                    inputElements.forEach((inputElement) => {
                        const inputValue = inputElement.value;
                        
                        if (!inputValue) {
                            isValid = false; // If any input is empty, mark as invalid
                        } else {
                            formData[columnName] = inputValue; // Store the input value
                        }
                    });
                }

                if (isValid) {
                    // Submit the form data (you can modify the method and URL as needed)
                    formData['PumpID'] = pumpID; // Add the unique PumpID to the form data
                    addPumpData(formData);
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

function addPumpData(data) {
    fetch('/add_pump_data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(responseData => {
        if (responseData.message) {
            alert("Pump data added successfully!");
            updateTable(); // Refresh the table to show the new row
        } else {
            alert("Failed to add pump.");
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}




function updateMaintenanceData() {
    if (document.getElementById('row').value === "changerow") {
        // Clear any previous inputs
        d.innerHTML = '';
    
        // Fetch the model columns for all tables and filter for MaintenanceLog
        fetch('/get_all_model_columns')
            .then(response => response.json())
            .then(allModelColumns => {
                // Get only the MaintenanceLog columns
                const columns = allModelColumns['MaintenanceLog'];  // Select only MaintenanceLog columns

                if (!columns) {
                    console.error('MaintenanceLog columns not found!');
                    alert('Error: MaintenanceLog columns not found.');
                    return;
                }

                // Loop through the columns and create corresponding input fields
                for (const [columnName, columnType] of Object.entries(columns)) {
                    const input = document.createElement('input');
                    input.placeholder = columnName.charAt(0).toUpperCase() + columnName.slice(1);  // Capitalize the first letter of the field name
                    input.id = columnName;  // Set the ID of the input to match the field name
                    input.name = columnName;  // Optionally set the name attribute as well
                
                    // Set input types based on column type
                    if (columnType.includes('INTEGER') || columnType.includes('INT')) {
                        input.type = 'number';  // If column is of type Integer, use number input
                    } else if (columnType.includes('DATE')) {
                        input.type = 'date';  // If column is of type Date, use date input
                    } else if (columnType.includes('VARCHAR') || columnType.includes('TEXT')) {
                        input.type = 'text';  // Default to text for other types like VARCHAR or TEXT
                    } else {
                        input.type = 'text';  // Default to text for any unknown or unsupported types
                    }
                
    
                    // Append input fields to the form container
                    d.appendChild(input);
                    d.appendChild(document.createElement('br'));  // Line break between inputs
                }
    
                // Create the Maintenance ID input field dynamically (or you can have a fixed one in the HTML)
                const maintenanceIDInput = document.createElement('input');
                maintenanceIDInput.type = 'text';
                maintenanceIDInput.placeholder = 'Enter Maintenance ID';
                maintenanceIDInput.id = 'maintenanceID';
                d.appendChild(maintenanceIDInput);
    
                // Add the button click handler to update the record
                document.getElementById('maintenanceimplement').onclick = function () {
                    const maintenanceID = document.getElementById('maintenanceID').value; // Get maintenance ID from dynamic input
                    if (!maintenanceID) {
                        alert('Please enter a valid maintenance ID.');
                        return;
                    }
    
                    const updatedData = { maintenanceID };  // Include the maintenanceID for the update
    
                    // Gather all input values
                    for (const [columnName] of Object.entries(columns)) {
                        const inputValue = document.getElementById(columnName).value;
                        if (inputValue) {
                            updatedData[columnName] = inputValue;  // Add the value for each field
                        }
                    }
    
                    // Send the updated data to the server
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
                            updateTable();  // Optionally refresh the table
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
function changeSystemData() {
    const d = document.getElementById('systemjsinput');
    
    if (document.getElementById('systemrow').value === "changerow") {
        // Clear any previous inputs
        d.innerHTML = '';

        // Fetch the model columns for all tables and filter for System
        fetch('/get_all_model_columns')
            .then(response => response.json())
            .then(allModelColumns => {
                // Get only the System columns
                const columns = allModelColumns['System'];  // Select only System columns

                if (!columns) {
                    console.error('System columns not found!');
                    alert('Error: System columns not found.');
                    return;
                }

                // Create the System ID input field first
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

                // Loop through the columns and create corresponding input fields
                for (const [columnName, columnType] of Object.entries(columns)) {
                    if (columnName.toLowerCase() === 'systemid') {
                        continue;  // Skip forming the input field for system_id
                    }
                    
                    const label = document.createElement('label');
                    label.setAttribute('for', columnName);
                    label.innerHTML = columnName.charAt(0).toUpperCase() + columnName.slice(1);
                    d.appendChild(label);
                    
                    const input = document.createElement('input');
                    input.placeholder = columnName.charAt(0).toUpperCase() + columnName.slice(1);
                    input.id = columnName;
                    input.name = columnName;
                
                    // Set input types based on column type
                    if (columnType.includes('INTEGER') || columnType.includes('INT')) {
                        input.type = 'number';
                    } else if (columnType.includes('DATE')) {
                        input.type = 'date';
                    } else if (columnType.includes('VARCHAR') || columnType.includes('TEXT')) {
                        input.type = 'text';
                    } else {
                        input.type = 'text';
                    }

                    // Append input fields to the form container
                    d.appendChild(input);
                    d.appendChild(document.createElement('br'));
                }

                // Add the button click handler to update the record
                document.getElementById('systemimplement').onclick = function () {
                    // First check if SystemID exists and has a value
                    const systemId = document.getElementById('SystemID');
                    if (!systemId || !systemId.value) {
                        alert('Please enter a valid system ID.');
                        return;
                    }

                    // Create the data object with the system_id in the format expected by the server
                    const updatedData = { system_id: systemId.value };
                    
                    console.log("Starting to gather input values...");
                    
                    // Gather all input values with proper error handling
                    for (const columnName in columns) {
                        // Skip SystemID as we've already handled it
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

                    // Send the updated data to the server
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
                            // Optionally refresh the table
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





function changeProjectData() {
    const d = document.getElementById('projectjsinput');
    
    if (document.getElementById('projectrow').value === "changerow") {
        d.innerHTML = ''; // Clear any previous inputs

        // Fetch the model columns for all tables and filter for Project
        fetch('/get_all_model_columns')
            .then(response => response.json())
            .then(allModelColumns => {
                const columns = allModelColumns['Project'];  // Select only Project columns

                if (!columns) {
                    console.error('Project columns not found!');
                    alert('Error: Project columns not found.');
                    return;
                }

                // Add the Project ID input field first
                const projectIdLabel = document.createElement('label');
                projectIdLabel.setAttribute('for', 'project_id');  // Note the snake_case format
                projectIdLabel.innerHTML = 'Project ID';
                d.appendChild(projectIdLabel);
                
                const project_id_input = document.createElement('input');
                project_id_input.type = 'number';  // Most likely ProjectID is a number
                project_id_input.placeholder = 'Enter Project ID';
                project_id_input.id = 'project_id';  // Using snake_case to match server expectations
                d.appendChild(project_id_input);
                d.appendChild(document.createElement('br'));

                // Loop through the columns and create corresponding input fields
                for (const [columnName, columnType] of Object.entries(columns)) {
                    if (columnName.toLowerCase() === 'projectid') {
                        continue;  // Skip forming the input field for project_id
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
                        input.type = 'text'; // Keep as text to handle 'true' or 'false'
                    } else {
                        input.type = 'text';  // Default to text for unsupported types
                    }

                    d.appendChild(label);
                    d.appendChild(input);
                    d.appendChild(document.createElement('br'));
                }

                // Add the button click handler to update the record
                document.getElementById('projectimplement').onclick = function () {
                    // First check if project_id exists and has a value
                    const projectIdElement = document.getElementById('project_id');
                    if (!projectIdElement || !projectIdElement.value) {
                        alert('Project ID is required!');
                        return;
                    }
                    
                    // Initialize the data object with project_id in the correct format
                    const updatedData = {
                        project_id: projectIdElement.value  // Using snake_case as expected by the server
                    };

                    console.log("Initial data with project_id:", updatedData);

                    // Gather all input values with error handling
                    for (const [columnName, columnType] of Object.entries(columns)) {
                        if (columnName.toLowerCase() === 'projectid') {
                            continue; // Skip ProjectID as we've already handled it
                        }
                        
                        const inputElement = document.getElementById(columnName);
                        if (!inputElement) {
                            console.warn(`Input element with ID ${columnName} not found`);
                            continue;
                        }
                        
                        const inputValue = inputElement.value;
                        
                        // Only add non-empty values
                        if (inputValue !== "" && inputValue !== null) {
                            if (columnType.includes('BOOLEAN')) {
                                // Handle boolean fields by converting 'true'/'false' string to boolean
                                if (inputValue.toLowerCase() === 'true') {
                                    updatedData[columnName] = true;
                                } else if (inputValue.toLowerCase() === 'false') {
                                    updatedData[columnName] = false;
                                } else {
                                    updatedData[columnName] = inputValue; // Keep original value if not recognized
                                }
                            } else {
                                updatedData[columnName] = inputValue;
                            }
                        }
                    }

                    console.log("Final data to be sent:", updatedData);

                    // Send the updated data to the server
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
                            // Optionally refresh the project table
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

function changeScheduleData() {
    const d = document.getElementById('schedulejsinput');

    if (document.getElementById('schedulerow').value === "changerow") {
        d.innerHTML = ""; // Clear existing content

        // Fetch schedule columns and dynamically create inputs
        fetch('/get_all_model_columns')
            .then(response => response.json())
            .then(allModelColumns => {
                const columns = allModelColumns['Schedule'];  // Assuming Schedule is the model

                if (!columns) {
                    console.error('Schedule columns not found!');
                    alert('Error: Schedule columns not found.');
                    return;
                }

                // Loop through the columns and create input fields
                for (const [columnName, columnType] of Object.entries(columns)) {
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
                        input.type = 'text';  // Default to text
                    }

                    d.appendChild(input);
                    d.appendChild(document.createElement('br'));
                }

                // Add button click handler to update the record
                document.getElementById('scheduleimplement').onclick = function () {
                    const updatedData = {};

                    // Gather all input values
                    for (const [columnName] of Object.entries(columns)) {
                        const inputValue = document.getElementById(columnName).value;
                        if (inputValue) {
                            updatedData[columnName] = inputValue;
                        }
                    }

                    // Make sure ScheduleID is included in the updated data
                    const scheduleId = document.getElementById('scheduleid').value; // assuming you have an element for ScheduleID
                    updatedData['ScheduleID'] = scheduleId; // Include ScheduleID for the update

                    // Send the updated data to the server
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
                            d.innerHTML = ""; // Optionally clear the form
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


function changePumpData() {
    const d = document.getElementById('pumpjsinput');

    if (document.getElementById('pumprow').value === "changerow") {
        d.innerHTML = ""; // Clear existing content

        // Fetch pump columns and dynamically create inputs
        fetch('/get_all_model_columns')
            .then(response => response.json())
            .then(allModelColumns => {
                const columns = allModelColumns['Pump'];  // Assuming Pump is the model

                if (!columns) {
                    console.error('Pump columns not found!');
                    alert('Error: Pump columns not found.');
                    return;
                }

                // Create PumpID input field first
                const pumpIdInput = document.createElement('input');
                pumpIdInput.placeholder = "PumpID";
                pumpIdInput.id = "PumpID";
                pumpIdInput.name = "PumpID";
                pumpIdInput.type = "number"; // Assuming PumpID is an integer

                d.appendChild(pumpIdInput);
                d.appendChild(document.createElement('br'));

                // Loop through the columns and create input fields (excluding PumpID)
                for (const [columnName, columnType] of Object.entries(columns)) {
                    if (columnName.toLowerCase() !== 'pumpid') {  // Skip PumpID (handled above)
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
                            input.type = 'text';  // Default to text
                        }

                        d.appendChild(input);
                        d.appendChild(document.createElement('br'));
                    }
                }

                // Add button click handler to update the record
                document.getElementById('pumpimplement').onclick = function () {
                    const updatedData = {};
                    const pumpIdValue = document.getElementById("PumpID").value;

                    if (!pumpIdValue) {
                        alert("PumpID is required!");
                        return;
                    }

                    updatedData["PumpID"] = pumpIdValue; // Ensure PumpID is included

                    // Gather all input values
                    for (const [columnName] of Object.entries(columns)) {
                        if (columnName.toLowerCase() !== 'pumpid') {  // Skip PumpID
                            const inputValue = document.getElementById(columnName).value;
                            if (inputValue) {
                                updatedData[columnName] = inputValue;
                            }
                        }
                    }

                    // Send the updated data to the server
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
                            updatePumpTable();  // Refresh the table to reflect changes
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


function deleteProjectData() {
    const selectedIds = [];
    const tableBody = document.getElementById("projecttable");
    const checkboxes = tableBody.querySelectorAll(".row-checkbox");

    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selectedIds.push(Number(checkbox.dataset.projectId)); // Get ProjectID from data attribute
        }
    });

    if (selectedIds.length > 0) {
        // Log the selected IDs for debugging purposes
        console.log("Selected IDs to delete:", selectedIds);

        // Send the selected ProjectIDs to Flask for deletion
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
                    // Find the row by matching the ProjectID
                    const rowToDelete = tableBody.querySelector(`input[data-project-id="${id}"]`).closest("tr");
                    if (rowToDelete) {
                        rowToDelete.remove(); // Remove the entire row containing the matching ProjectID
                    }
                });
                alert('Rows deleted successfully');
            } else {
                alert('Failed to delete rows');
            }
        })
        .catch(error => {
            //console.error('Error deleting rows:', error);
            //alert('An error occurred while deleting rows');
        });
    } else {
        alert('No rows selected');
    }
}
function deleteScheduleData() {
    
    const selectedIds = [];
    const tableBody = document.getElementById("schedule-data"); // Make sure this matches your actual table ID
    const checkboxes = tableBody.querySelectorAll("input[type='checkbox']");
    console.log("Found checkboxes (any type):", checkboxes.length);    
    console.log('Checkboxes found:', checkboxes.length);
    
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            console.log('Selected Schedule ID:', checkbox.dataset.scheduleId); // Use lowercase 'i'
            selectedIds.push(Number(checkbox.parentNode.parentNode.querySelector("td:nth-child(2)").textContent));
        }
    });

    console.log('Selected IDs:', selectedIds);

    if (selectedIds.length > 0) {
        // Rest of your deletion code...
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
                    const rowToDelete = tableBody.querySelector(`input[data-schedule-id="${id}"]`).closest("tr");
                    if (rowToDelete) {
                        rowToDelete.remove();
                    }
                });
                alert('Rows deleted successfully');
            } else {
                alert('Failed to delete rows');
            }
        })
        .catch(error => {
            console.error('Error deleting rows:', error);
            //alert('An error occurred while deleting rows');
        });
    } else {
        alert('No rows selected');
    }
}


    

// Function to delete selected rows from the schedule table
function deletePumpData() {
    const selectedIds = [];
    const tableBody = document.getElementById("pumptable");
    const checkboxes = tableBody.querySelectorAll("input[type='checkbox']");

    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selectedIds.push(Number(checkbox.parentNode.parentNode.querySelector("td:nth-child(2)").textContent)); // Get ScheduleID from data attribute
        }
    });

    if (selectedIds.length > 0) {
        // Send the selected ScheduleIDs to Flask for deletion
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
                    // Find the row by matching the ScheduleID
                    const rowToDelete = tableBody.querySelector(`input[data-pump-id="${id}"]`).closest("tr");
                    if (rowToDelete) {
                        rowToDelete.remove(); // Remove the entire row containing the matching ScheduleID
                    }
                });
                alert('Rows deleted successfully');
            } else {
                alert('Failed to delete rows');
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


function deleteSystemData() {
    const selectedIds = [];
    const tableBody = document.getElementById("systemtable");
    const checkboxes = tableBody.querySelectorAll("input[type='checkbox']");

    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selectedIds.push(Number(checkbox.parentNode.parentNode.querySelector("td:nth-child(2)").textContent)); // Get ScheduleID from data attribute
        }
    });

    if (selectedIds.length > 0) {
        // Send the selected ScheduleIDs to Flask for deletion
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
                    // Find the row by matching the ScheduleID
                    const rowToDelete = tableBody.querySelector(`input[data-system-id="${id}"]`).closest("tr");
                    if (rowToDelete) {
                        rowToDelete.remove(); // Remove the entire row containing the matching ScheduleID
                    }
                });
                alert('Rows deleted successfully');
            } else {
                alert('Failed to delete rows');
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







// Add similar event listeners for other tables as needed...

function addColumn() {
    const tableName = document.getElementById("tableName").value;
    const columnName = document.getElementById("columnName").value;
    const columnType = document.getElementById("columnType").value;

    const data = {
        table_name: tableName,
        column_name: columnName,
        column_type: columnType
    };

    fetch("/add_column", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
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

function filterByMonth() {
    const mRows = document.getElementById('scheduletable').querySelectorAll("tr");
    const scheduleValue = document.getElementById('searchdate').value;

    if (scheduleValue !== "" && scheduleValue !== "Select a month") {
        const inputMonth = parseInt(scheduleValue, 10); // Convert dropdown value to an integer

        // Loop through schedule rows and check if the month matches
        for (let i = 0; i < mRows.length; i++) {
            const mRow = mRows[i];
            if (i === 0) continue; // Skip header row

            const rowDate = mRow.children[2]?.textContent; // Ensure the correct column is used
            if (!rowDate) continue;

            const rowDateObj = new Date(rowDate);
            const rowMonth = rowDateObj.getMonth();

            // Show or hide rows based on matching month
            mRow.style.display = rowMonth === inputMonth ? '' : 'none';
        }
    }
}




fetchProjectData();
fetchPumpData();
fetchScheduleData();
fetchSystemData();
document.addEventListener("DOMContentLoaded", function () {
    // Ensure elements exist before attaching event listeners
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
    // Check if the 'row' element exists before attaching event listeners
    if (rowElement) {
        rowElement.addEventListener('change', addMaintenanceInputs);
        rowElement.addEventListener('change', updateMaintenanceData);
    }

    // Check if the 'searchmaintenance' button exists
    if (searchMaintenanceButton) {
        searchMaintenanceButton.addEventListener('click', searchMaintenance);
    }

    // Check if the 'searchdate' button exists
    if (searchDateButton) {
        searchDateButton.addEventListener('click', filterData);
    }

    // Check if the 'systemrow' element exists
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
