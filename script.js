document.addEventListener("DOMContentLoaded", function () {
    fetch("/get_data")  // Call Flask API
        .then(response => response.json())  // Convert response to JSON
        .then(data => {
            const tableBody = document.getElementById("data-table");
            tableBody.innerHTML = ""; // Clear loading message

            data.forEach(row => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
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
            console.error("Error loading data:", error);
            document.getElementById("data-table").innerHTML = `<tr><td colspan="6">Error loading data.</td></tr>`;
        });
});
