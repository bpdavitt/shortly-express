const models = require("../models");
const Promise = require("bluebird");

module.exports.createSession = function () {
  return function sessionCreater(req, res, next) {
    // cookieParser is called first   
    // at the very least req.cookies will be an empty object
    // BASE CASE no cookies
    if (Object.keys(req.cookies).length === 0) {
      // need to initialize a new session when there are no cookies on the request
      // create session object on request
      req.session = {};
      // create new session
      return models.Sessions.create()
        .then(newSessionData => {
          return models.Sessions.get({ id: newSessionData.insertId });
        })
        .then(sessionData => {
          req.session.userId = sessionData.userId;
          req.session.hash = sessionData.hash;
          req.session.sessionId = sessionData.id;
          res.cookie(`shortlyid`, `${sessionData.hash}`)
          next();
        })
        .catch(err => {
          res.status(404);
          next();
        })
        // assigns a session object to the request if a session already exists
    } else if (req.cookies.shortlyid) {
      return models.Sessions.get({hash: req.cookies.shortlyid})
      .then(sessionData => {
        // clears and reassigns a new cookie if there is no session assigned to the cookie
        if (sessionData === undefined) {
          return models.Sessions.create()
          .then(newSessionData => {
            return models.Sessions.get({ id: newSessionData.insertId });
          })
          .then(sessionData => {
            req.session = {};
            req.session.hash = sessionData.hash;
            req.session.sessionId = sessionData.id;
            res.clearCookie('shortlyid');
            res.cookie(`shortlyid`, `${sessionData.hash}`)
            return next();
          })
          .catch(err => {
            res.status(404);
            return next();
          })
        }
        req.session = {};
        req.session.hash = sessionData.hash;
        req.session.sessionId = sessionData.id;
        // assigns a username and userId property to the session object if the session is assigned to a user
        if (sessionData.user) {
          req.session.userId = sessionData.userId;
          req.session.user = {username: sessionData.user.username};
        }
        next();
      })
      .catch(err => {
        res.status(404);
        console.log('error', err);
        next();
      })
    }

  };
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/
