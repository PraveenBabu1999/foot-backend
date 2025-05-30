const Review = require('../models/Review');
require('../models/users')

// POST /api/reviews/:productId
const postReviews = async (req, res) => {
  try {
    const userId = req.user?._id;
    const productId = req.params.productId;
    const { rating, comment } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!rating || !comment) {
      return res.status(400).json({ message: 'Rating and comment are required' });
    }

    // 🔍 Check if review already exists for this user-product combination
    const existingReview = await Review.findOne({
      user: userId,
      product: productId,
    });

    if (existingReview) {
      return res.status(409).json({ message: 'You have already given a rating for this product' });
    }

    // ✅ Save new review
    const newReview = new Review({
      user: userId,
      product: productId,
      rating,
      comment,
    });

    const savedReview = await newReview.save();
    res.status(201).json(savedReview);
  } catch (error) {
    console.error('Internal Server Error:', error);
    res.status(500).json({ message: 'Failed to post review', error });
  }
};
// ✅ Ensure User model is registered

const getReviews = async (req, res) => {
  try {
    const productId = req.params.productId;
    console.log('bm',productId)

    const reviews = await Review.find({ product: productId })
      .populate('user') // ✅ Populate user details
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Failed to fetch reviews', error });
  }
};


//update review api

// const Review = require('../models/Review'); // Make sure this path is correct

const updateReviews = async (req, res) => {
  try {
    const userId = req.user?._id;
    const productId = req.params.productId;
    const { rating, comment } = req.body;

    console.log('Updating review - User:', userId, 'Product:', productId);

    // Find the existing review
    const existingReview = await Review.findOne({ user: userId, product: productId });

    if (!existingReview) {
      return res.status(404).json({ message: 'Review not found for this user and product' });
    }

    // Update fields
    if (rating !== undefined) existingReview.rating = rating;
    if (comment !== undefined) existingReview.comment = comment;

    // Save the updated review
    const updatedReview = await existingReview.save();

    res.status(200).json({
      message: 'Review updated successfully',
      review: updatedReview
    });

  } catch (error) {
    console.error('Error updating review!', error);
    res.status(500).json({ message: 'Failed to update review', error: error.message });
  }
};

// delete review api

const deleteReviews = async (req, res) =>{
  try {
    const userId = req.user?._id;
    const productId = req.params.productId

    const deletedReview = await Review.findOneAndDelete({
      user: userId,
      product:productId
    });

    if (!deletedReview) {
      return res.status(404).json({ message: 'Review not found for this user and product' });
    }

    res.status(200).json({
      message: 'Review deleted successfully',
      review: deletedReview
    });
    
  } catch (error) {
    console.error('Error fetching review!',error);
    res.status(500).json({message:'Internal server error'})
  }
}


module.exports = { postReviews,getReviews,updateReviews,deleteReviews };
