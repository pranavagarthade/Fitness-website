function togglePasswordVisibility() {
  const passwordInput = document.getElementById("password");
  const passwordToggleIcon = document.getElementById("passwordToggleIcon");

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    // Change the icon to the "eye" icon (visible)
    passwordToggleIcon.className = "pass-icon fa fa-eye";
  } else {
    passwordInput.type = "password";
    // Change the icon to the "eye-slash" icon (hidden)
    passwordToggleIcon.className = "pass-icon fa fa-eye-slash";
  }
}
