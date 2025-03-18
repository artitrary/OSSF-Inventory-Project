const mtable = document.getElementById('maintenance-data');
const d=document.getElementById('mjsinput');

document.addEventListener("DOMContentLoaded", function () {

    // Fetch Maintenance Logs
    fetch("/get_maintenance_data")
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById("maintenance-data");
            tableBody.innerHTML = ""; // Clear loading message

            data.forEach(row => {
                const tr = document.createElement("tr");

                // Create checkbox cell
                const checkboxCell = document.createElement("td");
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkboxCell.appendChild(checkbox);
                tr.appendChild(checkboxCell);

                // Add data cells
                tr.innerHTML += `
                    <td>${row.MaintenanceID}</td>
                    <td>${row.SystemID}</td>
                    <td>${row.ProjectID}</td>
                    <td>${new Date(row.MaintenanceDate).toLocaleDateString()}</td>
                    <td>${row.Description}</td>
                    <td>${row.ScheduleID}</td>
                `;
                tableBody.appendChild(tr);
            });
        })
        .catch(error => {
            console.error("Error loading maintenance data:", error);
            document.getElementById("maintenance-data").innerHTML = `<tr><td colspan="7">Error loading data.</td></tr>`;
        });

    // Fetch System Data
    fetch("/get_system_data")
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById("system-data");
            tableBody.innerHTML = "";
            data.forEach(row => {
                const tr = document.createElement("tr");

                // Create checkbox cell
                const checkboxCell = document.createElement("td");
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkboxCell.appendChild(checkbox);
                tr.appendChild(checkboxCell);

                // Add data cells
                tr.innerHTML += `
                    <td>${row.SystemID}</td>
                    <td>${row.SystemName}</td>
                    <td>${row.Aerator}</td>
                    <td>${row.PumpID}</td>
                    <td>${row.Description}</td>
                    <td>${row.AdditionalComp}</td>
                    <td>${row.Manufacturer}</td>
                    <td>${row.GPD}</td>
                    <td>${row.Manual}</td>
                `;
                tableBody.appendChild(tr);
            });
        })
        .catch(error => {
            console.error("Error loading system data:", error);
            document.getElementById("system-data").innerHTML = `<tr><td colspan="10">Error loading data.</td></tr>`;
        });

    // Fetch Project Data
    fetch("/get_project_data")
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById("project-data");
            tableBody.innerHTML = ""; // Clear loading message
            data.forEach(row => {
                const tr = document.createElement("tr");

                // Create checkbox cell
                const checkboxCell = document.createElement("td");
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.className = "row-checkbox"; // Optional class for styling
                checkboxCell.appendChild(checkbox);
                tr.appendChild(checkboxCell);

                // Add data cells
                tr.innerHTML += `
                    <td>${row.ProjectID}</td>
                    <td>${row.ProjectName}</td>
                    <td>${row.Description}</td>
                    <td>${row.Funded}</td>
                    <td>${new Date(row.StartDate).toLocaleDateString()}</td>
                    <td>${new Date(row.EndDate).toLocaleDateString()}</td>
                `;
                tableBody.appendChild(tr);
            });
        })
        .catch(error => {
            console.error("Error loading project data:", error);
            document.getElementById("project-data").innerHTML = `<tr><td colspan="6">Error loading data.</td></tr>`;
        });
        
    // Fetch Schedule Data
    fetch("/get_schedule_data")
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById("schedule-data");
            tableBody.innerHTML = ""; // Clear loading message
            data.forEach(row => {
                const tr = document.createElement("tr");

                // Create checkbox cell
                const checkboxCell = document.createElement("td");
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.className = "row-checkbox"; // Optional class for styling
                checkboxCell.appendChild(checkbox);
                tr.appendChild(checkboxCell);

                // Add data cells
                tr.innerHTML += `
                    <td>${row.ScheduleID}</td>
                    <td>${new Date(row.Date).toLocaleDateString()}</td>
                    <td>${row.Description}</td>
                `;
                tableBody.appendChild(tr);
            });
            schedule();
        })
        .catch(error => {
            console.error("Error loading schedule data:", error);
            document.getElementById("schedule-data").innerHTML = `<tr><td colspan="3">Error loading data.</td></tr>`;
        });

    // Fetch Pump Data
    fetch("/get_pump_data")
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById("pump-data");
            tableBody.innerHTML = ""; // Clear loading message
            data.forEach(row => {
                const tr = document.createElement("tr");

                // Create checkbox cell
                const checkboxCell = document.createElement("td");
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.className = "row-checkbox"; // Optional class for styling
                checkboxCell.appendChild(checkbox);
                tr.appendChild(checkboxCell);

                // Add data cells
                tr.innerHTML += `
                    <td>${row.PumpID}</td>
                    <td>${row.Model}</td>
                    <td>${row.Quantity}</td>
                    <td>${row.PartNumber}</td>
                    <td>${row.Brand}</td>
                    <td>${row.Manual}</td>
                `;
                tableBody.appendChild(tr);
            });
        })
        .catch(error => {
            console.error("Error loading pump data:", error);
            document.getElementById("pump-data").innerHTML = `<tr><td colspan="7">Error loading data.</td></tr>`;
        });
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

