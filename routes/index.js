const AuthController = require('../controllers/AuthController');
const UserController = require('../controllers/UsersController');
const AppController = require('../controllers/AppController');
const upload = require('../middlewares/imageUpload');
const GroupController = require('../controllers/GroupsController');

const includeRoutes = (app) => {
  app.get('/signin', AuthController.signIn);
  app.get('/logout', AuthController.logOut);
  app.post('/signup', upload.single('image'), AuthController.signUp);
  app.get('/notifications', UserController.getNotifications);
  app.get('/users', UserController.showUsers);
  app.post('/api/v1/sendRequest', UserController.sendRequest);
  app.post('/api/v1/acceptFriend', UserController.acceptRequest);
  app.post('/api/v1/rejectFriend', UserController.rejectRequest);
  app.get('/', AppController.homePage);
  app.get('/api/v1/chat/:name', AppController.getChat);
  app.post('/api/v1/chat/:name/send', AppController.sendMessage);
  app.get('/profile/:name', UserController.getProfile);
  app.get('/image/:username', AppController.getImage);
  app.get('/about', AppController.LandingPage);

  // Group messages api
  app.get('/joingroup', GroupController.joinPage);
  app.post('/api/v1/joingroup', GroupController.joinGroup);

  app.get('/creategroup', GroupController.createPage);
  app.post('/api/v1/creategroup', GroupController.createGroup);

  app.get('/api/v1/groupChat/:groupId', GroupController.groupPage);
  app.post('/api/v1/groupchat/:groupId/send', GroupController.sendMessage);

  app.get('/groupinfo/:groupId', GroupController.getProfile);
};

module.exports = includeRoutes;
