

function addAddressBox(addressData) {
  const addressContainer = document.getElementById("addressContainer");

  const addressBox = document.createElement("div");
  addressBox.classList.add("address-box");

  addressBox.innerHTML = `
    <h5>${addressData.fullName}</h5>
    <p>${addressData.address}, ${addressData.city}, ${addressData.state} - ${addressData.pincode}</p>
    <p>${addressData.landmark ? `Landmark: ${addressData.landmark}` : ""}</p>
    <p>Mobile: ${addressData.mobile}</p>
    ${
      addressData.defaultAddress
        ? `<span class="default-label">Default Address</span>`
        : ""
    }
  `;

  addressContainer.appendChild(addressBox);
}

//address box
function createAddressBox(addressData) {
  const addressContainer = document.getElementById("addressContainer");

  const addressBox = document.createElement("div");
  addressBox.classList.add("address-box");

  const addressHTML = `
    <div class="address-details">
      <h5>${addressData.fullName}</h5>
      <p><strong>Address:</strong> ${addressData.address}, ${addressData.city}, ${addressData.state} - ${addressData.pincode}</p>
      <p><strong>Landmark:</strong> ${addressData.landmark || 'N/A'}</p>
      <p><strong>Mobile:</strong> ${addressData.mobile}</p>
    </div>
    <div class="address-actions">
      <span>|</span>
    </div>
  `;

  addressBox.innerHTML = addressHTML;
  if (addressData.defaultAddress) {
    addressContainer.prepend(addressBox); 
  } else {
    addressContainer.appendChild(addressBox);
  }
}






async function fetchAddresses() {
  try {
    const response = await fetch("/address");
    const data = await response.json();

    if (data && data.addresses) {
      const addressContainer = document.getElementById("addressContainer");
      addressContainer.innerHTML = ""; 
      data.addresses.forEach((address) => {
        const addressBox = document.createElement("div");
        addressBox.classList.add("address-box");

        addressBox.innerHTML = `
          <h5>${address.fullName}</h5>
          <p>${address.address}, ${address.city}, ${address.state} - ${address.pincode}</p>
          <p>${address.landmark ? 'Landmark: ' + address.landmark : ''}</p>
          <p>Mobile: ${address.mobile}</p>
          ${
            address.defaultAddress
              ? `<span class="badge bg-success">Default Address</span>`
              : ""
          }
          <br>
          <button class="btn btn-sm btn-success" onclick='openEditModal(${JSON.stringify(
            address
          )})'>Edit</button>
          <button class="btn btn-sm btn-danger" onclick="removeAddress('${
            address._id
          }')">Remove</button>
        `;

        addressContainer.appendChild(addressBox);
      });
    }
  } catch (error) {
    console.error("Error fetching addresses:", error);
  }
}
window.onload = fetchAddresses;




//save address

function saveAddress() {
  clearErrors();

  const fullName = document.getElementById("fullName").value.trim();
  const mobile = document.getElementById("mobile").value.trim();
  const pincode = document.getElementById("pincode").value.trim();
  const address = document.getElementById("address").value.trim();
  const landmark = document.getElementById("landmark").value.trim();
  const city = document.getElementById("city").value.trim();
  const state = document.getElementById("state").value;
  const defaultAddress = document.getElementById("defaultAddress").checked;

  let isValid = true;

  if (!fullName) {
    showError("fullName", "fullNameError", "Please enter a valid name.");
    isValid = false;
  }
  if (!mobile) {
    showError("mobile", "mobileError", "Please enter a valid mobile number.");
    isValid = false;
  }
  if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
    showError("pincode", "pincodeError", "Pincode should be exactly 6 digits.");
    isValid = false;
  }
  if (!address) {
    showError("address", "addressError", "Please enter a valid address.");
    isValid = false;
  }
  if (!city) {
    showError("city", "cityError", "Please enter a valid city.");
    isValid = false;
  }
  if (!state) {
    showError("state", "stateError", "Please select a state.");
    isValid = false;
  }

  if (isValid) {
    const addressData = {
      fullName,
      mobile,
      pincode,
      address,
      landmark,
      city,
      state,
      defaultAddress,
    };

    fetch("/address", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addressData),
    })
      .then((response) => response.json())
      .then((data) => {
  if (data.message === "Address added successfully!") {
    createAddressBox(data.address);
    document.getElementById("addressForm").reset();
    $("#addressModal").modal("hide");
    showMessage("Your address has been added successfully!", "success");
  } else {
    showMessage(data.message || "Error adding address.", "danger");
  }
})

  }
}


//EDIT ADDRESS

async function openEditModal(addressId) {
  console.log('Address ID:', addressId);

  try {

    const response = await axios.get(`/edit-address/${addressId}`);
    const address = response.data;
    console.log('Fetched Address:', address);

   
    document.getElementById('editAddressId').value = address._id;
    document.getElementById('editFullName').value = address.fullName;
    document.getElementById('editMobile').value = address.mobile;
    document.getElementById('editPincode').value = address.pincode;
    document.getElementById('editAddress').value = address.address;
    document.getElementById('editLandmark').value = address.landmark || ''; 
    document.getElementById('editCity').value = address.city;
    document.getElementById('editState').value = address.state;
    document.getElementById('editDefaultAddress').checked = address.isDefault;

    
    const modal = new bootstrap.Modal(document.getElementById('editAddressModal'));
    modal.show();

  } catch (error) {
    console.error('Error fetching address:', error);
    alert('Failed to fetch address details.');
  }
}


//save address
async function saveEditedAddress() {
  const addressId = document.getElementById('editAddressId').value;
  const addressData = {
    fullName: document.getElementById('editFullName').value,
    mobile: document.getElementById('editMobile').value,
    pincode: document.getElementById('editPincode').value,
    address: document.getElementById('editAddress').value,
    landmark: document.getElementById('editLandmark').value,
    city: document.getElementById('editCity').value,
    state: document.getElementById('editState').value,
    isDefault: document.getElementById('editDefaultAddress').checked
  };

  try {

    const response = await axios.put(`/edit-address/${addressId}`, addressData);
    if (response.status === 200) {
      showMessage('Address updated successfully!','success');
      location.reload();
    }
  } catch (error) {
    console.error('Error updating address:', error);
    alert('Failed to update address.');
  }
}






function showError(inputId, errorId, errorMessage) {
  document.getElementById(inputId).classList.add('is-invalid');
  document.getElementById(errorId).textContent = errorMessage;
}

function clearErrors() {
  const inputs = document.querySelectorAll('.form-control');
  const errorMessages = document.querySelectorAll('.invalid-feedback');

  inputs.forEach(input => input.classList.remove('is-invalid'));
  errorMessages.forEach(error => error.textContent = '');
}


//show message

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
