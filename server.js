const Socket = require('socket.io');
const express = require('express');
const nunjucks = require('nunjucks');
const passport = require('passport');
const session = require('express-session');
const { Issuer, Strategy } = require('openid-client');
require('dotenv').config();
const includeRoutes = require('./routes/index');
const dbClient = require('./utils/db');
const AuthController = require('./controllers/AuthController');

const app = express();
app.use(
  session({
    secret: 'my-secret',
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passport.initialize());
app.use(passport.session());
nunjucks.configure('views', {
  autoescape: true,
  express: app,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('static'));
includeRoutes(app);

app.get(
  '/loginAffinidi',
  (req, res, next) => {
    next();
  },
  passport.authenticate('affinidi-login', { scope: 'openid' }),
);
app.get(
  '/login/callback',
  (req, res, next) => {
    passport.authenticate('affinidi-login', { failureRedirect: '/signin' })(
      req,
      res,
      next,
    );
  },
  (req, res) => {
    const redirectUrl = req.token ? `/?x-token=${req.token}` : '/signin';
    res.redirect(redirectUrl);
  },
);

app.get(
  '/signupAffinidi',
  (req, res, next) => {
    next();
  },
  passport.authenticate('affinidi-signup', { scope: 'openid' }),
);

app.get(
  '/signup/callback',
  (req, res, next) => {
    passport.authenticate('affinidi-signup', { failureRedirect: '/signin' })(
      req,
      res,
      next,
    );
  },
  (req, res) => {
    const redirectUrl = req.token ? `/?x-token=${req.token}` : '/signin';
    res.redirect(redirectUrl);
  },
);
const server = app.listen(process.env.PORT || 8000, () => {
  console.log('Listening on port 8000');
});
Issuer.discover(process.env.issuer).then((oidcIssuer) => {
  // 5b. Create a RP-client which can initiate an OIDC flow
  const clientLogin = new oidcIssuer.Client({
    client_id: process.env.client_id,
    client_secret: process.env.client_secret,
    redirect_uris: ['https://cryptnex.tech/login/callback'],
    response_types: ['code'],
    token_endpoint_auth_method: 'client_secret_post',
  });

  const clientSignup = new oidcIssuer.Client({
    client_id: process.env.client_id,
    client_secret: process.env.client_secret,
    redirect_uris: ['https://cryptnex.tech/signup/callback'],
    response_types: ['code'],
    token_endpoint_auth_method: 'client_secret_post',
  });

  // 5c. Provide this strategy to the passport middleware
  passport.use(
    'affinidi-login',
    new Strategy(
      { client: clientLogin, passReqToCallback: true },
      async (req, tokenSet, userinfo, done) => {
        const token = await AuthController.signInAffinidi(userinfo.sub);
        req.token = token;
        return done(null, tokenSet.claims());
      },
    ),
  );

  passport.use(
    'affinidi-signup',
    new Strategy(
      { client: clientSignup, passReqToCallback: true },
      async (req, tokenSet, userinfo, done) => {
        const token = await AuthController.signUpAffinidi(userinfo.custom, req);
        req.token = token;
        return done(null, tokenSet.claims());
      },
    ),
  );
});

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

const io = Socket(server, {
  cors: {
    origin: 'https://cryptnex.tech',
    credentials: true,
    transports: ['websocket',
      'flashsocket',
      'htmlfile',
      'xhr-polling',
      'jsonp-polling',
      'polling'],
  },
});

function getKeyByValue(map, searchValue) {
  for (const [key, value] of map.entries()) {
    if (value === searchValue) {
      return key;
    }
  }
  return null; // Return null if the value is not found in the map
}

global.onlineUsers = new Map();
global.onlineUsersGroup = new Map();
io.on('connection', (socket) => {
  global.chatSocket = socket;
  socket.on('add-user', async (user) => {
    await dbClient.users
      .updateOne({ username: user }, { $set: { isActive: true } })
      .catch((err) => {
        console.log(err);
      });
    // eslint-disable-next-line no-undef
    onlineUsers.set(user, socket.id);
  });

  socket.on('add-user-group', async (user) => {
    // eslint-disable-next-line no-undef
    onlineUsersGroup.set(user, socket.id);
  });

  socket.on('send-msg', (data) => {
    const sendUserSocket = global.onlineUsers.get(data.to);
    if (sendUserSocket) {
      io.to(sendUserSocket).emit('msg-recieved', data);
    }
  });

  socket.on('send-group-msg', async (data) => {
    const { members } = await dbClient.groups.findOne({ _id: data.id });
    for (const member of members) {
      if (member === data.sender) {
        // eslint-disable-next-line no-continue
        continue;
      }
      const sendUserSocket = global.onlineUsersGroup.get(member);
      if (sendUserSocket) {
        io.to(sendUserSocket).emit('group-msg-recieved', data);
      }
    }
  });

  socket.on('disconnect', async () => {
    const user = getKeyByValue(global.onlineUsers, socket.id);
    if (user) {
      if (global.onlineUsers.has(user)) {
        global.onlineUsers.delete(user);
      }
      await dbClient.users.updateOne(
        { username: user },
        { $set: { isActive: false } },
      );
    }
  });
});
module.exports = { app, server };
