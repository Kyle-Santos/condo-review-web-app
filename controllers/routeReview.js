const reviewModel = require('../models/Review');
const likeModel = require('../models/Like');
const userFunctions = require('../models/userFunctions');

// saving uploaded image
const multer = require('multer');
const fs = require('fs');

// Define storage for uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/client-uploaded-files'); // Set destination folder
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Use original filename
    }
});

const upload = multer({ storage: storage }); // Store uploaded files in the 'uploads' directory

function add(server){
    server.post('/search-review', function(req, resp){
        var text = req.body.text;
        var condoId = req.body.condoId;
        var listOfReviews = new Array();

        var searchQuery = {condoId: condoId};

        reviewModel.find(searchQuery).populate('author comments.user').lean().then(async function(reviews){
            let content;
            let title;
            for(const item of reviews){
                content = item.content.toUpperCase();
                title = item.title.toUpperCase();

                if(content.includes(text) || title.includes(text)){
                    listOfReviews.push(item);
                }
            }

            reviews = await userFunctions.processReviews(listOfReviews, req.session._id);
            resp.send({reviews: reviews});
        });
    });

    server.patch('/create-review', async (req, resp) => {
        const { condoId, title, content, rating, image, date } = req.body;
    
        await userFunctions.createReview(condoId, title, content, rating, image, date, req.session.username);
        await userFunctions.updateAverageRating(condoId);
        resp.status(200).send({ success: true, message: 'Review published successfully', user: req.session.username, role: req.session.role, icon: req.session.picture });
    });

    // create comment POST
    server.post('/create-comment', async (req, resp) => {
        let createSuccess, createStatus, createMessage;

       [createSuccess, createStatus, createMessage] = await userFunctions.createComment(req.session._id, req.body.content, req.body.date, req.body.reviewId);

        resp.status(createStatus).send({ success: createSuccess, message: createMessage, user: req.session });
    });

    server.post('/upload-image', upload.single('image'), (req, res) => {
        // Get the temporary file path of the uploaded image
        const tempFilePath = req.file.path;
    
        if (fs.existsSync(tempFilePath)) {
            const destinationPath = path.join(__dirname, 'public', 'images', 'client-uploaded-files', req.file.originalname);
            // Move the uploaded file to the destination path
            fs.rename(tempFilePath, destinationPath, err => {
                if (err) {
                    console.error('Error:', err);
                    res.status(500).send('Error saving image');
                } else {
                    console.log('Image saved successfully');
                    res.status(200).send('Image uploaded successfully');
                }
            });
        } else {
            return res.status(400).send('Uploaded file not found');
        }
    });

    server.get('/edit-review/:id', async (req, resp) => {
        try {
            const reviewId = req.params.id;
            const review = await reviewModel.findOne({ _id: reviewId }).lean();
            resp.send({ review: review }); 
        } catch(error) {
            resp.status(500).send('Error fetching review');
        }
    });

    server.patch('/update-review/:id', async (req, resp) => {
        try {
            const reviewId = req.params.id;
            const result = await reviewModel.findByIdAndUpdate(reviewId, req.body);
            await userFunctions.updateAverageRating(result.condoId);
            resp.status(200).send({username: req.session.username});
        } catch(error) {
            resp.status(500).send('Error updating review');
        }
    });

    server.post('/delete-review', async (req, resp) => {
        try {
            const reviewId = req.body.id;
            await reviewModel.findByIdAndDelete(reviewId);
            resp.redirect('/viewprofile');
        } catch (error) {
            console.error("Error deleting review:", error);
            resp.status(500).send('Error deleting review');
        }
    });


    server.post('/like', async (req, resp) => {
        var { reviewId, isClicked, isLike } = req.body;
        const userId = req.session._id;

        try {
            // Find the review by ID
            const review = await reviewModel.findById(reviewId);

            isLike = (isLike === "true");

            if (isClicked === "true") {
                await likeModel.findOneAndDelete({ userId: userId, reviewId: reviewId })

                isLike ? review.likes-- : review.dislikes--;
            }
            else {
                const like = likeModel ({
                    reviewId: reviewId,
                    userId: userId,
                    isLike: isLike
                });

                await like.save();

                isLike ? review.likes++ : review.dislikes++;
            }

            // Save the updated review
            await review.save();
    
            resp.status(200).send({ success: true, totalLikes: review.likes - review.dislikes});

        } catch (error) {
            console.error("Error creating liking:", error);
            throw error; // Throw the error for handling elsewhere
        }
    });
}

module.exports.add = add;