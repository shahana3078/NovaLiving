// document.getElementById("offerForm").addEventListener("submit", function(event) {
//   event.preventDefault(); 

//   // Get form values
//   const offerTitle = document.getElementById("offerTitle").value;
//   const offerType = document.getElementById("offerType").value;
//   const offerValue = document.getElementById("offerValue").value;
//   const discount = document.getElementById("discount").value;
//   const expires = document.getElementById("expires").value;

//   // Get table body and add new row
//   const tableBody = document.getElementById("offer-table-body");
//   const rowCount = tableBody.rows.length + 1;

//   const newRow = `
//       <tr>
//           <td>${rowCount}</td>
//           <td>${offerTitle}</td>
//           <td>${offerType}</td>
//           <td>${offerValue}</td>
//           <td>${discount}</td>
//           <td>${expires}</td>
//           <td><button class="btn btn-danger btn-sm">Delete</button></td>
//       </tr>
//   `;

//   tableBody.innerHTML += newRow;

//   // Close modal
//   var offerModal = new bootstrap.Modal(document.getElementById('offerModal'));
//   offerModal.hide();

//   // Reset form
//   document.getElementById("offerForm").reset();
// });

document.getElementById("add-offer-form").addEventListener("change", async function () {
  const value = this.value;
  const element = document.getElementById("dynamic-type-drop-down");
  if (element) element.remove();

  try {
    const response = await axios.get(`/admin/offers-type/${value}`);
    const data = response.data.data;
    if (value === "Products") {
      product = data;
      return createDropdown(product, true);
    } else if (value === "Category") {
      category = data;
      return createDropdown(category);
    }
  } catch (err) {
    console.log(`Error while fetching data: ${err.message}`);
  }
});


//add offer
document.getElementById("add-offer-form").addEventListener("submit", function(e){
  e.preventDefault();
  
  const errorMessage = document.getElementById('create-form-err-message');
  errorMessage.textContent = '';
  
  const offerTitle = document.getElementById('offerTitle').value.trim();
  const offerType = document.getElementById('offerType').value;
  const offerValue = document.getElementById('offerValue').value;
  const discountPercentage = document.getElementById('discount').value;
  const expDate = document.getElementById('expires').value;
  
  let errors = [];
  
  if (!offerTitle || offerTitle.length < 5 || offerTitle.length > 25) {
      errors.push("Offer title must be between 5 and 25 characters.");
  }
  if (!offerType) errors.push('Please select an offer type.');
  if (!offerValue) errors.push('Offer value is required.');
  if (!discountPercentage || discountPercentage < 0 || discountPercentage > 100) {
      errors.push('Discount percentage must be between 0 and 100.');
  }
  if (!expDate) errors.push('Expiration date is required.');

  if (errors.length) {
      errorMessage.innerHTML = errors.join('<br>');
      return;
  }

  axios.post('/admin/offer-add', {
      offerTitle, 
      offerType, 
      discountPercentage, 
      expDate, 
      values: [offerValue]
  })
  .then(res => {
      if (res.data.err_message) {
          return errorMessage.innerHTML = res.data.err_message;
      }
      if (res.data.status) {
          addRow(res.data.data);
          document.getElementById("add-offer-div").style.display = "none";
      }
  })
  .catch(err => console.log(`Error while adding offer: ${err.message}`));
});



function addRow(offer) {
  const tableBody = document.getElementById("t-body");
  console.log('table body:',tableBody)
  const rowCount = tableBody.rows.length + 1;
  
  const newRow = `
      <tr>
          <td>${rowCount}</td>
          <td>${offer.offerTitle}</td>
          <td>${offer.offerType}</td>
          <td>${offer.offerAvailable.join('<br>')}</td>
          <td>${offer.discountPercentage}%</td>
          <td>${new Date(offer.expDate).toLocaleDateString('en-GB')}</td>
          <td>
              <button id="action-btn" type="button" value="${offer._id}" class="btn btn-outline-danger">Deactivate</button>
          </td>
      </tr>
  `;
  tableBody.innerHTML += newRow;
}
