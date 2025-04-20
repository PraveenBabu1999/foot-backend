const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const Cart = require('../models/cart');
const UserModel = require('../models/users');
const Order = require('../models/Order');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const checkout = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId, paymentMethod } = req.body;
    console.log('resp',req.body)

    // Validate payment method
    const validMethods = ['razorpay', 'cod'];
    if (!validMethods.includes(paymentMethod)) {
      return res.status(400).json({ msg: 'Invalid payment method' });
    }

    // 1. Fetch the user's cart
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ msg: 'Cart is empty' });
    }

    // 2. Fetch the user's address
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(400).json({ msg: 'Invalid address ID' });
    }

    // 3. Calculate total amount
    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // 4. Create Razorpay order if method is 'razorpay'
    let razorpayOrder = null;
    if (paymentMethod === 'razorpay') {
      razorpayOrder = await razorpay.orders.create({
        amount: totalAmount * 100, // in paise
        currency: 'INR',
        receipt: `receipt_order_${Date.now()}`,
        payment_capture: 1
      });
    }

    // 5. Create and save order
    const order = new Order({
      userId,
      items: cart.items,
      address,
      totalAmount,
      paymentMethod,
      paymentStatus: 'pending',
      status: 'processing',
      razorpay: razorpayOrder ? { orderId: razorpayOrder.id } : {}
    });

    await order.save();

    // 6. Optionally clear cart
    // await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } });

    // 7. Send response
    return res.status(200).json({
      success: true,
      message: 'Order initiated',
      orderId: order._id,
      razorpayOrder
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return res.status(500).json({ msg: 'Server error during checkout' });
  }
};

module.exports = { checkout };
