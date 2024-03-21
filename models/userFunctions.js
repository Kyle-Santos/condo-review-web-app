const userModel = require('../models/User');
const reviewModel = require('../models/Review');

// can be added to hash the password for confidentiality
const bcrypt = require('bcrypt'); 
const saltRounds = 10;

async function findUser(username, password){
    
    try {
        // Find user by username
        
        const user = await userModel.findOne({ user: username });
        if (!user) {
            return [404, 'User not found', 0, "", "", "Condo Bro"];
        }

        // Compare passwords
        const passwordMatch = await bcrypt.compare(password, user.pass);

        if (!passwordMatch) {
            return [401, 'Invalid password', 0, "", "", "Condo Bro"];
        }

        /* logStatus = 1; //change to include owner
        logUsername = username;
        logIcon = user.picture;
        logUserJob = user.job; */

        // Authentication successful
        return [200, 'Login successful', 1, username, user.picture, user.job];
        //res.status(200).json({ message: 'Login successful', user: user });
    } catch (error) {
        console.error('Error during login:', error);
        return [500, 'Internal Server Error', 0, "", "", "Condo Bro"];
        //res.status(500).json({ message: 'Internal server error' });
    }
}

async function createAccount(username, password, picture) {
    // encrypt password
    let encryptedPass = "";

    await new Promise((resolve, reject) => {
        bcrypt.hash(password, saltRounds, function(err, hash) { 
            encryptedPass = hash;
            resolve(); // Resolve the promise when hashing is complete
        });
    });

    const user = userModel({
        user: username,
        pass: encryptedPass,
        picture: picture,
        email: "none",
        job: "Condo Bro",
        school: "not specified",
        city: "not specified,"
        });
        
        return user.save().then(function(login) {
            console.log('Account created');

            return [true, 200, 'Account created successfully'];
           // resp.status(200).send({ success: true, message: 'Account created successfully' });
        }).catch(function(error) {
            // Check if the error indicates a duplicate key violation
            if (error.code === 11000 && error.name === 'MongoServerError') {
                console.error('Duplicate key error:', error.keyPattern);
                // Handle duplicate key error
                return [false, 500, 'Username already exists. Error creating account.'];
                //resp.status(500).send({ success: false, message: 'Username already exists. Error creating account.' });
                
            } else {
                console.error('Error creating account:', error);

                return [false, 500, 'Error creating account'];
                //resp.status(500).send({ success: false, message: 'Error creating account' });
            }
        });
}

function filterEditData(userData){
    const { name, email, bio, job, education, city, imagePath } = userData;
    // Filter out null values
    const newData = {};
    if (name !== undefined) newData.user = name;
    if (email !== undefined) newData.email = email;
    if (bio !== undefined) newData.bio = bio;
    if (job !== undefined) newData.job = job;
    if (education !== undefined) newData.education = education;
    if (city !== undefined) newData.city = city;
    if (imagePath !== null && imagePath !== undefined) newData.picture = imagePath;

    return newData;
}

async function createReview(condoId, title, content, rating, image, date, logUsername){
    // Find the user by username


    const user = await userModel.findOne( {user: logUsername} );

    // Create a review
    const newReview = reviewModel({
        title: title,
        content: content,
        rating: rating,
        image: image,
        date: date,
        condoId: condoId,
        author: user._id // Set the author field to the ObjectId of the user
    });
    
    // Save the new review instance to the database
    const savedReview = await newReview.save();

    // If needed, you can access the _id of the saved review document
    const savedReviewId = savedReview._id;

    // Update the user's reviews array
    user.reviews.push(savedReviewId);

    // Save the user to the database
    await user.save();
}

function processReviews(reviews){
    
    if (reviews) {
        // Preprocess date field
        processedReviews = reviews.map(review => {
            // Create a new object to avoid mutating the original object
            const processedReview = { ...review };

            // Format date without time component
            processedReview.date = review.date.toLocaleDateString(); // Assuming date is a JavaScript Date object

            // Format dates of comments
            processedReview.comments = review.comments.map(comment => {
                const processedComment = { ...comment };
                processedComment.date = comment.date.toLocaleDateString();
                return processedComment;
            });

            // Transform the integer rating into an array of boolean values representing filled stars
            processedReview.rating = Array.from({ length: 5 }, (_, index) => index < review.rating);
            return processedReview;
        });

        return processedReviews;
    }

    return reviews;
}

module.exports.processReviews = processReviews;
module.exports.findUser = findUser;
module.exports.createAccount = createAccount;
module.exports.filterEditData = filterEditData;
module.exports.createReview = createReview;