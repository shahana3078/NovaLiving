

function loginWithGoogle() {
  window.location.href = "/auth/google";
}



// document.getElementById("loginForm").addEventListener("submit", function (e) {
//   const email = document.getElementById("email").value.trim();
//   const password = document.getElementById("password").value.trim();
//   const errorMessage = document.getElementById("clientErrorMessage");

//   if (!email) {
//     e.preventDefault();
//     errorMessage.style.display = "block";
//     errorMessage.textContent = "Email is required.";
//     return;
//   }

//   if (email && !password) {
//     e.preventDefault();
//     errorMessage.style.display = "block";
//     errorMessage.textContent = "Password is required.";
//     return;
//   }

//   if (!email && password) {
//     e.preventDefault();
//     errorMessage.style.display = "block";
//     errorMessage.textContent = "Email is required.";
//     return;
//   }


//   if (/\s/.test(email) || /\s/.test(password)) {
//     e.preventDefault(); 
//     errorMessage.style.display = "block";
//     errorMessage.textContent = "Email and Password cannot contain spaces.";
//     return;
//   }

//   errorMessage.style.display = "none"; 
  
// });

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const errorMessage = document.getElementById("clientErrorMessage");

  form.addEventListener("submit", function (e) {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email) {
      e.preventDefault();
      errorMessage.style.display = "block";
      errorMessage.textContent = "Email is required.";
      return;
    }

    if (email && !password) {
      e.preventDefault();
      errorMessage.style.display = "block";
      errorMessage.textContent = "Password is required.";
      return;
    }

    if (/\s/.test(email) || /\s/.test(password)) {
      e.preventDefault();
      errorMessage.style.display = "block";
      errorMessage.textContent = "Email and Password cannot contain spaces.";
      return;
    }

    // If all validations pass, hide the error message
    errorMessage.style.display = "none";
  });
});
