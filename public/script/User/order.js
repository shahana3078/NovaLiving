function toggleAddress(orderId) {
  const details = document.getElementById(`address-details-${orderId}`);
  if (details.style.display === "none" || details.style.display === "") {
    details.style.display = "block";
  } else {
    details.style.display = "none";
  }
}


document.addEventListener('DOMContentLoaded', function () {
  
  // Return Order

const returnOrderBtn = document.getElementById('returnOrderBtn');
const doneBtnReturn = document.getElementById('doneBtnReturn');  

if (returnOrderBtn) {
  returnOrderBtn.addEventListener('click', function () {
    const orderId = this.getAttribute('data-order-id');
    const returnReasonModal = document.getElementById('returnReasonModal');
    const customReturnRadio = document.getElementById('customReturnReason');
    const customReturnInput = document.getElementById('customReturnReasonInput');
  
    returnReasonModal.style.display = 'block';

    doneBtnReturn.disabled = true;

    document.querySelectorAll('input[name="returnReason"]').forEach(radio => {
      radio.addEventListener('change', function () {
        if (customReturnRadio.checked) {
          customReturnInput.style.display = 'block';
          customReturnInput.setAttribute('required', 'true');
        } else {
          customReturnInput.style.display = 'none';
          customReturnInput.removeAttribute('required');
          customReturnInput.value = '';
        }
        doneBtnReturn.disabled = false;
      });
    });

  
    doneBtnReturn.addEventListener('click', async function () {
      const selectedReason = document.querySelector('input[name="returnReason"]:checked');
      const customReasonValue = customReturnInput.value.trim();

      let finalReason = selectedReason ? selectedReason.value : '';

      if (finalReason === 'custom' && customReasonValue) {
        finalReason = customReasonValue;
      }

      if (!finalReason) {
        Swal.fire('Error!', 'Please select or enter a return reason.', 'error');
        return;
      }

      const confirmResult = await Swal.fire({
        title: 'Are you sure?',
        text: 'Do you really want to request a return?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Request Return!',
        cancelButtonText: 'No, keep it',
      });

      if (confirmResult.isConfirmed) {
        try {
          const response = await fetch(`/request-return/${orderId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              orderId: orderId,
              returnReason: finalReason,
              requestStatus: 'requested'
            })
          });

          const data = await response.json();
          if (data.success) {
            Swal.fire('Request Sent!', 'Your return request has been sent to the admin.', 'success');

            const successMessage = document.createElement('div');
            successMessage.textContent = 'Return request sent! You will be informed within 2-3 days.';
            successMessage.style.color = 'orange';
            successMessage.style.fontWeight = 'bold';
            successMessage.style.textAlign = 'center';
            successMessage.style.marginTop = '20px';

            const parentContainer = returnOrderBtn.parentElement;
            returnOrderBtn.remove();
            parentContainer.appendChild(successMessage);

          } else {
            Swal.fire('Failed!', data.message || 'Something went wrong while sending your request.', 'error');
          }

        } catch (error) {
          console.error('Error:', error);
          Swal.fire('Error!', 'An error occurred while processing your request.', 'error');
        }
      }

      returnReasonModal.style.display = 'none';
    });
  });
}


  
  // Cancel Order
  const cancelOrderBtn = document.getElementById('cancelOrderBtn');
  if (cancelOrderBtn) {
    cancelOrderBtn.addEventListener('click', function () {
      const orderId = this.getAttribute('data-order-id');
      const cancelReasonModal = document.getElementById('cancelReasonModal');
      const customReasonRadio = document.getElementById('customReason');
      const customReasonInput = document.getElementById('customReasonInput');

      cancelReasonModal.style.display = 'block';

      document.querySelectorAll('input[name="cancelReason"]').forEach(radio => {
        radio.addEventListener('change', function () {
          if (customReasonRadio.checked) {
            customReasonInput.style.display = 'block';
            customReasonInput.setAttribute('required', 'true');
          } else {
            customReasonInput.style.display = 'none';
            customReasonInput.removeAttribute('required');
            customReasonInput.value = '';
          }
        });
      });

      document.getElementById('doneBtn').addEventListener('click', function () {
        const selectedReason = document.querySelector('input[name="cancelReason"]:checked');
        const customReasonValue = customReasonInput.value.trim();

        let finalReason = selectedReason ? selectedReason.value : '';

        if (finalReason === 'custom' && customReasonValue) {
          finalReason = customReasonValue;
        }

        if (!finalReason) {
          Swal.fire('Error!', 'Please select or enter a cancellation reason.', 'error');
          return;
        }

        Swal.fire({
          title: 'Are you sure?',
          text: 'Do you really want to cancel this order?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, Cancel it!',
          cancelButtonText: 'No, keep it',
        }).then((result) => {
          if (result.isConfirmed) {
            fetch(`/cancel-order/${orderId}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                orderId: orderId,
                cancelReason: finalReason,
              }),
            })
            .then((response) => response.json())
            .then((data) => {
              if (data.success) {
                Swal.fire('Cancelled!', 'Your order has been cancelled.', 'success');
                document.getElementById('orderStatusContainer').innerHTML =
                  '<h3 style="color: red; text-align: center;">Order Cancelled!</h3>';
                document.getElementById('cancelOrderBtn').style.display = 'none';
              } else {
                Swal.fire('Failed!', 'Something went wrong while cancelling the order.', 'error');
              }
            })
            .catch((error) => {
              console.error('Error:', error);
              Swal.fire('Error!', 'An error occurred while processing your request.', 'error');
            });
          }
        });

        cancelReasonModal.style.display = 'none';
      });
    });
  }
});

