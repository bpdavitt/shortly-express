const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const bodyParser = require('body-parser');
const Auth = require('./middleware/auth');
const models = require('./models');
const cookieParser = require('./middleware/cookieParser');

const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(cookieParser());
app.use(Auth.createSession());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', 
(req, res) => {
  res.render('index');
});

app.get('/create', 
(req, res) => {
  res.render('index');
});

app.get('/links', 
(req, res, next) => {
  models.Links.getAll()
    .then(links => {
      res.status(200).send(links);
    })
    .error(error => {
      res.status(500).send(error);
    });
});

app.post('/links', 
(req, res, next) => {
  var url = req.body.url;
  if (!models.Links.isValidUrl(url)) {
    // send back a 404 if link is not valid
    return res.sendStatus(404);
  }

  return models.Links.get({ url })
    .then(link => {
      if (link) {
        throw link;
      }
      return models.Links.getUrlTitle(url);
    })
    .then(title => {
      return models.Links.create({
        url: url,
        title: title,
        baseUrl: req.headers.origin
      });
    })
    .then(results => {
      return models.Links.get({ id: results.insertId });
    })
    .then(link => {
      throw link;
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(link => {
      res.status(200).send(link);
    });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/
//Process POST request to register for new account at /signup
app.post('/signup', (req, res, next) => {
  // console.log('test', req.body);
  console.log(req.body);
  return models.Users.create(req.body)
  .then((results) => {
    // console.log('results', results);
    console.log('current hash: ', req.session.hash);
    console.log('userId: ', results.insertId);
    //update session
   return models.Sessions.update({hash: req.session.hash}, {userId: results.insertId})
  // return models.Sessions.update({}, {})
  })
  .then(() => {
    res.status(201).location('/').send('New user created')
  })
  .catch((err) => {
    console.log('Error somewhere; likely on updating sessions');
    res.status(401).location('/signup').send();
  });
});

//Process POST request to login at /login
app.post('/login', (req, res, next) => {
  //route to new models.Users method
  return models.Users.accessUser(req.body.username)
    .then((userData) => {
      //Should be given a user, see if they exist, pull their salt and hashed pw
      return models.Users.compare(req.body.password, userData.password, userData.salt);
    })
    .then((results) => {
      // at this point results should be true/false of compare
      // depending on true/false we will need to do something later
      if (!results) {
        res.status(401).location('/login').send();
      }
      return models.Sessions.update({hash: req.session.hash}, {userId: userData.insertId})
    })
    .then(() => {
      res.status(201).location('/').send(results);
    })
    .catch((err) => {
      res.status(401).location('/login').send();
    });

  //then models.Users.compare(attempted, pw, salt)
  //then auth cookies or 401 status
  
});


/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
