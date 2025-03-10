let addressId = '';

function setAddress(id, fullName, addressDetails, mobile) {
 
  const nameElement = document.querySelector('.address-content strong');
  const detailsElement = document.querySelector('.address-content p:nth-child(2)');
  const mobileElement = document.querySelector('.address-content p:nth-child(3)');

  nameElement.innerText = fullName;
  detailsElement.innerText = addressDetails;
  mobileElement.innerText = `Mobile: ${mobile}`;

  const selectedAddress = {
    id,
    fullName,
    addressDetails,
    mobile
  };

  addressId = id;

  localStorage.setItem('selectedAddress', JSON.stringify(selectedAddress));


  const modalElement = document.getElementById('changeAddressModal');
  const modalInstance = bootstrap.Modal.getInstance(modalElement);
  modalInstance.hide();
  location.reload();
}

document.addEventListener('DOMContentLoaded', () => {
  const savedAddress = JSON.parse(localStorage.getItem('selectedAddress'));

  if (savedAddress) {
    const nameElement = document.querySelector('.address-content strong');
    const detailsElement = document.querySelector('.address-content p:nth-child(2)');
    const mobileElement = document.querySelector('.address-content p:nth-child(3)');

    addressId = savedAddress.id;

    nameElement.innerText = savedAddress.fullName;
    detailsElement.innerText = savedAddress.addressDetails;
    mobileElement.innerText = `Mobile: ${savedAddress.mobile}`;
  }
});

function placeOrder() {

  if(!addressId) {
    return showMessage('Please select a address', 'danger');
  }


  const data = {
    addressId
  }

  axios.post('/place-order', data)
    .then((response) => {
      window.location.href = '/order-confirmed'; 
    })
    .catch((error) => {
      console.error('Error placing order:', error);
      alert('An error occurred while placing your order. Please try again.');
    });
}

function openEditModal(addressId) {
  fetch(`/edit-address/${addressId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch address details.');
      }
      return response.json();
    })
    .then(data => {
      // Populate modal fields with fetched data
      document.getElementById('editAddressId').value = addressId;
      document.getElementById('editFullName').value = data.fullName;
      document.getElementById('editMobile').value = data.mobile;
      document.getElementById('editPincode').value = data.pincode;
      document.getElementById('editAddress').value = data.address;
      document.getElementById('editLandmark').value = data.landmark;
      document.getElementById('editCity').value = data.city;
      document.getElementById('editState').value = data.state;
      document.getElementById('editDefaultAddress').checked = data.isDefault || false;
    })
    .catch(error => {
      console.error(error);
      alert('An error occurred while fetching address details.');
    });
}

function showOrderDetails(orderId) {
  fetch(`/admin/orderDetails?orderId=${orderId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch order details.');
      }
      return response.json();
    })
    .then(order => {
      const modalContent = `
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}</p>
        <p><strong>User Name:</strong> ${order.addressId.fullName}</p>
        <p><strong>Address:</strong> ${order.addressId.address}, ${order.addressId.city}, ${order.addressId.state} - ${order.addressId.pincode}</p>
        <p><strong>Mobile:</strong> ${order.addressId.mobile}</p>
        <p><strong>Total Amount:</strong> ₹${order.grandTotal ? order.grandTotal.toFixed(2) : '0.00'}</p>
        <p><strong>Payment Method:</strong> ${order.paymentMethod || 'Cash on Delivery'}</p>
        <p><strong>Status:</strong> ${order.orderStatus}</p>
        <h5>Order Items:</h5>
        <ul>
          ${order.items.map(item => `
            <li>
              <strong>${item.productName}</strong> - ₹${item.price.toFixed(2)} x ${item.quantity}
            </li>
          `).join('')}
        </ul>
      `;
      document.getElementById('orderDetailsContent').innerHTML = modalContent;
      const orderDetailsModal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
      orderDetailsModal.show();
    })
    .catch(error => {
      console.error(error);
      alert('An error occurred while fetching order details.');
    });
}







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



