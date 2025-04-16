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












let selectedMethod = null;

  function showPaymentOptions() {
      document.getElementById('selectedPayment').style.display = 'none';
      document.getElementById('paymentOptions').style.display = 'block';
  }

  function selectPayment(method) {
      selectedMethod = method;

      document.querySelectorAll('.payment-option').forEach(option => {
          const radio = option.querySelector('input[type="radio"]');
          if (radio && radio.id === method) {
              option.style.border = '2px solid #ff9900';
          } else {
              option.style.border = '1px solid #ddd';
          }
      });
  }

  function confirmPayment() {
      if (!selectedMethod) {
          alert("Please choose a payment method.");
          return;
      }

      fetch('/update-payment-method', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentMethod: selectedMethod })
      })
      .then(response => response.json())
      .then(data => {
          if (data.success) {
              document.getElementById('paymentOptions').style.display = 'none';
              document.getElementById('selectedPayment').innerHTML = `<strong>${getPaymentMethodText(selectedMethod)}</strong> <a href="#" onclick="showPaymentOptions()" style="color: blue; text-decoration: underline; float: right;">Change</a>`;
              document.getElementById('selectedPayment').style.display = 'block';
          } else {
              alert(data.message);
          }
      })
      .catch(error => console.error('Error:', error));
  }

  function getPaymentMethodText(method) {
      switch(method) {
          case 'cash on delivery': return 'Pay on Delivery (Cash/Card)';
          case 'razorpay': return 'Razorpay';
          case 'wallet': return 'Wallet';
          default: return method;
      }
  }



//coupon

function updateCouponInput() {
  document.getElementById('couponCodeInput').value = document.getElementById('couponDropdown').value;
}

window.onload = loadCoupons;

function toggleDropdown() {
  const dropdown = document.getElementById('couponDropdown');
  dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

function selectCoupon(couponCode) {
  document.getElementById('couponCodeInput').value = couponCode;
  document.getElementById('couponDropdown').style.display = 'none';
  document.getElementById('applyButton').style.display = 'inline-block';
}

document.addEventListener('click', function(event) {
  const dropdown = document.getElementById('couponDropdown');
  const inputField = document.getElementById('couponCodeInput');
  const dropdownButton = document.querySelector('button[onclick="toggleDropdown()"]');

  if (event.target !== inputField && event.target !== dropdownButton && !dropdown.contains(event.target)) {
      dropdown.style.display = 'none';
  }
});

function updateTotalPrice(newTotal) {
  document.getElementById('totalPriceFixed').innerText = `₹${newTotal}`;
  document.getElementById('totalPriceBlock').innerText = `₹${newTotal}`;
}

function showErrorMessage(message) {
  let errorElement = document.getElementById('couponError');
  if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.id = 'couponError';
      errorElement.style.color = 'red';
      errorElement.style.marginTop = '10px';
      errorElement.style.fontSize = '14px';
      document.getElementById('couponContainer').appendChild(errorElement);
  }
  errorElement.innerText = message;

  setTimeout(() => {
    if (errorElement) errorElement.remove();
  }, 5000);
}

async function applyCoupon() {
  const couponCode = document.getElementById('couponCodeInput').value;
  if (!couponCode) {
      alert('Please enter or select a coupon');
      return;
  }

  try {
      const totalPriceElement = document.getElementById('totalPriceBlock');
      let totalPrice = parseFloat(totalPriceElement.innerText.replace('₹', ''));

      if (!totalPriceElement.hasAttribute("data-original-price")) {
          totalPriceElement.setAttribute("data-original-price", totalPrice);
          document.getElementById('totalPriceFixed').setAttribute("data-original-price", totalPrice);
      }

      const response = await axios.post('/apply-coupon', { couponCode, totalPrice });

      if (response.data.success) {
          const newTotalPrice = response.data.newTotalPrice;

          document.getElementById('appliedCoupon').style.display = 'block';
          document.getElementById('appliedCouponCode').innerText = couponCode;
          document.getElementById('applyButton').style.display = 'none';

          updateTotalPrice(newTotalPrice);
      } else {
          showErrorMessage(response.data.message);
      }
  } catch (error) {
      if (error.response && error.response.data) {
          showErrorMessage(error.response.data.message);
      } else {
          console.error('Error applying coupon:', error);
          showErrorMessage("An unexpected error occurred. Please try again.");
      }
  }
}

function handleCouponChange() {
  document.getElementById('applyButton').style.display = 'inline-block';
}


function removeCoupon() {
  document.getElementById('appliedCoupon').style.display = 'none';
  document.getElementById('appliedCouponCode').innerText = '';
  document.getElementById('couponCodeInput').value = "";
  document.getElementById('applyButton').style.display = 'inline-block'; 

  const fixedPriceEl = document.getElementById('totalPriceFixed');
  const blockPriceEl = document.getElementById('totalPriceBlock');

  const originalFixedPrice = parseFloat(fixedPriceEl.getAttribute("data-original-price"));
  const originalBlockPrice = parseFloat(blockPriceEl.getAttribute("data-original-price"));

  fixedPriceEl.innerText = `₹${originalFixedPrice.toFixed(2)}`;
  blockPriceEl.innerText = `₹${originalBlockPrice.toFixed(2)}`;

  document.getElementById('couponId')?.remove();
  document.getElementById('couponDiscountValue')?.remove();
}



