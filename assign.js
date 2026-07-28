// ============================
// Firebase Config
// ============================

const firebaseConfig = {
    apiKey: "AIzaSyAbjZrPfGx0UTBAW4HndPxf9mMhhmg513s",
    authDomain: "attendance-system-fc71c.firebaseapp.com",
    projectId: "attendance-system-fc71c",
    storageBucket: "attendance-system-fc71c.appspot.com",
    messagingSenderId: "57089003187",
    appId: "1:57089003187:web:dc8864aa56701384d6aac6"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

// ============================
// Variables
// ============================

let allRows = [];
let currentPage = 1;
let rowsPerPage = 50;
let sortDirection = {};


// ============================
// Listen Assigned Sites
// ============================
function listenAssignedSites(){

    db.collection("pendingSites")
    .onSnapshot(snapshot=>{

        console.log("Snapshot :", snapshot.size);

        const tbody = document.querySelector("#assignTable tbody");

        tbody.innerHTML = "";

        snapshot.forEach(doc=>{

            const d = doc.data();

            console.log(doc.id, d);

            // Sirf Assigned Record
            if(d.assigned !== true) return;

            if(!d.data) return;

            const row = {
                ...d.data,
                firestoreId: doc.id,
                assignedTo: d.assignedTo || "",
                assignedTime: d.assignedTime || "",
                projectId: d.projectId || ""
            };

            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${row["Indus ID"] || row["Indus Id"] || ""}</td>

                <td>${row["Site Name"] || row["Site"] || ""}</td>

                <td>${row["Tech Name"] || ""}</td>

                <td>${row["Tech Contact no"] || ""}</td>

                <td>
                    <span class="assignBadge">
                        ${row.assignedTo}
                    </span>
                </td>

                <td>${row["FSE Name"] || ""}</td>

                <td>${row["FSE Contact"] || ""}</td>

                <td>
                    <button class="mapBtn">
                        📍 Map
                    </button>
                </td>
            `;

            tbody.appendChild(tr);

        });

        allRows = [...tbody.querySelectorAll("tr")];

        updateCounts();

    });

}
// ============================
// Search + Filter
// ============================

function applyFilters(){

    const globalValue =
    document.getElementById("globalSearch")
    .value
    .trim()
    .toLowerCase();

    const filters =
    document.querySelectorAll(".filterRow input");

    allRows.forEach(row=>{

        let show = true;

        // Global Search
        if(globalValue){

            if(!row.innerText.toLowerCase().includes(globalValue)){

                show = false;

            }

        }

        // Column Filters
        filters.forEach((input,index)=>{

            const value =
            input.value.trim().toLowerCase();

            if(!value) return;

            const cell = row.cells[index];

            if(cell &&
               !cell.innerText.toLowerCase().includes(value)){

                show = false;

            }

        });

        row.style.display = show ? "" : "none";

    });

    updateCounts();

}

function globalSearch(){ applyFilters(); }

function filterTable(){ applyFilters(); }


// ============================
// Sorting
// ============================

function sortTable(columnIndex){

    const tbody =
    document.querySelector("#assignTable tbody");

    const rows =
    [...tbody.querySelectorAll("tr")];

    sortDirection[columnIndex] =
    !sortDirection[columnIndex];

    const asc = sortDirection[columnIndex];

    rows.sort((a,b)=>{

        let A =
        a.cells[columnIndex].innerText.trim().toLowerCase();

        let B =
        b.cells[columnIndex].innerText.trim().toLowerCase();

        if(!isNaN(A) && !isNaN(B)){

            return asc
                ? Number(A)-Number(B)
                : Number(B)-Number(A);

        }

        return asc
            ? A.localeCompare(B)
            : B.localeCompare(A);

    });

    rows.forEach(r=>tbody.appendChild(r));

    allRows = [...tbody.querySelectorAll("tr")];

}


// ============================
// Pagination
// ============================

function showPage(){

    const visibleRows =
    allRows.filter(r=>r.style.display!=="none");

    const start =
    (currentPage-1)*rowsPerPage;

    const end = start + rowsPerPage;

    visibleRows.forEach((row,index)=>{

        row.style.visibility =
        (index>=start && index<end)
        ? ""
        : "collapse";

    });

    const totalPages =
    Math.max(1,
    Math.ceil(visibleRows.length/rowsPerPage));

    document.getElementById("pageInfo").innerHTML =
    `Page ${currentPage} / ${totalPages}`;

    document.getElementById("totalPages").innerHTML =
    totalPages;

}

function nextPage(){

    const visibleRows =
    allRows.filter(r=>r.style.display!=="none");

    const totalPages =
    Math.ceil(visibleRows.length/rowsPerPage);

    if(currentPage < totalPages){

        currentPage++;

        showPage();

    }

}

function prevPage(){

    if(currentPage > 1){

        currentPage--;

        showPage();

    }

}

function changePageSize(){

    rowsPerPage =
    Number(document.getElementById("pageSize").value);

    currentPage = 1;

    showPage();

}


// ============================
// Dashboard Counts
// ============================

function updateCounts(){

    const total = allRows.length;

    const visible =
    allRows.filter(r=>r.style.display!=="none").length;

    document.getElementById("totalRecords").innerHTML = total;

    document.getElementById("showingRecords").innerHTML =
    Math.min(rowsPerPage, visible);

    document.getElementById("filteredRecords").innerHTML =
    visible;

    showPage();

}


// ============================
// Start
// ============================

window.onload = function(){

    listenAssignedSites();

};