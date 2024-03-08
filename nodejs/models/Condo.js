const mongoose = require('mongoose');

// Define the schema for a comment
const commentSchema = new mongoose.Schema({
    text: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Reference to the User model for the user who posted the comment
    }
});

// Define the schema for a review
const reviewSchema = new mongoose.Schema({
    title: String,
    content: String,
    rating: Number,
    image: String,
    date: Date,
    // likes: Number,
    comments: [commentSchema] // Array of comments associated with the review
});

// Define the schema for a condo
const condoSchema = new mongoose.Schema({
    id: { 
        type: String,
        required: true,
        unique: true // Ensure usernames are unique
    },
    name: { 
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        default: 0 // Default value for average rating
    },
    img: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    reviews: [reviewSchema] // Array of reviews associated with the condo
},{ versionKey: false, timestamps: true });

// Create the User model
const condoModel = mongoose.model('condo', condoSchema);

module.exports = condoModel;