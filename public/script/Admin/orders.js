
async function updateOrderStatus(orderId, status) {
  try {
    const response = await axios.post('/admin/updateOrderStatus', {
      orderId: orderId,
      orderStatus: status,
    });

    if (response.data.success) {

      Swal.fire({
        title: 'Success',
        text: 'Order status updated successfully!',
        icon: 'success',
      }).then(() => {
        window.location.reload();
      });
    } else {
      Swal.fire({
        title: 'Error',
        text: response.data.message || 'Failed to update order status.',
        icon: 'error',
      });
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    Swal.fire('Error', 'An error occurred while updating the order status.', 'error');
  }
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
        <div style="display: flex; flex-wrap: wrap; gap: 20px;">
          <div style="flex: 1; min-width: 300px; padding-right: 20px; border-right: 1px solid #ddd;">
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}</p>
            <p><strong>User Name:</strong> ${order.addressId ? order.addressId.fullName : 'N/A'}</p>
            <p><strong>Address:</strong> ${order.addressId 
                ? `${order.addressId.address}, ${order.addressId.city}, ${order.addressId.state} - ${order.addressId.pincode}` 
                : 'N/A'}</p>
            <p><strong>Mobile:</strong> ${order.addressId ? order.addressId.mobile : 'N/A'}</p>
            <p><strong>Total Amount:</strong> ₹${order.grandTotal?.toFixed(2) || '0.00'}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod || 'Cash on Delivery'}</p>
            <p><strong>Status:</strong> ${order.orderStatus}</p>
            ${order.orderStatus === 'cancelled' 
            ? `<p><strong style='color:red'>Cancellation Reason:</strong> ${order.cancelReason}</p>` 
            : ''}
            
            ${order.orderStatus === 'returned' 
            ? `<p><strong style='color:red'>ReturnReason:</strong> ${order.returnRequest.reason}</p>` 
            : ''}
          </div>

          <div style="flex: 1; min-width: 300px; padding-left: 20px;">
            <h5>Order Items:</h5>
            <div class="order-items">
              ${order.items.map(item => `
                <div class="order-item" style="display: flex; align-items: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #ddd;">
                  <img
                    src="/uploads/images/${item.productId.images[0]}"
                    alt="${item.productId.name}"
                    style="width: 100px; height: 100px; object-fit: cover; margin-right: 15px;"
                  />
                  <div>
                    <p><strong>Product Name:</strong> ${item.productId.name}</p>
                    <p><strong>Price:</strong> ₹${item.price.toFixed(2)}</p>
                    <p><strong>Quantity:</strong> ${item.quantity}</p>
                    <p><strong>Subtotal:</strong> ₹${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
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



async function showReturnRequests() {
  try {
      const response = await axios.get('/admin/return-requests');
      const returnRequests = response.data.requests;

      const pendingRequests = returnRequests.filter(request =>
        request.returnRequest && 
        request.orderStatus !== 'returned' && 
        request.returnRequest.status !== 'rejected'
      );

      const modalBody = document.getElementById('returnRequestsModalBody');

      if (pendingRequests.length === 0) {
          modalBody.innerHTML = `
            <div class="text-center" style="padding: 20px;">
              <strong>No Pending Return Requests</strong>
            </div>`;
      } else {
          modalBody.innerHTML = pendingRequests.map(request => `
            <div id="request-${request._id}" class="return-request-item" 
                 style="border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; border-radius: 5px;">
               <strong>Order ID:</strong> ${request._id}<br>
               <strong>User:</strong> ${request.userId.name} (${request.userId.email})<br>
               <strong>Reason:</strong> ${request.returnRequest.reason}<br>
               <strong>Status:</strong> ${request.returnRequest.status}<br>

               <div style="margin-top: 10px; display: flex; gap: 10px;">
                   <button class="btn btn-success btn-sm" onclick="acceptReturn('${request._id}')">Accept</button>
                   <button class="btn btn-danger btn-sm" onclick="rejectReturn('${request._id}')">Reject</button>
               </div>
            </div>
         `).join('');
      }

      const returnModal = new bootstrap.Modal(document.getElementById('returnRequestsModal'));
      returnModal.show();

  } catch (error) {
      console.error('Error fetching return requests:', error);
      Swal.fire('Error!', 'Failed to load return requests.', 'error');
  }
}

async function acceptReturn(orderId) {
  try {
    const response = await axios.post(`/return-order/${orderId}`);
    if (response.data.success) {
      Swal.fire('Success!', 'Return request accepted and order marked as returned.', 'success')
      document.getElementById(`request-${orderId}`).remove();
    } else {
      Swal.fire('Error!', response.data.message, 'error');
    }
  } catch (error) {
    console.error('Error accepting return request:', error);
    Swal.fire('Error!', 'Failed to accept return request.', 'error');
  }
}


async function rejectReturn(orderId) {
  try {
    const response = await axios.post(`/admin/reject-return/${orderId}`);
    if (response.data.success) {
      Swal.fire('Rejected!', 'Return request rejected.', 'info');
      document.getElementById(`request-${orderId}`).remove();
    } else {
      Swal.fire('Error!', response.data.message, 'error');
    }
  } catch (error) {
    console.error('Error rejecting return request:', error);
    Swal.fire('Error!', 'Failed to reject return request.', 'error');
  }
}

