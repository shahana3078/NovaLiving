async function addToWishlist(productId) {
  try {
      const response = await axios.post('/wishlist/add', { productId });

      if (response.status === 200) {
          showMessage("Product added to wishlist!", "success");
      } else {
          showMessage("Failed to add product to wishlist.", "danger");
      }
  } catch (error) {
      if (error.response) {
          showMessage(error.response.data.message || "An error occurred", "danger");
      } else {
          console.error('Error adding product to wishlist:', error);
          showMessage("An unexpected error occurred. Please try again.", "danger");
      }
  }
}



async function removeProduct(productId) {
  try {
     
      const response = await axios.post('/wishlist/remove', { productId });
       console.log(response)
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

async function wishAddToCart(productId) {
  try {
      const response = await axios.post('/cart/add', { productId });

      if (response.status === 200) {
          // Show success message
          showMessage("Product added to cart!", "success");

          // Remove the item from the UI
          const wishlistItem = document.getElementById(`wishlist-item-${productId}`);
          if (wishlistItem) {
              wishlistItem.remove();
          }

          // Optionally remove from the database
          await axios.post('/wishlist/remove', { productId });

      } else {
          alert('Something went wrong!');
      }
  } catch (error) {
      if (error.response) {
          showMessage(error.response.data.message, 'danger');
      } else {
          console.error('Error adding product to cart:', error);
      }
  }
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