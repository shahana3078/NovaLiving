
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
          <!-- Left Side -->
          <div style="flex: 1; min-width: 300px; padding-right: 20px; border-right: 1px solid #ddd;">
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}</p>
            <p><strong>User Name:</strong> ${order.addressId.fullName}</p>
            <p><strong>Address:</strong> ${order.addressId.address}, ${order.addressId.city}, ${order.addressId.state} - ${order.addressId.pincode}</p>
            <p><strong>Mobile:</strong> ${order.addressId.mobile}</p>
            <p><strong>Total Amount:</strong> ₹${order.grandTotal.toFixed(2)}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod || 'Cash on Delivery'}</p>
            <p><strong>Status:</strong> ${order.orderStatus}</p>
          </div>

          <!-- Right Side -->
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




 