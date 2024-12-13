
//ADD CART

async function addToCart(productId) {

  try {
      const response = await fetch('/cart/add', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ productId }) 
      });

      const data = await response.json();
      if (response.ok) {
          showMessage("Product added to cart!", "success");
      } else {
          alert(data.message);
      }
  } catch (error) {
      console.error('Error adding product to cart', error);
  }
}


 
//REMOVE PRODUCT

  function removeProduct(productId) {

    fetch('/cart/remove', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }), 
    })
    .then(response => {
        if (response.ok) {
           
            showMessage('Product removed successfully', 'success');
            
            location.reload();
        } else {
            return response.json().then(error => {
                
                showMessage(`Failed to remove product: ${error.message}`,'danger');
            });
        }
    })
    .catch(err => {
        showMessage('An error occurred. Please try again.');
    });
}



function proceedToCheckout() {
  window.location.href = '/checkout';
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
