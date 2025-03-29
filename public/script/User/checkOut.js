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


//payment
let selectedMethod = "cash on delivery";

function showPaymentOptions() {
    document.getElementById('selectedPayment').style.display = 'none';
    document.getElementById('paymentOptions').style.display = 'block';
}

function selectPayment(method) {
 

    selectedMethod = method;
 
   
    document.querySelectorAll('.payment-option').forEach(option => {
        const radioInput = option.querySelector(`input[id="${method}"]`);
        if (radioInput) {
            option.style.border = '2px solid #ff9900';
        } else {
            option.style.border = '1px solid #ddd';
        }
    });
}

function confirmPayment() {

      fetch('/update-payment-method', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentMethod: selectedMethod })
      })
      .then(response => response.json())
      .then(data => {
          if (data.success) {
              document.getElementById('paymentOptions').style.display = 'none';
              document.getElementById('selectedPayment').innerHTML = `<strong>${getPaymentMethodText(selectedMethod)}</strong>`;
              document.getElementById('selectedPayment').style.display = 'block';
          } else {
              alert(data.message);
          }
      })
      .catch(error => console.error('Error:', error));

    }



//place order

function placeOrder() {
  if (!addressId) {
    return showMessage('Please select an address', 'danger');
  }

  if (selectedMethod === 'razorpay') {
    fetch('/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    })
    .then(response => response.json())
    .then(order => {
        const options = {
            key: 'rzp_test_29wLZVOKsQCqZx',
            amount: order.amount,
            currency: 'INR',
            order_id: order.id,
            name: "NovaLiving",
            description: "Order Payment",
            handler: function (response) {
                fetch('/place-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        addressId,
                        paymentMethod: 'razorpay',
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        window.location.href = '/order-confirmed';
                    } else {
                        alert(data.message);
                    }
                })
                .catch(error => console.error('Error:', error));
            }
        };

        const rzp1 = new Razorpay(options);
        rzp1.open();
    })
    .catch(error => console.error('Error:', error));
  }else {
    axios.post('/place-order', { addressId, paymentMethod: selectedMethod })
      .then(response => {
        window.location.href = '/order-confirmed'; 
      })
      .catch(error => {
        console.error('Error placing order:', error);
        alert('An error occurred while placing your order. Please try again.');
      });
  }
}

async function applyCoupon() {
  const couponCode = document.getElementById("couponCode").value.trim();
  
  if (!couponCode) {
    alert("Please enter a coupon code.");
    return;
  }

  try {
    console.log("Sending coupon request:", couponCode);

    const response = await fetch("/apply-coupon", { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ couponCode }),
    });

    const data = await response.json();
    console.log("Server response:", data);

    if (data.success) {
      document.getElementById("discountMessage").style.display = "block";
      document.getElementById("discountAmount").innerText = data.discountAmount;
      document.getElementById("totalAmount").innerText = data.newTotal;
      alert("Coupon applied successfully!");
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error("Error applying coupon:", error);
    alert("Failed to apply coupon. Please try again.");
  }
}


function toggleApplyButton() {
  const couponCode = document.getElementById("couponCode").value;
  document.getElementById("applyCouponBtn").disabled = couponCode.trim() === "";
}



function getPaymentMethodText(method) {
  switch (method) {
      case 'cash on delivery': return "Pay on Delivery (Cash/Card)";
      case 'razorpay': return "Razorpay";
      case 'wallet': return "Wallet";
      default: return "Unknown Payment Method";
  }
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



