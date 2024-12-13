




//edit

document.getElementById('editbtn').addEventListener('click', () => {
  const editModal = new bootstrap.Modal(document.getElementById('editModal'));
  editModal.show();
});

// Save Changes Button Click
document.getElementById('saveChangesBtn').addEventListener('click', () => {
  const fullName = document.getElementById('modalUsername').value;
  const email = document.getElementById('modalEmail').value;
 

  // Validate inputs
  if (!fullName || !email ) {
    showMessage('Please enter valid details.','danger');
    return;
  }

  // Disable Save Changes button while saving
  const saveChangesBtn = document.getElementById('saveChangesBtn');
  saveChangesBtn.disabled = true;
  saveChangesBtn.innerText = "Saving...";

  // Send the updated data to the server
  fetch('/update-profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fullName,
      email,
      
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Update the frontend with new data
        document.getElementById('username').value = fullName;
        document.getElementById('email').value = email;
    

        // Close the modal and reset button state
        const editModal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
        editModal.hide();
        showMessage('Profile updated successfully!','success');
      } else {
        showMessage('Error updating profile.','danger');
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
