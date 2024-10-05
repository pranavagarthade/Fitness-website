const form = document.querySelector("form"),
    nextBtn = form.querySelector(".nextBtn"),
    backBtn = form.querySelector(".backBtn"),
    allInput = form.querySelectorAll(".first input");

nextBtn.addEventListener("click", () => {
    let isAnyInputEmpty = false; // Initialize a flag to check if any input is empty

    allInput.forEach(input => {
        if (input.value === "") {
            isAnyInputEmpty = true; // Set the flag to true if any input is empty
        }
    });

    if (isAnyInputEmpty) {
        alert("Input is empty"); // Show the alert if any input is empty
    } else {
        form.classList.add('secActive');
    }
});

backBtn.addEventListener("click", () => form.classList.remove('secActive'));

const phoneInput = document.getElementById("phone");

phoneInput.addEventListener("input", function () {
    const phoneNumber = this.value.replace(/\D/g, ''); // Remove non-digits
    const isValid = /^[0-9]{10}$/.test(phoneNumber);

    if (isValid) {
        // Valid phone number
        this.setCustomValidity("");
    } else {
        // Invalid phone number
        this.setCustomValidity("Please enter a 10-digit phone number.");
    }
});

phoneInput.addEventListener("invalid", function () {
    // Show an alert message for invalid input
    alert("Please enter a valid 10-digit phone number.");
});
