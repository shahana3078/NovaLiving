function toggleAddress(orderId) {
  const details = document.getElementById(`address-details-${orderId}`);
  if (details.style.display === "none" || details.style.display === "") {
    details.style.display = "block";
  } else {
    details.style.display = "none";
  }
}

document.getElementById('cancelOrderBtn').addEventListener('click', function () {
  const orderId = this.getAttribute('data-order-id');  // Correctly fetches order ID
  const cancelReasonModal = document.getElementById('cancelReasonModal');
  cancelReasonModal.style.display = 'block';

  document.getElementById('doneBtn').addEventListener('click', function () {
    const selectedReason = document.querySelector('input[name="cancelReason"]:checked');
    const customReasonInput = document.getElementById('customReasonInput').value.trim();

    let finalReason = selectedReason ? selectedReason.value : '';

    if (finalReason === 'custom' && customReasonInput) {
      finalReason = customReasonInput;
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

    cancelReasonModal.style.display = 'none'; // Hide modal after reason selection
  });
});
