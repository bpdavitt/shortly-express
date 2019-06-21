const parseCookies = () => {
  return function cookieParser(req, res, next) {
    // Need to access cookies on an incoming request
    if (req.cookies) {
      return next();
    }
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
      req.cookies[keyvaluePair[0]] = keyvaluePair[1];
    });
    return next();
  };
};

module.exports = parseCookies;
