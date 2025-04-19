
const Order=require('../../Models/orderModel')
const User = require('../../Models/userSchema');

const getOrder = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const totalOrders = await Order.countDocuments();

    const orders = await Order.find()
      .populate('userId')
      .populate('addressId', 'fullName')
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    orders.forEach(order => {
      if (!order.grandTotal) {
        const subtotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        order.subtotal = subtotal;
        order.shippingCharge = order.shippingCharge || 50;
        order.grandTotal = subtotal + order.shippingCharge;
      }
    });

    const totalPages = Math.ceil(totalOrders / limit);

    res.render('Admin/pages/orders', {
      orders,
      currentPage: page,
      totalPages
    });
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

const showReturnRequests = async (req, res) => {
  try {
    const returnRequests = await Order.find({
      'returnRequest.status': { $nin: ['approved', 'rejected'] } 
    })
    .populate('userId', 'name email')
    .lean();

    res.json({ requests: returnRequests });
  } catch (error) {
    console.error('Error fetching return requests:', error);
    res.status(500).json({ error: 'Failed to load return requests.' });
  }
};



const acceptReturn = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.orderStatus = 'returned';
    order.returnRequest.status = 'approved';

    await order.save();

    res.json({ success: true, message: 'Return request approved successfully.' });
  } catch (error) {
    console.error('Error approving return request:', error);
    res.status(500).json({ success: false, message: 'Failed to approve return request.' });
  }
};
const rejectReturn = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.returnRequest.status = 'rejected'; 

    await order.save();

    res.json({ success: true, message: 'Return request rejected successfully.' });
  } catch (error) {
    console.error('Error rejecting return request:', error);
    res.status(500).json({ success: false, message: 'Failed to reject return request.' });
  }
};





module.exports={
  getOrder,
  updateOrderStatus,
  orderDetails,
  showReturnRequests,
  acceptReturn,
  rejectReturn
 
}