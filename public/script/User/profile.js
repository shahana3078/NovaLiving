


document.getElementById('editbtn').addEventListener('click', () => {
  const editModal = new bootstrap.Modal(document.getElementById('editModal'));
  editModal.show();
});

document.getElementById('saveChangesBtn').addEventListener('click', () => {
  const fullName = document.getElementById('modalUsername').value;

  if (!fullName  ) {
    showMessage('Please enter valid details.','danger');
    return;
  }

  const saveChangesBtn = document.getElementById('saveChangesBtn');
  saveChangesBtn.disabled = true;
  saveChangesBtn.innerText = "Saving...";

  fetch('/update-profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fullName,
      
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        document.getElementById('username').value = fullName;

        const editModal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
        editModal.hide();
        showMessage('Profile updated successfully!','success');
      } else {
        showMessage(data.message ||'Error updating profile.','danger');
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      showMessage('An error occurred while updating your profile.','success');
    })
    .finally(() => {
      saveChangesBtn.disabled = false;
      saveChangesBtn.innerText = "Save Changes";
    });
});

document.getElementById("submitPasswordChange").addEventListener("click", async () => {
  const currentPassword = document.getElementById("currentPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const errorBox = document.getElementById("passwordError");

  errorBox.style.display = "none";
  errorBox.textContent = "";

  if (newPassword !== confirmPassword) {
    errorBox.textContent = "New passwords do not match.";
    errorBox.style.display = "block";
    return;
  }

  try {
    const response = await fetch("/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Password changed successfully!");
      document.getElementById("changePasswordForm").reset();
      const modal = bootstrap.Modal.getInstance(document.getElementById("changePasswordModal"));
      modal.hide();
    } else {
      errorBox.textContent = data.message || "Error changing password.";
      errorBox.style.display = "block";
    }
  } catch (error) {
    console.error("Password change error:", error);
    errorBox.textContent = "Something went wrong.";
    errorBox.style.display = "block";
  }
});



function showMessage(message, type) {
  const messageContainer = document.createElement("div");
  messageContainer.classList.add("custom-message");

  if (type === "success") {
    messageContainer.style.backgroundColor = "#28a745";
    messageContainer.style.color = "white";
  } else if (type === "danger") {
    messageContainer.style.backgroundColor = "#dc3545";
    messageContainer.style.color = "white";
  }

  messageContainer.style.padding = "15px";
  messageContainer.style.borderRadius = "5px";
  messageContainer.style.margin = "10px 0";
  messageContainer.style.fontSize = "16px";
  messageContainer.style.fontWeight = "bold";
  messageContainer.style.position = "fixed";
  messageContainer.style.top = "10px";
  messageContainer.style.left = "50%";
  messageContainer.style.transform = "translateX(-50%)";
  messageContainer.style.zIndex = "9999";
  messageContainer.style.transition = "opacity 0.5s";

  messageContainer.textContent = message;

  const dismissButton = document.createElement("button");
  dismissButton.textContent = "✖"; 
  dismissButton.style.background = "none";
  dismissButton.style.border = "none";
  dismissButton.style.color = "white";
  dismissButton.style.fontSize = "20px";
  dismissButton.style.fontWeight = "bold";
  dismissButton.style.marginLeft = "10px";
  dismissButton.style.cursor = "pointer";

  dismissButton.addEventListener("click", function () {
    messageContainer.style.opacity = "0"; 
    setTimeout(() => {
      messageContainer.remove(); 
    }, 500);
  });

  messageContainer.appendChild(dismissButton);
  document.body.appendChild(messageContainer);

  setTimeout(function () {
    messageContainer.style.opacity = "0";
    setTimeout(() => {
      messageContainer.remove();
    }, 500);
  }, 3000);
}
