const mongoose = require('mongoose');
const userModel = require('../models/User'); 

// Define the schema for a comment
const commentSchema = new mongoose.Schema({
    text: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: userModel // Reference to the User model for the user who posted the comment
    }
});

// Define the schema for a review
const reviewSchema = new mongoose.Schema({
    title: String,
    content: String,
    rating: Number,
    image: String,
    date: Date,
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    // likes: Number,
    condoId: String,
    comments: [commentSchema] // Array of comments associated with the review
});

// Create the Review model
const reviewModel = mongoose.model('review', reviewSchema);




module.exports = reviewModel;