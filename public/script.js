function login(){
fetch('/login',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
        username: username.value,
        password: password.value
    })
})
.then(r=>r.json())
.then(d=>{
    if(d.success){
        localStorage.setItem("username", username.value); // 
        location='dashboard.html';
    } else {
        alert('Incorrect username or password. Please try again');
    }
});
}

function resetPassword(){
let key=prompt("favoritepasswordkey?");
fetch('/reset-password',{method:'POST',headers:{'Content-Type':'application/json'},
body:JSON.stringify({username:username.value,key})})
.then(r=>r.json()).then(d=>alert(d.success?'Reset to password':'Please provide correct your Favorite Password Key.'));
}

function add(){
    let username = localStorage.getItem("username");

    fetch('/add-record',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
            username: username,
            Date: document.getElementById("Date").value, // Changed from Date.value
            Company: document.getElementById("Company").value,
            URL: document.getElementById("URL").value,
            JobTitle: document.getElementById("JobTitle").value,
            JobDescription: document.getElementById("JobDescription").value,
            JobRequirement: document.getElementById("JobRequirement").value,
            AppliedStatus: document.getElementById("AppliedStatus").value,
            Responsestatus: document.getElementById("Responsestatus").value,
        })
    }).then(()=>load());
}



function load(){
    let username = localStorage.getItem("username");
    let editId = localStorage.getItem("editId");

    fetch('/records/' + username)
    .then(r=>r.json())
    .then(data=>{
        let html='';

        data.forEach(r=>{
            html += `<tr>
            <td>${r.Date ||''}</td>
            <td>${r.Company||''}</td>
            <td>${r.URL ? `<a href="${r.URL}" target="_blank">🔗 ${r.URL.length > 30 ? r.URL.substring(0, 27) + "..." : r.URL}</a>` : ''}</td>
            <td>${r.JobTitle||''}</td>
            <td>${r.AppliedStatus||''}</td>
            <td>${r.Responsestatus||''}</td>
         <td><button onclick="editFromDashboard(${r.id})">Edit</button></td>
           <td><button onclick="del(${r.id})">Delete</button></td>
            </tr>`;

            // preload edit row
            if(editId && r.id == editId){
                document.getElementById("Date").value = r.Date;
                Company.value = r.Company;
                URL.value = r.URL;
                JobTitle.value = r.JobTitle;

                AppliedStatus.value = r.AppliedStatus;
                JobDescription.value = r.JobDescription;
                JobRequirement.value = r.JobRequirement;
                Responsestatus.value = r.Responsestatus;

               // document.getElementById("Company").value = r.Company;    // Fixed ID    
                //document.getElementById("JobDescription").value = r.JobDescription;
                //document.getElementById("JobRequirement").value = r.JobRequirement;
                //document.getElementById("Responsestatus").value = r.Responsestatus;
                if(document.getElementById("addBtn")) document.getElementById("addBtn").style.display = "none";
                if(document.getElementById("updateBtn")) document.getElementById("updateBtn").style.display = "inline-block";
                if(document.getElementById("cancelBtn")) document.getElementById("cancelBtn").style.display = "inline-block";
               
              
            }
        });

        table.querySelector('tbody').innerHTML = html;
    });
}

function edit(id) {
    let username = localStorage.getItem("username");
    
    // Fetch the data to find the specific record
    fetch('/records/' + username)
    .then(r => r.json())
    .then(data => {
        const record = data.find(r => r.id == id);
        if (record) {
            // Fill the form using the correct IDs
            document.getElementById("Date").value = record.Date || '';
            document.getElementById("Company").value = record.Company || '';
            document.getElementById("URL").value = record.URL || '';
            document.getElementById("JobTitle").value = record.JobTitle || '';
            document.getElementById("JobDescription").value = record.JobDescription || '';
            document.getElementById("JobRequirement").value = record.JobRequirement || '';
            document.getElementById("AppliedStatus").value = record.AppliedStatus || '';
            document.getElementById("Responsestatus").value = record.Responsestatus || '';

            // Set the editId for the update function
            localStorage.setItem("editId", id);

            // Swap the buttons manually
            document.getElementById("addBtn").style.display = "none";
            document.getElementById("updateBtn").style.display = "inline-block";
            document.getElementById("cancelBtn").style.display = "inline-block";
        }
    });
}

function del(id){
fetch('/delete-record',{method:'POST',headers:{'Content-Type':'application/json'},
body:JSON.stringify({id})}).then(()=>load());
}

function saveProfile(){
    fetch('/update-user',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
            username: uname.value,
            password: pwd.value,
            title: title.value,
            key: key.value
        })
    })
    .then(()=>{
        alert('Saved');

        // Auto login new user
        localStorage.setItem("username", uname.value);
    });
}

function showCurrentUser(){
    let username = localStorage.getItem("username");

    if(username){
        document.getElementById("currentUser").innerText =
            "Welcome, " + username;
    } else {
        document.getElementById("currentUser").innerText =
            "Not logged in";
    }
}

