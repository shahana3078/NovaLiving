

function loginWithGoogle() {
  window.location.href = "/auth/google";
}

document.getElementById("loginForm").addEventListener("submit", function (e) {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorMessage = document.getElementById("clientErrorMessage");

  if (!email || !password) {
    e.preventDefault();
    errorMessage.style.display = "block";
    errorMessage.textContent = "Email and Password cannot be empty.";
    return;
  }

  if (/\s/.test(email) || /\s/.test(password)) {
    e.preventDefault(); 
    errorMessage.style.display = "block";
    errorMessage.textContent = "Email and Password cannot contain spaces.";
    return;
  }

  errorMessage.style.display = "none"; 
  
});

