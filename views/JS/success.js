
// Disable the back button functionality
history.pushState(null, null, location.href);
window.onpopstate = function () {
    history.pushState(null, null, location.href);
};

window.onbeforeunload = function () {
    return "You have unsaved changes. Are you sure you want to leave this page without clicking 'Done'?";
};
//==============================================================================================================
// // Automatically click the "done" button after 5 seconds
// setTimeout(function () {
//     var doneButton = document.getElementById('doneButton');
//     doneButton.click();
// }, 5000); // 5000 milliseconds = 5 seconds
var seconds = 5;

function updateCountdown() {
    var countdownElement = document.getElementById("countdown");
    countdownElement.textContent = seconds;
    seconds--;

    if (seconds < 1) {
        // Automatically click the form button when the countdown reaches zero
        document.getElementById("doneButton").click();
    }
}

// Initially, update the countdown and then update it every second
updateCountdown();
var countdownInterval = setInterval(updateCountdown, 1000);

// Clear the interval when the countdown is complete
setTimeout(function () {
    clearInterval(countdownInterval);
}, seconds * 1000);
//======================================================================================================
// Get the current date
var currentDate = new Date();

// Format the date as desired (e.g., "Month Day, Year")
var options = { year: 'numeric', month: 'long', day: 'numeric' };
var formattedDate = currentDate.toLocaleDateString('en-US', options);

// Display the date in the HTML element with id "current-date"
document.getElementById("current-date").textContent =  formattedDate;