// Fetch Schedule Data
async function fetchScheduleData() {
    if (scheduleData.length === 0) {
        try {
            const response = await fetch("/get_schedule_data");
            scheduleData = await response.json();
            console.log("Fetched schedule data:", scheduleData);
        } catch (error) {
            alert("Error loading schedule data.");
        }
    }
    return scheduleData;
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
// Function to add Maintenance Log
function addMaintenance() {
    const maintenanceData = {
        SystemID: document.getElementById("system-id").value,
        ProjectID: document.getElementById("project-id").value,
        MaintenanceDate: document.getElementById("maintenance-date").value,
        Description: document.getElementById("description").value,
        ScheduleID: document.getElementById("schedule-id").value
    };

    fetch("/add_maintenance_data", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(maintenanceData)
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message); // Show success message
    })
    .catch(error => {
        console.error("Error adding maintenance data:", error);
    });
}



function schedule() {
    // Get today's date
    let date = new Date();
    date.setHours(0, 0, 0, 0);  // Set time to 00:00:00 for comparison

    const tableBody = document.getElementById("schedule-data"); // Get the tbody
    const rows = tableBody.querySelectorAll("tr"); // Get all rows in the tbody

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        // Get the date from the third cell (index 2)
        const dateCell = new Date(row.children[2].textContent);

        // Check if the row's date is earlier than today (red)
        if (dateCell < date) {
            row.style.backgroundColor = "red";
        } 
        // Check if the row's date is within the next 5 days (yellow)
        else if (dateCell <= new Date(date.getTime() + 5 * 24 * 60 * 60 * 1000)) {
            row.style.backgroundColor = "yellow";
        }
    }
}



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
    const mRows = mtable.querySelectorAll("tr");
    fetchProjectData(); // Ensure project data is loaded

    let pid = null;
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
        // Handle pump value if needed (you have not inplemnet pump search yet)
    }
}