function goToCreateUser(){
    // Clear any existing login user
    localStorage.removeItem("username");

    // Also clear edit mode if exists
    localStorage.removeItem("editId");
}
function loadProfile(){
    let username = localStorage.getItem("username");

    // If no user → DO NOT load anything (new user mode)
    if(!username) return;

    fetch('/user/' + username)
    .then(r=>r.json())
    .then(u=>{
        if(!u) return;

        uname.value = u.username;
        pwd.value = u.password;
        title.value = u.title;
        key.value = u.favoritepasswordkey;
    });
}

function newUser(){
    // Clear all fields
    document.getElementById("uname").value = "";
    document.getElementById("pwd").value = "";
    document.getElementById("title").value = "";
    document.getElementById("key").value = "";

    // Remove current logged-in user
    localStorage.removeItem("username");
}

function loadDashboard(){
    let username = localStorage.getItem("username");
    if(!username) return;

    fetch('/records/' + username)
    .then(r=>r.json())
    .then(data=>{
        let html='';

        data.forEach(r=>{
            let rawUrl = r.url || r.URL || ""; // Handle case sensitivity
            let safeUrl = rawUrl.startsWith("http") ? rawUrl : "https://" + rawUrl;
            let displayUrl = rawUrl.length > 30 ? rawUrl.substring(0, 27) + "..." : rawUrl;

            let urlCell = rawUrl ? `<a href="${safeUrl}" target="_blank">🔗 ${displayUrl}</a>` : "";

            html += `
            <tr onclick="rowClick('${safeUrl}')">
                <td>${r.Date || ''}</td>
                <td>${r.Company || ''}</td>
                <td>${urlCell}</td>
                <td>${r.JobTitle || ''}</td>
                <td>${r.JobDescription || ''}</td>
                <td>${r.JobRequirement || ''}</td>
                <td>${r.AppliedStatus || ''}</td>
                <td>${r.Responsestatus || ''}</td>
                <td>
                   <button onclick="editFromDashboard(${r.id})">Edit</button>
       
                    </td>
            </tr>`;
        });

        document.querySelector('#dashboardTable tbody').innerHTML = html;
    });
}
function rowClick(url){
    if(url && url !== "https://"){
        window.open(url, "_blank");
    }
}

function editFromDashboard(id) {
    // Store the record id so home.html knows we are in "Edit Mode"
    localStorage.setItem("editId", id);
    // Redirect to the management page
    window.location = "home.html";
}


function addNewFromDashboard(){
    localStorage.removeItem("editId");
    window.location = "home.html";
}

if(document.getElementById('table')) load();
if(document.getElementById('uname')) loadProfile();

window.onload = function(){

    // Show current user (home/dashboard)
    let username = localStorage.getItem("username");

    if(document.getElementById("currentUser")){
        document.getElementById("currentUser").innerText =
            username ? "Welcome, " + username : "Not logged in";
    }

    // Load table
    if(document.getElementById("table")){
        load();
    }

    // Profile page logic
    if(document.getElementById("uname")){
        if(username){
            loadProfile();
            document.querySelector("h2").innerText = "User Profile";
        } else {
            document.querySelector("h2").innerText = "Create New User";
        }
    }

    // Dashboard
    if(document.getElementById("dashboardTable")){
        loadDashboard();
    }

    let editId = localStorage.getItem("editId");
    if (editId) {
    document.getElementById("addBtn").style.display = "none";
    document.getElementById("updateBtn").style.display = "inline-block";
    document.getElementById("cancelBtn").style.display = "inline-block";
}
};

function update() {
    let editId = localStorage.getItem("editId");
    
    fetch('/update-record', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: editId,
            Date: document.getElementById("Date").value, // Changed from Date.value
            Company: document.getElementById("Company").value,
            URL: document.getElementById("URL").value,
            JobTitle: document.getElementById("JobTitle").value,
            JobDescription: document.getElementById("JobDescription").value,
            JobRequirement: document.getElementById("JobRequirement").value,   
            AppliedStatus: document.getElementById("AppliedStatus").value,
            Responsestatus: document.getElementById("Responsestatus").value,
        })
    }).then(() => {
        localStorage.removeItem("editId"); 
        location.reload(); 
    });
}
function cancelEdit() {
    localStorage.removeItem("editId");
    location.reload(); // Resets the form and buttons
}
let sortAsc = true; // toggle state

function sortByDate(){
    let table = document.querySelector("table tbody");
    let rows = Array.from(table.querySelectorAll("tr"));

    rows.sort((a, b) => {
        let dateA = new Date(a.children[0].innerText);
        let dateB = new Date(b.children[0].innerText);

        return sortAsc ? dateA - dateB : dateB - dateA;
    });

    // toggle direction
    sortAsc = !sortAsc;

    // re-append sorted rows
    table.innerHTML = "";
    rows.forEach(row => table.appendChild(row));
}

function clearEdit() {
    localStorage.removeItem("editId");
}