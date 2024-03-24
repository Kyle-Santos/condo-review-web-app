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
    server.patch('/create-review', async (req, resp) => {
        const { condoId, title, content, rating, image, date } = req.body;
    
        userFunctions.createReview(condoId, title, content, rating, image, date, req.session.username);
        resp.status(200).send({ success: true, message: 'Review published successfully', user: req.session.username, job: req.session.job, icon: req.session.picture });
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
}

module.exports.add = add;