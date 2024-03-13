const userModel = require('../models/User');
const reviewModel = require('../models/Review');

async function findUser(username, password){
    
    try {
        // Find user by username
        
        const user = await userModel.findOne({ user: username });
        if (!user) {
            return [404, 'User not found', 0, "", "", "Condo Bro"];

           // res.status(404).json({ message: 'User not found' });
        }

        // Compare passwords
        // const passwordMatch = await bcrypt.compare(password, user.pass);

        if (password !== user.pass) {
            return [401, 'Invalid password', 0, "", "", "Condo Bro"];
            //res.status(401).json({ message: 'Invalid password' });
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

function createAccount(username, password, picture){
    const user = userModel({
        user: username,
        pass: password,
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

function editProfile(name, email, bio, job, education, city, imagePath, logUsername){
    // Filter out null values
    const newData = {};
    if (name !== undefined) { 
        newData.name = name;
        logUsername = name;
    }
    if (email !== undefined) newData.email = email;
    if (bio !== undefined) newData.bio = bio;
    if (job !== undefined) {
        newData.job = job;
        logUserJob = job;
    }
    if (education !== undefined) newData.education = education;
    if (city !== undefined) newData.city = city;
    if (imagePath !== null && imagePath !== undefined) {
        newData.picture = imagePath;
        logIcon = imagePath;
    }

    console.log(newData);

    // Use updateOne to update specific fields of the user document
    userModel.updateOne({ "user": logUsername }, { $set: newData })
        .then(result => {
            // Handle successful update
            console.log("Update successful:", result);
            return true;
           // resp.json({ message: 'Profile updated successfully!' });
        })
        .catch(err => {
            // Handle error
            console.error("Error updating document:", err);
            return false;
        });
        // Respond to the request
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


module.exports.findUser = findUser;
module.exports.createAccount = createAccount;
module.exports.editProfile = editProfile;
module.exports.createReview = createReview;