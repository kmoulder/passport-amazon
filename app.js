var express = require('express')
  , passport = require('passport')
  , util = require('util')
  , AmazonStrategy = require('passport-amazon').Strategy;

var AMAZON_CLIENT_ID = "amzn1.application-oa2-client.f335fec1893247589da32842554e802a"
var AMAZON_CLIENT_SECRET = "287b6dace6db12d81de4cdcc64d5ad53394c26ff107a5dba516c3ddd3017f42c";

var uri = "http://localhost:3000/auth/amazon/callback";
var encodedUri = encodeURI(uri);

var contacts = {};
var newContact = {};
var newAccount = {};

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Amazon profile is
//   serialized and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Use the AmazonStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Amazon
//   profile), and invoke a callback with a user object.
passport.use(new AmazonStrategy({
    clientID: AMAZON_CLIENT_ID,
    clientSecret: AMAZON_CLIENT_SECRET,
    callbackURL: encodedUri
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {

      // To keep the example simple, the user's Amazon profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Amazon account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));

var app = express.createServer();

// configure Express
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat' }));
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.get('/', function(req, res){
  res.render('index', { user: req.user, contacts: {} });
});

app.get('/account/:userId', function(req, res){
  var user = req.params.userId;
  if (contacts[user] != undefined){
    res.render('index', { user: req.user, contacts: contacts[user] });
  }
  else {
    res.render('index', { user: req.user, contacts: {} });
  }

});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

// GET /auth/amazon
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Amazon authentication will involve
//   redirecting the user to amazon.com.  After authorization, Amazon
//   will redirect the user back to this application at /auth/amazon/callback
app.get('/auth/amazon',
  passport.authenticate('amazon', { scope: ['profile', 'postal_code'] }),
  function(req, res){
    // The request will be redirected to Amazon for authentication, so this
    // function will not be called.
  });

// GET /auth/amazon/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/amazon/callback',
  passport.authenticate('amazon', { failureRedirect: '/login' }),
  function(req, res) {
    let raw = JSON.parse(req.user._raw);
    let user = raw.user_id.slice(14);
    res.redirect('/account/'+user);
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


// var contacts = {'john@main.com':[{'id':0, 'name':'John', 'number':'28290817'}]};

app.post('/add-contact', function(req, res) {
  let name = req.body.contactName;
  let number = req.body.contactNumber;
  let userId = req.body.userId;
  if (userId in contacts) {
    let subContacts = contacts[userId];
    let contactId = subContacts.length;
    console.log('the ID is '+ contactId);
    newContact = {id:contactId, name:name, number:number};
    subContacts.push(newContact);
  }
  else {
    newContact = [{id:'0', name:name, number:number}];
    contacts[userId] = newContact;
  }
  console.log(contacts);
  res.redirect('/account/'+userId);
});

// edit a contact
app.post('/edit-contact', function(req, res) {

  let contactId = req.body.contactId;
  let name = req.body.editContactName;
  let number = req.body.editContactNumber;
  let userId = req.body.userId;
  let subContacts = contacts[userId];
  let contact = subContacts[contactId];
  contact.name = name;
  contact.number = number;

  res.redirect('/account/'+userId);
});

// delete a contact
app.post('/delete-contact', function(req, res) {

    let deleteId = req.body.deleteId;
    let userId = req.body.userId;
    let subContacts = contacts[userId];
    console.log('the deleted object is '+ subContacts[deleteId])
    subContacts.splice(deleteId, 1);

    res.redirect('/account/'+userId);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, function () {
  console.log('Listening on port ' + PORT);
});


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/index')
}
