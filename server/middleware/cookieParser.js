const cookieParser = () => {
  return function parseCookies(req, res, next) {
    // Need to access cookies on an incoming request
    
    let cookies = req.headers.cookie;
    if (!cookies) {
      req.cookies = {};
      return next();
    }
    req.cookies = {};
    // Parse them into an object
    cookies.split(";").forEach(cookie => {
      let keyvaluePair = cookie.split("=");
      // Assign this object to a cookie property on the request
      req.cookies[keyvaluePair[0].trim()] = keyvaluePair[1];
    });
    return next();
  };
};

module.exports = cookieParser;

// const cookieParser = (req, res, next) => {
//   // return function parseCookies() {
//     // Need to access cookies on an incoming request
//     console.log('we are in cookie parser')
//     console.log('params', arguments)
//     if (!req) {
//       return next()
// ;    console.log(`no request`);
//     }
//     if (req.cookies) {
//       return next();
//     }
//     let cookies = req.headers.cookie;
//     // console.log('cookies', req.headers)
//     if (!cookies) {
//       req.cookies = {};
//       return next();
//     }
//     req.cookies = {};
//     // Parse them into an object
//     cookies.split(";").forEach(cookie => {
//       console.log('cookie', cookie)
//       let keyvaluePair = cookie.split("=");
//       // Assign this object to a cookie property on the request
//       req.cookies[keyvaluePair[0]] = keyvaluePair[1];
//       // console.log('req.cookies', req.cookies)
//     });
//     return next();
//   };
// // };