const userModel = require('../models/User');
const userFunctions = require('../models/userFunctions');
const routeReview = require('../controllers/routeReview');

var logStatus = 0;
var logUsername = "";
var logIcon = "";
var logUserJob = "Condo Bro";


function add(server){

    server.get('/loggedInStatus', function(req, resp){
        resp.send({
            status: logStatus, 
            username: logUsername,
            picture: logIcon
        });
    });

    server.get('/', function(req,resp){
        resp.render('home',{
            layout: 'index',
            title: 'Home Page',
            isHome: true
        });
    });
    
    // create account POST
    server.post('/create-account', function(req, resp){
        const user = userModel({
        user: req.body.username,
        pass: req.body.password,
        picture: req.body.picture,
        email: "none",
        job: "Condo Bro",
        school: "not specified",
        city: "not specified,"
        });
        
        user.save().then(function(login) {
            console.log('Account created');
            resp.status(200).send({ success: true, message: 'Account created successfully' });
        }).catch(function(error) {
            // Check if the error indicates a duplicate key violation
            if (error.code === 11000 && error.name === 'MongoServerError') {
                // Handle duplicate key error
                resp.status(500).send({ success: false, message: 'Username already exists. Error creating account.' });
                console.error('Duplicate key error:', error.keyPattern);
            } else {
                console.error('Error creating account:', error);
                resp.status(500).send({ success: false, message: 'Error creating account' });
            }
        });
    });

    // Logout POST
    server.post('/logout', function(req, resp){
        logStatus = 0;
        logUsername = "";
        logIcon = "";
        logUserJob = "Condo Bro";

        routeReview.editLoginStatus(logStatus, logUsername, logIcon, logUserJob);

        resp.send({});
    });

    // Login POST 
    server.post('/login', async (req, res) => {
        const { username, password } = req.body;   

        let findStatus, findMessage;

       [findStatus, findMessage, logStatus, logUsername, logIcon, logUserJob] = await userFunctions.findUser(username, password);
        routeReview.editLoginStatus(logStatus, logUsername, logIcon, logUserJob);
        res.status(findStatus).json({message: findMessage, picture: logIcon});
    });


    // get profile GET
    server.get('/profile/:username', async (req, resp) => {
        const username = req.params.username; // Retrieve the username from the URL
        var processedReviews;

        try {
            // Query MongoDB to get data
            var data = await userModel.findOne({ user: username }).populate('reviews').lean();

            if (data.reviews) {
                // Preprocess date field
                processedReviews = data.reviews.map(review => {
                    // Create a new object to avoid mutating the original object
                    const processedReview = { ...review };

                    // Format date without time component
                    processedReview.date = review.date.toLocaleDateString(); // Assuming date is a JavaScript Date object
                    // Transform the integer rating into an array of boolean values representing filled stars
                    processedReview.rating = Array.from({ length: 5 }, (_, index) => index < review.rating);

                    return processedReview;
                });
            }

            resp.render('viewprofile', {
                layout: 'index',
                title: data.user,
                'data': data,
                'reviews': processedReviews.reverse(),
                isProfile: true
            });
        } catch (err) {
            // Handle errors
            console.error('Error fetching data from MongoDB', err);
            resp.status(500).json({ error: 'Failed to fetch data' });
        }
    });

    // get edit profile GET
    server.get('/edit-profile/', function(req, resp) {
        resp.render('editprofile',{
            layout: 'index',
            title: 'Edit Profile',
            isEditProfile: true
        });
    });

    server.patch('/edit-profile-submit', async (req, resp) => {
        const { name, email, bio, job, education, city, imagePath } = req.body;
    
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
                resp.json({ message: 'Profile updated successfully!' });
            })
            .catch(err => {
                // Handle error
                console.error("Error updating document:", err);
            });
            // Respond to the request
    });

}

module.exports.add = add;