const d=document.getElementById('jsinput');

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
function add(){
    if (document.getElementById('row').value==="addrow"){
        const input=document.createElement('input');
        input.type='text';
        input.placeholder="SystemID";
        const input1=document.createElement('input');
        input1.type='text';
        input1.placeholder="ProjectID";
        const input2=document.createElement('input');
        input2.type='text';
        input2.placeholder="Date";
        const input3=document.createElement('input');
        input3.type='text';
        input3.placeholder="Description";
        const input4=document.createElement('input');
        input4.type='text';
        input4.placeholder="Schedule";
        d.appendChild(input);
        d.appendChild(input1);
        d.appendChild(input2);
        d.appendChild(input3);
        d.appendChild(input4);
    }
    

}

function implementation(){
    d.innerHTML="";
}
document.getElementById('row').addEventListener('change', add);
document.getElementById('implement').addEventListener('click', implementation);