let menu = document.querySelector('#menu-bars');
let header = document.querySelector('header');

menu.onclick = () => {
    menu.classList.toggle('fa-times');
    header.classList.toggle('active');
}

window.onscroll = () => {
    menu.classList.remove('fa-times');
    header.classList.remove('active');
}

document.getElementById('downloadExcelButton').addEventListener('click', function () {
    window.location.href = '/export-to-excel';
});

        document.addEventListener("DOMContentLoaded", function () {
            const tableId = "subscribedusers"; // Update this with the correct table ID
            const table = document.querySelector(`#${tableId} table`);
            const usersPerPage = 5;
            let currentPage = 0;
    
            function showUsers() {
                const rows = table.querySelectorAll("tbody tr");
                const startIndex = currentPage * usersPerPage;
                const endIndex = startIndex + usersPerPage;
    
                for (let i = 0; i < rows.length; i++) {
                    if (i >= startIndex && i < endIndex) {
                        rows[i].style.display = "table-row";
                    } else {
                        rows[i].style.display = "none";
                    }
                }
            }
    
            const prevButton = document.querySelector(`#${tableId} .prevPage`);
            const nextButton = document.querySelector(`#${tableId} .nextPage`);
    
            prevButton.addEventListener("click", function () {
                if (currentPage > 0) {
                    currentPage--;
                    showUsers();
                }
            });
    
            nextButton.addEventListener("click", function () {
                const rows = table.querySelectorAll("tbody tr");
                const totalRows = rows.length;
                const maxPage = Math.ceil(totalRows / usersPerPage);
    
                if (currentPage < maxPage - 1) {
                    currentPage++;
                    showUsers();
                }
            });
    
            showUsers();
        });
        // ---------------------------------------------------------
        document.addEventListener("DOMContentLoaded", function () {
            const tableId = "allusers"; // Update this with the correct table ID
            const table = document.querySelector(`#${tableId} table`);
            const usersPerPage = 10;
            let currentPage = 0;
    
            function showUsers() {
                const rows = table.querySelectorAll("tbody tr");
                const startIndex = currentPage * usersPerPage;
                const endIndex = startIndex + usersPerPage;
    
                for (let i = 0; i < rows.length; i++) {
                    if (i >= startIndex && i < endIndex) {
                        rows[i].style.display = "table-row";
                    } else {
                        rows[i].style.display = "none";
                    }
                }
            }
    
            const prevButton = document.querySelector(`#${tableId} .prevPage`);
            const nextButton = document.querySelector(`#${tableId} .nextPage`);
    
            prevButton.addEventListener("click", function () {
                if (currentPage > 0) {
                    currentPage--;
                    showUsers();
                }
            });
    
            nextButton.addEventListener("click", function () {
                const rows = table.querySelectorAll("tbody tr");
                const totalRows = rows.length;
                const maxPage = Math.ceil(totalRows / usersPerPage);
    
                if (currentPage < maxPage - 1) {
                    currentPage++;
                    showUsers();
                }
            });
    
            showUsers();
        });
//    ----------------------------------------------------------------------