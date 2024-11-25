async function fetchCategories() {
  try {
    const response = await axios.get("/categories");
    renderCategories(response.data);
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
}

document.getElementById("categoryForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const categoryName = document.getElementById("categoryName").value.trim();
  const categoryDescription = document.getElementById("categoryDescription").value.trim();
  let isValid = true;

  if (!categoryName) {
    showValidationError("categoryName", "Category name cannot be empty or whitespace.");
    isValid = false;
  } else {
    hideValidationError("categoryName");
  }

  if (!categoryDescription) {
    showValidationError("categoryDescription", "Category description cannot be empty or whitespace.");
    isValid = false;
  } else {
    hideValidationError("categoryDescription");
  }

  if (!isValid) return;

  const categoryData = {
    name: categoryName,
    description: categoryDescription,
  };

  try {
    const response = await axios.post("/admin/categories/add", categoryData);
    location.reload()
    console.log(response.data);
    showMessage("Category added successfully", "success");
    $("#addCategoryModal").modal("hide");
  } catch (error) {
    console.error("Error adding category:", error);

    const errorMessage = error.response?.data?.message || "Failed to add category.";
    showValidationError("categoryName", errorMessage); 
  }
});
 


async function deleteCategory(id) {
  try {
    await axios.put(`/admin/categories/delete/${id}`);
    location.reload();
  } catch (error) {
    console.error("Error deleting category:", error);
  }
}

async function undoCategory(id) {
  try {
    await axios.put(`/admin/categories/undo/${id}`);
    location.reload();
  } catch (error) {
    console.error("Error undoing category:", error);
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


function showValidationError(inputId, message) {
  const errorElement = document.getElementById(`${inputId}Error`);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = "block";
  }
}

function hideValidationError(inputId) {
  const errorElement = document.getElementById(`${inputId}Error`);
  if (errorElement) {
    errorElement.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".editBtn").forEach((button) => {
    button.addEventListener("click", function () {
      const category = {
        id: this.getAttribute("data-id"),
        name: this.getAttribute("data-name"),
        description: this.getAttribute("data-description"),
      };
      openEditCategoryModal(category);
    });
  });

  function openEditCategoryModal(category) {
    const editCategoryForm = document.getElementById("editCategoryForm");
    editCategoryForm.setAttribute("data-id", category.id);

    document.getElementById("editCategoryName").value = category.name;
    document.getElementById("editCategoryDescription").value =
      category.description;

    hideValidationError("editCategoryName");
    hideValidationError("editCategoryDescription");

    $("#editModal").modal("show");
  }

  document
    .getElementById("editCategoryForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const id = this.getAttribute("data-id");
      const categoryName = document
        .getElementById("editCategoryName")
        .value.trim();
      const categoryDescription = document
        .getElementById("editCategoryDescription")
        .value.trim();

      let isValid = true;

      if (!categoryName) {
        showValidationError(
          "editCategoryName",
          "Category name cannot be empty or whitespace."
        );
        isValid = false;
      } else {
        hideValidationError("editCategoryName");
      }

      if (!categoryDescription) {
        showValidationError(
          "editCategoryDescription",
          "Category description cannot be empty or whitespace."
        );
        isValid = false;
      } else {
        hideValidationError("editCategoryDescription");
      }

      if (!isValid) return;

      const updatedCategory = {
        categoryName: categoryName,
        description: categoryDescription,
      };

      try {
        const response = await axios.put(
          `/admin/categories/update/${id}`,
          updatedCategory
        );

        console.log(response.data);

        const row = document.querySelector(`[data-id="${id}"]`);
        if (row) {
          row.querySelector(".categoryName").textContent =
            response.data.categoryName;
          row.querySelector(".categoryDescription").textContent =
            response.data.description;
        }

        $("#editModal").modal("hide");
        showMessage("Category updated successfully", "success");
      } catch (error) {
        console.error("Error updating category:", error);

        const errorMessage =
          error.response?.data?.message || "Failed to update category.";

        showMessage(errorMessage, "danger");

    
        if (error.response?.status === 400) {
          showValidationError(
            "editCategoryName",
            "Category name already exists. Please choose another."
          );
        }
      }
    });
});
