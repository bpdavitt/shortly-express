const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
    // Need to access parsed cookies on the request
    // Look up user data related to that session
    // Assign an object to a session property on the request that contains relevant user info

    // Incoming session with no cookies should generate a new session with a unique hash
    // And store it in 'sessions' database
    // Should use this unique hash to set a cookie in the response headers
    // How do we set up cookie in Express? 
    // If incoming request has a cookie, should verify it's valid (ie is a session stored in our database)
    // If incoming cookie is not valid, then send err
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