//ADDING MAINTENANCE DATA
/*
You want to copy this input elsewhere but change the categoreis accoridnly
*/
function addMaintenanceInputs(){
    fetchProjectData();
    fetchScheduleData();
    fetchSystemData();
    if (document.getElementById('row').value==="addrow"){
        d.innerHTML="";
        const input=document.createElement('input');
        input.type='text';
        input.placeholder="SystemID";
        input.id="mSystemID"
        const input1=document.createElement('input');
        input1.type='text';
        input1.placeholder="ProjectID";
        input1.id="mProjectID"
        const input2=document.createElement('input');
        input2.type='text';
        input2.placeholder="Date";
        input2.id="mDate";
        const input3=document.createElement('input');
        input3.type='text';
        input3.placeholder="Description";
        input3.id="mDescription";

        const input4=document.createElement('input');
        input4.type='text';
        input4.placeholder="Schedule";
        input4.id="mSchedule"
        d.appendChild(input);
        d.appendChild(input1);
        d.appendChild(input2);
        d.appendChild(input3);
        d.appendChild(input4);
        document.getElementById('maintenanceimplement').onclick = function () {
            

            let isProjectFound = false; // Flag to indicate if the project was found
            let isScheduleFound=false;
            let isSystemFound=false;
            console.log(scheduleData);
    // Loop through the projectData array
            for (let i = 0; i < projectData.length; i++) {
                const project = projectData[i];

                // Check if the ProjectID matches the input value
                if (Number(project.ProjectID) === Number(input1.value)) {
                    isProjectFound = true; // Mark the project as found
                    break; // Exit the loop as we've found a match
                }
            }
            for (let i = 0; i < scheduleData.length; i++) {
                const schedule = scheduleData[i];

                // Check if the ProjectID matches the input value
                if (Number(schedule.ScheduleID) === Number(input4.value)) {
                    isScheduleFound = true; // Mark the project as found
                    break; // Exit the loop as we've found a match
                }
            }
            for (let i = 0; i < systemData.length; i++) {
                const system = systemData[i];

                // Check if the ProjectID matches the input value
                if (Number(system.SystemID) === Number(input.value)) {
                    isSystemFound = true; // Mark the project as found
                    break; // Exit the loop as we've found a match
                }
            }
            if (!isProjectFound) {
                alert('Invalid ProjectID');
            } else if (!isScheduleFound) {
                alert('Invalid ScheduleID');
            } else if (!isSystemFound) {
                alert('Invalid SystemID');
            }
            if (isProjectFound&&isScheduleFound&&isSystemFound){
                addMaintenanceData(input.value,input1.value, input2.value, input3.value, input4.value);
            }else{
                alert('invalid input')
            }
        };
    }
}
function addMaintenanceData(systemID, projectID, date, description, scheduleID) {
    
    const data = {
        SystemID: systemID,
        ProjectID: projectID,
        Date: date,  
        Description: description,
        ScheduleID: scheduleID
    };

    // Send the data to the server using a POST request
    fetch('/add_maintenance_data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            console.log('Success:', data.message);
            alert("Maintenance data added successfully!");
            // Optionally refresh the table or give feedback
            updateTable(); // If you have a function to update the displayed table data
        } else {
            console.error('Failed to add data:', data);
            alert("Failed to add maintenance data.");
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function changeMaintenanceData() {
    
    if (document.getElementById('row').value === "changerow") {
        d.innerHTML = ""; // Clear existing content

        // Input for Maintenance ID (to select the record to be updated)
        const maintenanceIDInput = document.createElement('input');
        maintenanceIDInput.type = 'text';
        maintenanceIDInput.placeholder = "Please Input maintenanceID";
        maintenanceIDInput.id = "maintenanceID";
        d.appendChild(maintenanceIDInput);

        // Inputs for the fields to change
        const projectIDInput = document.createElement('input');
        projectIDInput.type = 'text';
        projectIDInput.placeholder = "Change ProjectID (optional)";
        projectIDInput.id = "mProjectID";
        d.appendChild(projectIDInput);

        const dateInput = document.createElement('input');
        dateInput.type = 'text';
        dateInput.placeholder = "Change Date (optional)";
        dateInput.id = "mDate";
        d.appendChild(dateInput);

        const descriptionInput = document.createElement('input');
        descriptionInput.type = 'text';
        descriptionInput.placeholder = "Change Description (optional)";
        descriptionInput.id = "mDescription";
        d.appendChild(descriptionInput);

        const scheduleIDInput = document.createElement('input');
        scheduleIDInput.type = 'text';
        scheduleIDInput.placeholder = "Change ScheduleID (optional)";
        scheduleIDInput.id = "mSchedule";
        d.appendChild(scheduleIDInput);

        // Button to submit the changes
        document.getElementById('maintenanceimplement').onclick = function () {
            const maintenanceID = maintenanceIDInput.value;
            const projectID = projectIDInput.value || null;
            const date = dateInput.value || null;
            const description = descriptionInput.value || null;
            const scheduleID = scheduleIDInput.value || null;

            // Call function to send update to the server
            updateMaintenanceData(maintenanceID, projectID, date, description, scheduleID);
        };
    }
}

function updateMaintenanceData(maintenanceID, projectID, date, description, scheduleID) {
    // Prepare the data object, only including the fields that are provided
    const data = {};
    if (maintenanceID) data.maintenanceID = maintenanceID;
    if (projectID) data.projectID = projectID;
    if (date) data.date = date;
    if (description) data.description = description;
    if (scheduleID) data.scheduleID = scheduleID;

    // Send the update request to the server
    fetch('/update_maintenance_data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(responseData => {
        if (responseData.message) {
            console.log('Success:', responseData.message);
            alert("Maintenance data updated successfully!");
            // Optionally, refresh the data or update the table
            updateTable();
        } else {
            alert("Failed to update maintenance data.");
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert("There was an error with the request.");
    });
}


function deleteProjectData() {
    const selectedIds = [];
    const tableBody = document.getElementById('projectable');
    const rows = tableBody.querySelectorAll("tr");

    // Loop through all rows in the table and collect the selected row's ProjectID
    rows.forEach(row => {
        const checkbox = row.querySelector(".row-checkbox");
        if (checkbox && checkbox.checked) {
            const rowData = {
                ProjectID: Number(row.cells[1].textContent), // Assuming ProjectID is in the second cell
            };
            selectedIds.push(rowData.ProjectID);  // Collect ProjectIDs
        }
    });

    if (selectedIds.length > 0) {
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
                // Remove the rows from the table if deletion was successful
                selectedIds.forEach(id => {
                    tableBody.querySelectorAll("tr").forEach(row => {
                        // Ensure the correct column (project ID) is being checked
                        if (row.cells.length > 1 && Number(row.cells[1].textContent) === id) {
                            row.remove(); // Remove the row with the matching ProjectID
                        }
                    });
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

fetchProjectData();
fetchPumpData();
fetchScheduleData();
fetchSystemData();
document.getElementById('projectdelete').addEventListener('click',deleteProjectData);

document.getElementById('row').addEventListener('change', addMaintenanceInputs);
document.getElementById('row').addEventListener('change', changeMaintenanceData);
document.getElementById('searchmaintenance').addEventListener('click',searchMaintenance);
document.getElementById('searchdate').addEventListener('click',filterData);
