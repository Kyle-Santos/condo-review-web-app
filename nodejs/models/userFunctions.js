const userModel = require('../models/User');

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

module.exports.findUser = findUser;
module.exports.createAccount = createAccount;