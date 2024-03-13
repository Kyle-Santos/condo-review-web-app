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

module.exports.findUser = findUser;