//place order

// function placeOrder() {
//   if (!addressId) {
//     Swal.fire({
//       icon: 'warning',
//       title: 'Address Required',
//       text: 'Please select an address before placing your order.',
//     });
//     return;
//   }
  
//   if (!selectedMethod) {
//     Swal.fire({
//       icon: 'warning',
//       title: 'Select Payment Method',
//       text: 'Please choose a payment method before placing your order.',
//     });
//     return;
//   }

//   const appliedCouponCode = document.getElementById("appliedCouponCode").innerText || null;
//   if (selectedMethod === 'razorpay') {
//     fetch('/create-razorpay-order', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ couponCode: appliedCouponCode })
//     })
//     .then(response => response.json())
//     .then(order => {
//         const options = {
//             key: 'rzp_test_29wLZVOKsQCqZx',
//             amount: order.amount,
//             currency: 'INR',
//             order_id: order.id,
//             name: "NovaLiving",
//             description: "Order Payment",
//             handler: function (response) {
//               fetch('/place-order', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ 
//                   addressId,
//                   paymentMethod: 'razorpay',
//                   razorpay_payment_id: response.razorpay_payment_id,
//                   razorpay_order_id: response.razorpay_order_id,
//                   razorpay_signature: response.razorpay_signature,
//                   couponCode: appliedCouponCode
//                 })
//               })
//               .then(response => response.json())
//               .then(data => {
//                 if (data.success) {
//                   window.location.href = '/order-confirmed';
//                 } else {
//                   Swal.fire({
//                     icon: 'error',
//                     title: 'Payment Failed',
//                     text: data.message || 'Payment verification failed. You can retry from My Orders.',
//                   });
//                   window.location.href = '/my-orders'; // user can retry payment from there
//                 }
//               })
//               .catch(error => console.error('Error:', error));
//             }
            
//         };

//         const rzp1 = new Razorpay(options);
//         rzp1.open();
//     })
//     .catch(error => console.error('Error:', error));
//   }else {
//     axios.post('/place-order', { addressId, paymentMethod: selectedMethod , couponCode: appliedCouponCode })
//       .then(response => {
//         window.location.href = '/order-confirmed'; 
//       })
//       .catch(error => {
//         console.error('Error placing order:', error);
//         alert('An error occurred while placing your order. Please try again.');
//       });
//   }
// }
function placeOrder() {
  
  if (!addressId) {
    Swal.fire({
      icon: 'warning',
      title: 'Address Required',
      text: 'Please select an address before placing your order.',
    });
    return;
  }

  if (!selectedMethod) {
    Swal.fire({
      icon: 'warning',
      title: 'Select Payment Method',
      text: 'Please choose a payment method before placing your order.',
    });
    return;
  }

  const appliedCouponCode = document.getElementById("appliedCouponCode").innerText || null;

  if (selectedMethod === 'razorpay') {
    fetch('/create-razorpay-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ couponCode: appliedCouponCode })
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
              razorpay_signature: response.razorpay_signature,
              couponCode: appliedCouponCode
            })
          })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              window.location.href = '/order-confirmed';
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Payment Failed',
                text: data.message || 'Payment verification failed. You can retry from My Orders.',
              }).then(() => {
                window.location.href = '/my-orders';
              });
            }
          })
          .catch(error => console.error('Error:', error));
        },

        modal: {
          ondismiss: function () {
            fetch('/place-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                addressId,
                paymentMethod: 'razorpay',
                couponCode: appliedCouponCode 
              })
            })
            .then(res => res.json())
            .then(data => {
              Swal.fire({
                icon: 'error',
                title: 'Payment Failed',
                text: 'Payment not completed. Order placed with pending status.',
              }).then(() => {
                window.location.href = '/shop';
              });
            })
            .catch(err => {
              console.error('Error placing order after dismiss:', err);
              Swal.fire({
                icon: 'error',
                title: 'Something went wrong',
                text: 'Please try again later.',
              });
            });
          }
        }
      };

      const rzp1 = new Razorpay(options);
      rzp1.open();
    })
    .catch(error => console.error('Error:', error));
  } else {
    axios.post('/place-order', {
      addressId,
      paymentMethod: selectedMethod,
      couponCode: appliedCouponCode
    })
    .then(response => {
      window.location.href = '/order-confirmed';
    })
    .catch(error => {
      console.error('Error placing order:', error);
      alert('An error occurred while placing your order. Please try again.');
    });
  }
}



function getPaymentMethodText(method) {
  switch (method) {
      case 'cash on delivery': return "Pay on Delivery (Cash/Card)";
      case 'razorpay': return "Razorpay";
      case 'wallet': return "Wallet";
      default: return method;
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











function showErrorMessage(message) {
  let errorElement = document.getElementById('couponError');

  if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.id = 'couponError';
      errorElement.style.color = 'red';
      errorElement.style.marginTop = '10px';
      errorElement.style.fontSize = '14px';
      document.getElementById('couponContainer').appendChild(errorElement);
  }

  errorElement.innerText = message;

  // Remove error message after 5 seconds
  setTimeout(() => {
      if (errorElement) {
          errorElement.remove();
      }
  }, 2000);
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



