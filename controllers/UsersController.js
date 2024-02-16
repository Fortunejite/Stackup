/* eslint-disable max-len */
const { ObjectId } = require('mongodb');
const AuthController = require('./AuthController');
const dbClient = require('../utils/db');

class UserController {
  static async getMe(userId) {
    const user = await dbClient.users.findOne({ _id: ObjectId(userId) });
    return user;
  }

  static async showUsers(req, res) {
    if (req.query['x-token'] && await AuthController.validateUser(req)) {
      const currentUser = await UserController.getMe(await AuthController.validateUser(req));
      if (!currentUser) {
        res.status(401).redirect('/signin');
      }
      const users = await dbClient.users.find({}).toArray();
      // eslint-disable-next-line max-len
      const list = currentUser.friendRequest || currentUser.pendingRequests || currentUser.friends ? currentUser.friendRequest.concat(currentUser.pendingRequests.concat(currentUser.friends)) : null;
      res.status(200).render('friends.html', {
        users,
        user: currentUser.username,
        friends: currentUser.friends,
        requests: list,
      });
    } else {
      res.status(401).redirect('/signin');
    }
  }

  static async getNotifications(req, res) {
    if (req.query['x-token'] && await AuthController.validateUser(req)) {
      const currentUser = await UserController.getMe(await AuthController.validateUser(req));
      if (!currentUser) {
        res.status(401).redirect('/signin');
      }
      const { notifications } = currentUser;
      res.status(200).render('notifications.html', { notifications });
    } else {
      res.status(401).redirect('/signin');
    }
  }

  static async sendRequest(req, res) {
    const currentUser = await UserController.getMe(await AuthController.validateUser(req));
    if (!currentUser) {
      res.status(401).send({ error: 'Unauthorized' });
    }
    const date = new Date();
    const { friend } = req.body;
    const notif = {
      category: 'Request',
      id: currentUser._id.toString(),
      message: `${currentUser.username} sent you a friend request`,
      time: date.toDateString(),
    };
    await dbClient.users.updateOne({ username: currentUser.username }, { $push: { pendingRequests: friend } });
    await dbClient.users.updateOne({ username: friend }, { $push: { friendRequest: currentUser.username, notifications: notif } });
    res.status(200).send({ success: `Friend request successfully sent to ${friend}` });
  }

  static async addFriend(user, name) {
    // eslint-disable-next-line no-param-reassign
    const { messages } = await dbClient.messages.findOne({ ownerId: user._id });
    messages[name] = [];
    await dbClient.users.updateOne({ username: user.username }, { $push: { friends: name } });
    await dbClient.messages.updateOne({ ownerId: user._id }, { $set: { messages } });
  }

  static async acceptRequest(req, res) {
    const currentUser = await UserController.getMe(await AuthController.validateUser(req));
    if (!currentUser) {
      res.status(401).send({ error: 'Unauthorized' });
    }
    const { friend } = req.body;
    const notif = currentUser.notifications;
    const date = new Date();
    const newNotif = {
      category: 'Accept',
      message: `${currentUser.username} accepted your friend request`,
      time: date.toDateString(),
    };
    for (let i = 0; i < notif.length; i += 1) {
      if (notif[i].message === `${friend} sent you a friend request`) {
        notif.splice(i, 1);
        break;
      }
    }
    await UserController.addFriend(currentUser, friend);
    await UserController.addFriend(await dbClient.users.findOne({ username: friend }), currentUser.username);
    await dbClient.users.updateOne({ username: currentUser.username }, { $pull: { friendRequest: friend } });
    await dbClient.users.updateOne({ username: friend }, { $pull: { pendingRequests: currentUser.username } });
    await dbClient.users.updateOne({ username: friend }, { $push: { notifications: newNotif } });
    await dbClient.users.updateOne({ username: currentUser.username }, { $set: { notifications: notif } });
    res.status(200).send({ success: 'Friend request accepted' });
  }

  static async rejectRequest(req, res) {
    const currentUser = await UserController.getMe(await AuthController.validateUser(req));
    if (!currentUser) {
      res.status(401).send({ error: 'Unauthorized' });
    }
    const { friend } = req.body;
    const notif = currentUser.notifications;
    const date = new Date();
    const newNotif = {
      category: 'Reject',
      message: `${currentUser.username} rejected your friend request`,
      time: date.toDateString(),
    };
    for (let i = 0; i < notif.length; i += 1) {
      if (notif[i].message === `${friend} sent you a friend request`) {
        notif.splice(i, 1);
        break;
      }
    }
    await dbClient.users.updateOne({ username: currentUser.username }, { $pull: { friendRequest: friend } });
    await dbClient.users.updateOne({ username: currentUser.username }, { $set: { notifications: notif } });
    await dbClient.users.updateOne({ username: friend }, { $pull: { pendingRequests: currentUser.username } });
    await dbClient.users.updateOne({ username: friend }, { $push: { notifications: newNotif } });
    res.status(200).send({ success: 'Friend request rejected' });
  }

  static async getProfile(req, res) {
    if (req.query['x-token'] && await AuthController.validateUser(req)) {
      const currentUser = await UserController.getMe(await AuthController.validateUser(req));
      const { name } = req.params;
      const user = await dbClient.users.findOne({ username: name });
      res.status(200).render('profile.html', { current_user: currentUser, user });
    } else {
      res.status(401).redirect('/signin');
    }
  }
}

module.exports = UserController;
