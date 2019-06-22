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
            console.log('we are trying to clear cookie')
            req.session = {};
            req.session.hash = sessionData.hash;
            req.session.sessionId = sessionData.id;
            res.clearCookie('shortlyid');
            res.cookie(`shortlyid`, `${sessionData.hash}`)
            console.log('test', res.cookies.shortlyId);
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



    // describe('Sessions and cookies'
    //   it('saves a new session when the server receives a request'

    //   it('sets and stores a cookie on the client'

    //   it('assigns session to a user when user logs in'

    //   it('destroys session and cookie when logs out', 

  };
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/
// module.exports.createSession = function() {
//   return function sessionCreater(req, res, next) {
// // Incoming session with no cookies should generate a new session with a unique hash
// // if no cookies
// console.log('cookie ***************',req.cookies)
// if (!req.cookies.shortlyid) {
// create session object on request
// req.session = {};
// // create new session
// return models.Sessions.create()
//   .then(insertionData => {
//     // console.log('insertionData', insertionData);
//     return models.Sessions.get({ id: insertionData.insertId });
//   })
//   .then(sessionData => {
//     // console.log('sessionData', sessionData);
//     // store in sessions database
//     // console.log('session data is: ',sessionData);
//     req.session.userId = sessionData.userId;
//     req.session.hash = sessionData.hash;
//     req.session.sessionId = sessionData.id;
//     res.cookie(`shortlyid`, `${sessionData.hash}`)
//     return models.Users.get({ id: sessionData.userId })
//   })
    //     .then (userInfo => {
    //       // console.log('*****************', req.session);
    //       // console.log('user info: ', userInfo);
    //       // req.session.user = userInfo.username;
    //       // set cookie in response headers

    //       return next();
    //     })
    //     .catch(err => {
    //       console.log(err);
    //       res.status(404);
    //       next();
    //     });
    // } else {
    //   // If incoming request has a cookie, should verify it's valid (ie is a session stored in our database)
    //   console.log('Incoming request has a cookie => about to fail a test')
    //   return models.Sessions.get({hash : req.session.hash})
    //   .then(sessionData => {
    //     next();
    //     })
    //   .catch(err => {
    //   console.log(err, 'your cookies are stale!');
    //   res.status(404);
    //   next();
    //   })
    // }

    // // Need to access parsed cookies on the request

    // // Look up user data related to that session
    // // Assign an object to a session property on the request that contains relevant user info

    // // And store it in 'sessions' database
    // // Should use this unique hash to set a cookie in the response headers

    // // If incoming cookie is not valid, then send err
//   };
// };