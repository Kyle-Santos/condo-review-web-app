const condoModel = require('../models/Condo');
const reviewModel = require('../models/Review');
const userFunctions = require('../models/userFunctions');

function add(server){
  
    // get condo from the db GET
    server.get('/condo/:condoId', async (req, resp) => {
        const condoId = req.params.condoId; // Retrieve the condo ID from the URL
        const formattedCondoId = condoId.replace('-', ' ').toUpperCase(); // Format the condo ID

        try {
            // Query MongoDB to get data
            var data = await condoModel.findOne({ id: condoId }).lean();
            var processedReviews;

            // Find all reviews for the specified condo
            const reviews = await reviewModel.find({ condoId: condoId }).populate('author').lean();

            processedReviews = userFunctions.processReviews(reviews);

            resp.render('condo', {
                layout: 'index',
                title: formattedCondoId,
                'data': data,
                'reviews': processedReviews.reverse(),
                isCondo: true
            });
        } catch (err) {
            // Handle errors
            console.error('Error fetching data from MongoDB', err);
            resp.status(500).json({ error: 'Failed to fetch data' });
        }
    });    
}

module.exports.add = add;