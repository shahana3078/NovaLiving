
//ADD CART

async function addToCart(productId) {
  try {
      const response = await axios.post('/cart/add', 
        { productId }
      );

      if (response.status === 200) {
          showMessage("Product added to cart!", "success");
      } else {
          alert('Something went wrong!');
      }
  } catch (error) {
      if (error.response) {
          showMessage(error.response.data.message,'danger');
      } else {
          console.error('Error adding product to cart:', error);
      }
  }
}



 
//REMOVE PRODUCT

async function removeProduct(productId) {
  try {
     
      const response = await axios.post('/cart/remove', { productId });

      if (response.status === 200) {
          showMessage('Product removed successfully', 'success');
          
          
          location.reload();
      }
  } catch (error) {
      if (error.response) {
          
          showMessage(`Failed to remove product: ${error.response.data.message}`, 'danger');
      } else {
          
          console.error('Error removing product:', error);
          showMessage('An error occurred. Please try again.', 'danger');
      }
  }
}

//increment decrement
async function updateQuantity(productId, action) {
  try {
      const response = await axios.post('/cart/update-quantity', 
        { productId, action }
      );

      if (response.status === 200) {
          const data = response.data;

          const quantityElement = document.querySelector('.quantity-amount');

          const totalPriceElement = document.getElementById('total-price');

          if (quantityElement && totalPriceElement) {
              let currentQuantity = parseInt(quantityElement.value) || 0;
              currentQuantity = action === 'increment' ? currentQuantity + 1 : currentQuantity - 1;

              if (currentQuantity > 0) {
                  quantityElement.value = currentQuantity;
                  totalPriceElement.textContent = data.updatedTotalPrice;
              }
          }

          location.reload();
      } else {
          console.error('Failed to update quantity:', response.data.message);
          showMessage(`Error: ${response.data.message || 'Failed to update quantity.'}`, 'danger');
      }
  } catch (error) {
      if (error.response) {
        const message = error.response.data?.message || "Something went wrong.";
        showMessage(message, 'danger');
          console.error('Error response:', error.response.data);
         
      } else if (error.request) {
          
          console.error('Network error:', error.request);
          showMessage('network error', 'danger');
      } else {
          
          console.error('Error updating quantity:', error.message);
          showMessage('An unexpected error occurred. Please try again.', 'danger');
      }
  }
}


function proceedToCheckout() {
  window.location.href = '/checkout';
}

function onclickMessage(){
  showMessage('please select atleast one item to procceed to checkout','danger')
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
