


async function fetchProducts() {
  try {
    const response = await axios.get("/products");
    renderProducts(response.data);
  } catch (error) {
    console.error("Error fetching products:", error);
  }
}

//edit
document.addEventListener("DOMContentLoaded", function () {
  const editForm = document.getElementById("editProductForm");
  const existingImagesContainer = document.getElementById("existingImagesContainer");
  const cropContainer = document.getElementById("imageCropContainer");
  const imageInput = document.getElementById("editProductImage");
  
  
  let cropInstances = [];
  let croppedImages = [];

  // Handle form submission
  editForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // Validate form fields
    document.querySelectorAll(".text-danger").forEach(el => (el.style.display = "none"));
    let isValid = true;

    ["editProductName", "editProductCategory", "editProductPrice", "editProductStock", "editProductDescription"].forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (!field.value.trim()) {
        isValid = false;
        const errorElement = document.getElementById(`${fieldId}Error`);
        errorElement.textContent = "This field cannot be empty.";
        errorElement.style.display = "block";
      }
    });

    if (!isValid) return;

    // Prepare form data
    const productId = document.getElementById("editProductId").value;
    const productData = new FormData();
    productData.append("productId", productId);
    productData.append("productName", document.getElementById("editProductName").value);
    productData.append("productCategory", document.getElementById("editProductCategory").value);
    productData.append("productPrice", document.getElementById("editProductPrice").value);
    productData.append("productStock", document.getElementById("editProductStock").value);
    productData.append("productDescription", document.getElementById("editProductDescription").value);

    // Add cropped images
    croppedImages.forEach((croppedImage, index) => {
      const byteString = atob(croppedImage.split(",")[1]);
      const arrayBuffer = new ArrayBuffer(byteString.length);
      const uintArray = new Uint8Array(arrayBuffer);
      for (let i = 0; i < byteString.length; i++) {
        uintArray[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([uintArray], { type: "image/jpeg" });
      productData.append(`productImages`, blob, `image_${index}.jpg`);
    });

    // Send data via Axios
    axios
      .post(`/admin/products/edit/${productId}`, productData)
      .then(response => {
        console.log(response);
        
        if (response.data.success) {
          const modal = bootstrap.Modal.getInstance(document.getElementById("editProductModal"));
          modal.hide();
          location.reload();
        } else {
          console.error("Update failed:");
        }
      })
      .catch(error => console.error("Error updating product:", error));
  });

  // Open edit modal and populate data
  document.querySelectorAll(".editBtn").forEach(button => {
    button.addEventListener("click", function () {
      const productId = this.dataset.id;
      const productName = this.dataset.name;
      const productDescription = this.dataset.description;
      const productPrice = this.dataset.price;
      const productStock = this.dataset.stock;
      const productImages = this.dataset.images ? this.dataset.images.split(",") : [];
      const productCategory = this.dataset.category;

      document.getElementById("editProductId").value = productId || "";
      document.getElementById("editProductName").value = productName || "";
      document.getElementById("editProductDescription").value = productDescription || "";
      document.getElementById("editProductPrice").value = productPrice || "";
      document.getElementById("editProductStock").value = productStock || "";
      document.getElementById("editProductCategory").value = productCategory || "";

      existingImagesContainer.innerHTML = ""; // Clear existing images
      productImages.forEach(image => {
        const wrapper = document.createElement("div");
        wrapper.className = "image-wrapper position-relative mb-3";
        wrapper.style.width = "100px";
        wrapper.style.height = "100px";

        const img = document.createElement("img");
        img.src = `/uploads/images/${image}`;
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "cover";

        wrapper.appendChild(img);
        existingImagesContainer.appendChild(wrapper);
      });

      const modal = new bootstrap.Modal(document.getElementById("editProductModal"));
      modal.show();
    });
  });

  // Handle new image cropping
  imageInput.addEventListener("change", function () {
    cropContainer.innerHTML = ""; // Clear previous crop fields
    cropInstances = [];
    croppedImages = [];

    const files = Array.from(imageInput.files);
    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        const wrapper = document.createElement("div");
        wrapper.className = "crop-wrapper position-relative mb-3";

        const img = document.createElement("img");
        img.src = e.target.result;
        img.style.maxWidth = "100%";
        wrapper.appendChild(img);

        cropContainer.appendChild(wrapper);

        const cropper = new Cropper(img, {
          aspectRatio: 1, // Change based on your aspect ratio
          viewMode: 1,
          autoCropArea: 0.8,
          responsive: true,
          crop() {
            croppedImages[index] = cropper.getCroppedCanvas().toDataURL("image/jpeg");
          },
        });

        cropInstances.push(cropper);

        
        const controls = document.createElement("div");
        controls.className = "mt-2 d-flex gap-2";
        controls.innerHTML = `
          <button type="button" class="btn btn-primary btn-sm save-crop">Save</button>
        `;
        wrapper.appendChild(controls);

        controls.querySelector(".save-crop").addEventListener("click", function () {
          const croppedData = cropper.getCroppedCanvas().toDataURL("image/jpeg");
          croppedImages[index] = croppedData;
          wrapper.querySelector("img").src = croppedData;
          cropper.destroy();
          controls.remove();
        });
      };
      reader.readAsDataURL(file);
    });
  });
});




  //  show messages
 
  function showMessage(message, type) {
    const messageContainer = document.createElement("div");
  
    messageContainer.classList.add("custom-message");
  
    if (type === "success") {
      messageContainer.style.backgroundColor = "#28a745"; 
      messageContainer.style.color = "white";
    } else if (type === "danger" || type === "error") {
      messageContainer.style.backgroundColor = "#dc3545";
      messageContainer.style.color = "white"; 
    } else {
      messageContainer.style.backgroundColor = "#343a40";
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
  
  


  
//add

document.addEventListener("DOMContentLoaded", function () {
  const imageInput = document.getElementById("productImages");
  const cropContainer = document.getElementById("imageCropContainer");
  const addProductForm = document.getElementById("addProductForm");

  let cropInstances = [];
  let croppedImages = [];

  imageInput.addEventListener("change", function () {
      cropContainer.innerHTML = "";
      cropInstances = [];
      croppedImages = [];

      const files = Array.from(imageInput.files);

      files.forEach((file, index) => {
          const reader = new FileReader();
          reader.onload = function (e) {
              const wrapper = document.createElement("div");
              wrapper.className = "crop-wrapper position-relative mb-3";
              wrapper.dataset.index = index;

              const img = document.createElement("img");
              img.src = e.target.result;
              img.style.maxWidth = "100%";
              wrapper.appendChild(img);

              const buttons = document.createElement("div");
              buttons.className = "mt-2 d-flex gap-2";
              buttons.innerHTML = `
                  <button type="button" class="btn btn-primary btn-sm save-crop">Save</button>
                  <button type="button" class="btn btn-secondary btn-sm cancel-crop">Cancel</button>
                  <button type="button" class="btn btn-danger btn-sm remove-crop">Remove</button>
              `;
              wrapper.appendChild(buttons);
              cropContainer.appendChild(wrapper);

              img.onload = function () {
                  const cropper = new Cropper(img, {
                      aspectRatio: 1, 
                      viewMode: 2,
                  });
                  cropInstances[index] = cropper;

                  buttons.querySelector(".save-crop").addEventListener("click", function () {
                      const croppedData = cropper.getCroppedCanvas().toDataURL("image/jpeg");
                      croppedImages[index] = croppedData;
                      wrapper.querySelector("img").src = croppedData; 
                      cropper.destroy(); 
                      buttons.style.display = "none";
                  });

                  buttons.querySelector(".cancel-crop").addEventListener("click", function () {
                      cropper.reset(); 
                  });

                  buttons.querySelector(".remove-crop").addEventListener("click", function () {
                      delete croppedImages[index];
                      wrapper.remove();
                  });
              };
          };
          reader.readAsDataURL(file);
      });
  });
  addProductForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(error => error.remove());

  
    let isValid = true;

    const productName = document.getElementById("productName");
    const productDescription = document.getElementById("productDescription");
    const productPrice = document.getElementById("productPrice");
    const productStock = document.getElementById("productStock");
    const productCategory = document.getElementById("productCategory");

  
    const fields = [
        { field: productName, name: "Product Name" },
        { field: productDescription, name: "Product Description" },
        { field: productCategory, name: "Product Category" }
    ];

  
    fields.forEach(({ field, name }) => {
        if (!field.value.trim()) {
            isValid = false;
            const errorMessage = document.createElement("div");
            errorMessage.classList.add('error-message');
            errorMessage.style.color = 'red';
            errorMessage.innerText = `${name} cannot be empty.`;
            field.parentElement.appendChild(errorMessage);
        }
    });


    if (!productPrice.value.trim() || isNaN(productPrice.value) || parseFloat(productPrice.value) <= 0) {
        isValid = false;
        const errorMessage = document.createElement("div");
        errorMessage.classList.add('error-message');
        errorMessage.style.color = 'red';
        errorMessage.innerText = "Product Price must be a positive number.";
        productPrice.parentElement.appendChild(errorMessage);
    }

    if (!productStock.value.trim() || isNaN(productStock.value) || parseInt(productStock.value) <= 0) {
        isValid = false;
        const errorMessage = document.createElement("div");
        errorMessage.classList.add('error-message');
        errorMessage.style.color = 'red';
        errorMessage.innerText = "Product Stock must be a positive.";
        productStock.parentElement.appendChild(errorMessage);
    }

    if (productImages.files.length < 3) {
      isValid = false;
      const errorMessage = document.createElement("div");
      errorMessage.classList.add('error-message');
      errorMessage.style.color = 'red';
      errorMessage.innerText = "At least 3 images are required.";
      productImages.parentElement.appendChild(errorMessage);
  }

    if (!isValid) return; 

    const formData = new FormData();
    formData.append("productName", productName.value);
    formData.append("productDescription", productDescription.value);
    formData.append("productPrice", productPrice.value);
    formData.append("productStock", productStock.value);
    formData.append("productCategory", productCategory.value);

    // Add cropped images as Blob
    croppedImages.forEach((croppedImage, index) => {
        const byteString = atob(croppedImage.split(',')[1]); 
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uintArray = new Uint8Array(arrayBuffer);
        for (let i = 0; i < byteString.length; i++) {
            uintArray[i] = byteString.charCodeAt(i);
        }

        const blob = new Blob([arrayBuffer], { type: "image/jpeg" });

        // Append the Blob to FormData
        formData.append("productImage", blob, `image_${index}.jpg`);
    });


    fetch("/admin/products/add", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Product response:", data);
    
        if (data.field && data.message) {
          const errorMessage = document.createElement("div");
          errorMessage.classList.add('error-message');
          errorMessage.style.color = 'red';
          errorMessage.innerText = data.message;
    
          document.getElementById(data.field).parentElement.appendChild(errorMessage);
          return;
        }
    
        if (data.message) {
          showMessage(data.message, "success");
          addProductForm.reset();
          window.location.reload();  
        }
      })
      .catch((error) => {
        console.error("Error adding product:", error);
        showMessage("An error occurred while adding the product. Please try again.", "error");  
             });
    });
    

});




//list unlist
async function deleteProduct(id) {
  try {
    const response = await fetch(`/admin/products/delete/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();
    

    if (response.ok) {
   
      showMessage(result.message || "Product unlisted successfully!", "success");

      document.querySelector(`#product-${id}`).innerHTML = `
        <button class="btn btn-success btn-sm undoBtn" 
                data-id="${id}" 
                onclick="undoProduct('${id}')">List</button>
      `;

    } else {
      showMessage(result.message || "Failed to unlist the product.", "error"); 
    }
  } catch (error) {
    console.error("Error unlisting product", error);
  }
}

async function undoProduct(id) {
  try {
    const response = await fetch(`/admin/products/undo/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (response.ok) {
      showMessage(result.message || "Product listed successfully!", "success"); 
     

      document.querySelector(`#product-${id}`).innerHTML = `
        <button class="btn btn-danger btn-sm deleteBtn" 
                data-id="${id}" 
                onclick="deleteProduct('${id}')">Unlist</button>
      `;
      
    } else {
      showMessage(result.message || "Failed to list the product.", "error"); 
    }
  } catch (error) {
    console.error("Error listing product", error);

  }
}


