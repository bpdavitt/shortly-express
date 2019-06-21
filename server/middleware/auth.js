const models = require("../models");
const Promise = require("bluebird");

module.exports.createSession = function() {
  return function sessionCreater(req, res, next) {
    // Incoming session with no cookies should generate a new session with a unique hash
    // if no cookies
    if (!req.session) {
      // create session object on request
      req.session = {};
      // create new session
      return models.Sessions.create()
        .then(insertionData => {
          console.log('insertionData', insertionData);
          return models.Sessions.get({ id: insertionData.insertId });
        })
        .then(sessionData => {
          console.log('sessionData', sessionData);
          // store in sessions database
          req.session.userId = sessionData.userId;
          req.session.hash = sessionData.hash;
          // req.session.username =
          req.session.sessionId = sessionData.id;
          // set cookie in response headers
          res.cookie(`session`, `${sessionData.hash}`).send();
        })
        .catch(err => {
          console.log(err);
          res.status(404).send();
        });
    }

    // Need to access parsed cookies on the request
    let parsedCookies = req.cookies;

    // Look up user data related to that session
    // Assign an object to a session property on the request that contains relevant user info

    // And store it in 'sessions' database
    // Should use this unique hash to set a cookie in the response headers
    // How do we set up cookie in Express?
    // If incoming request has a cookie, should verify it's valid (ie is a session stored in our database)
    // If incoming cookie is not valid, then send err
  };
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/
