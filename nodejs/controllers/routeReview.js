const reviewModel = require('../models/Review');
const userModel = require('../models/User');

var logStatus = 0;
var logUsername = "";
var logIcon = "";
var logUserJob = "Condo Bro";

function editLoginStatus(newStatus, newUsername, newIcon, newJob){
    logStatus = newStatus;
    logUsername = newUsername;
    logIcon = newIcon;
    logUserJob = newJob;
}

function add(server){
    server.patch('/create-review', async (req, resp) => {
        const { condoId, title, content, rating, image, date } = req.body;
    
        // Find the user by username


        //const user = await userModel.findOne( {user: logUsername} );
        const user = await userModel.findOne( {user: "kyle"} );


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
    
        //resp.status(200).send({ success: true, message: 'Review published successfully', user: logUsername, job: logUserJob, icon: logIcon });
        resp.status(200).send({ success: true, message: 'Review published successfully', user: "kyle", job: "student", icon: "images/client-uploaded-files/man (1).png" });
    
    });

    
}

module.exports.add = add;
module.exports.editLoginStatus = editLoginStatus;