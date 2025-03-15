
const Order=require('../../Models/orderModel')
const User = require('../../Models/userSchema');

const getOrder = async (req, res) => {
  try {

    const orders = await Order.find()
      .populate('userId') 
      .populate('addressId','fullName') 
      .sort({orderDate:-1})
      .lean();

    orders.forEach(order => {
      if (!order.grandTotal) {
        const subtotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        order.subtotal = subtotal;
        order.shippingCharge = order.shippingCharge || 50; 
        order.grandTotal = subtotal + order.shippingCharge;
      }
    });

   
    res.render('Admin/pages/orders', { orders });
  } catch (error) {
    console.log('Error fetching admin orders:', error);
    res.status(500).send('Internal Server Error');
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, orderStatus } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, message: 'Order status updated successfully', order: updatedOrder });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};


const orderDetails=async (req, res) => {
  const { orderId } = req.query;

  try {
    const order = await Order.findById(orderId)
    .populate('addressId')
    .populate('items.productId')
   
    .populate('addressId')
    if (!order) {
      return res.status(404).send('Order not found');
    }
    res.json(order);
  } catch (error) {
    res.status(500).send('Error fetching order details');
  }
}


module.exports={
  getOrder,
  updateOrderStatus,
  orderDetails
 
}