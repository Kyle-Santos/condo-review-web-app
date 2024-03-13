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
    server.post('/create-account', async (req, resp) => {
        let createSuccess, createStatus, createMessage;

       [createSuccess, createStatus, createMessage] = await userFunctions.createAccount(req.body.username, req.body.password, req.body.picture);

        resp.status(createStatus).send({success: createSuccess, message: createMessage});
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
        const newData = userFunctions.filterEditData(req.body);

        // Use updateOne to update specific fields of the user document
        userModel.updateOne({ "user": logUsername }, { $set: newData })
            .then(result => {
                // Handle successful update
                console.log("Update successful:", result);

                if (newData.name !== undefined) logUsername = newData.name;
                if (newData.picture !== undefined) logIcon = newData.picture.replace('public/', '');
                if (newData.job !== undefined) logUserJob = newData.job;

                resp.json({message: 'Profile updated successfully!'});
            })
            .catch(err => {
                // Handle error
                console.error("Error updating document:", err);
                return false;
            });

    });

}

module.exports.add = add;