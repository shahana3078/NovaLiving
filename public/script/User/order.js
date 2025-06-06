function toggleAddress(orderId) {
  const details = document.getElementById(`address-details-${orderId}`);
  if (details.style.display === "none" || details.style.display === "") {
    details.style.display = "block";
  } else {
    details.style.display = "none";
  }
}


function downloadInvoice() {
  const orderId = "ORDER_ID_HERE"; 
  window.location.href = `/download-invoice?orderId=${orderId}`;
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

function retryPayment(orderId) {
  fetch('/retry-razorpay-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId })
  })
    .then(res => res.json())
    .then(order => {
      const options = {
        key: 'rzp_test_29wLZVOKsQCqZx',
        amount: order.amount,
        currency: 'INR',
        order_id: order.id,
        name: "NovaLiving",
        description: "Retry Payment",

        handler: function (response) {
          fetch('/retry-verify-razorpay-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            })
          })
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                Swal.fire({
                  icon: 'success',
                  title: 'Payment Successful',
                  text: 'Your payment has been verified.',
                }).then(() => {
                  window.location.reload();
                });
              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Payment Failed',
                  text: data.message || 'Verification failed.',
                });
              }
            });
        },

        modal: {
          ondismiss: function () {
            Swal.fire({
              icon: 'warning',
              title: 'Payment Cancelled',
              text: 'Payment was not completed.',
            });
          }
        }
      };

      const rzp1 = new Razorpay(options);
      rzp1.open();
    })
    .catch(err => console.error('Retry payment error:', err));
}



































document.addEventListener("DOMContentLoaded", function () {
  const retryButton = document.querySelector(".retry-payment-btn");

  if (retryButton) {
    retryButton.addEventListener("click", function () {
      const orderId = this.dataset.orderId;

      fetch('/retry-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      })
      .then(response => response.json())
      .then(order => {
        const options = {
          key: 'rzp_test_29wLZVOKsQCqZx', 
          amount: order.amount,
          currency: 'INR',
          order_id: order.id,
          name: "NovaLiving",
          description: "Retry Order Payment",

          handler: function (response) {
            fetch('/confirm-retry-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                orderId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              })
            })
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                window.location.href = "/order-confirmed";
              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Payment Failed',
                  text: 'Retry failed. Please try again.',
                });
              }
            });
          },

          modal: {
            ondismiss: function () {
              Swal.fire({
                icon: 'info',
                title: 'Payment Not Completed',
                text: 'You dismissed the Razorpay payment window.',
              });
            }
          }
        };

        const rzp = new Razorpay(options);
        rzp.open();
      })
      .catch(error => {
        console.error("Error initiating retry:", error);
        Swal.fire({
          icon: 'error',
          title: 'Retry Failed',
          text: 'Could not retry the payment. Please try again later.',
        });
      });
    });
  }
});


