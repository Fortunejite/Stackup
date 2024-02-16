const uuid4 = require('uuid').v4;
const AuthController = require('./AuthController');
const UserController = require('./UsersController');
const dbClient = require('../utils/db');

class GroupController {
  static async createGroup(req, res) {
    if (req.query['x-token'] && await AuthController.validateUser(req)) {
      const currentUser = await UserController.getMe(await AuthController.validateUser(req));
      if (!currentUser) {
        res.status(401).redirect('/signin');
      }
      const { name } = req.body;
      const { description } = req.body;
      const owner = currentUser.username;
      const groupId = uuid4();
      await dbClient.groups.insertOne({
        _id: groupId,
        name,
        description,
        owner,
        members: [owner],
      });
      await dbClient.groupMessages.insertOne({
        groupId,
        messages: [],
      });
      const update = { $set: {} };
      update.$set[`groups.${groupId}`] = name;
      await dbClient.users.updateOne({ username: owner }, update);
      res.status(201).send({ groupId });
    } else {
      res.status(401).redirect('/signin');
    }
  }

  static async joinGroup(req, res) {
    if (req.query['x-token'] && await AuthController.validateUser(req)) {
      const currentUser = await UserController.getMe(await AuthController.validateUser(req));
      if (!currentUser) {
        res.status(401).redirect('/signin');
      }
      const { groupId } = req.body;
      const group = await dbClient.groups.findOne({ _id: groupId });
      if (group) {
        if (currentUser.groups[groupId]) {
          res.status(200).send({ groupId });
        } else {
          await dbClient.groups.updateOne({ _id: groupId },
            { $push: { members: currentUser.username } });
          const date = new Date();
          const data = {
            message: `${currentUser.username} joined the group`,
            time: date.toDateString(),
            type: 'alert',
          };
          await dbClient.groupMessages.updateOne({ groupId },
            { $push: { messages: data } });
          const update = { $set: {} };
          update.$set[`groups.${groupId}`] = group.name;
          await dbClient.users.updateOne({ username: currentUser.username }, update);
          res.status(201).send({ groupId });
        }
      } else {
        res.status(403).send({ error: 'Group not found' });
      }
    } else {
      res.status(401).redirect('/signin');
    }
  }

  static async groupPage(req, res) {
    if (req.query['x-token'] && await AuthController.validateUser(req)) {
      const currentUser = await UserController.getMe(await AuthController.validateUser(req));
      if (!currentUser) {
        res.status(401).redirect('/signin');
      }
      const { groupId } = req.params;
      const group = await dbClient.groups.findOne({ _id: groupId });
      const { messages } = await dbClient.groupMessages.findOne({ groupId });
      res.status(200).render('group.html', {
        messages, user: currentUser.username, group: group.name, groupId,
      });
    } else {
      res.status(401).redirect('/signin');
    }
  }

  static async joinPage(req, res) {
    if (req.query['x-token'] && await AuthController.validateUser(req)) {
      const currentUser = await UserController.getMe(await AuthController.validateUser(req));
      if (!currentUser) {
        res.status(401).redirect('/signin');
      }
      res.status(200).render('join.html');
    } else {
      res.status(401).redirect('/signin');
    }
  }

  static async createPage(req, res) {
    if (req.query['x-token'] && await AuthController.validateUser(req)) {
      const currentUser = await UserController.getMe(await AuthController.validateUser(req));
      if (!currentUser) {
        res.status(401).redirect('/signin');
      }
      res.status(200).render('create.html');
    } else {
      res.status(401).redirect('/signin');
    }
  }

  static async getProfile(req, res) {
    if (req.query['x-token'] && await AuthController.validateUser(req)) {
      const currentUser = await UserController.getMe(await AuthController.validateUser(req));
      if (!currentUser) {
        res.status(401).redirect('/signin');
      }
      const { groupId } = req.params;
      const group = await dbClient.groups.findOne({ _id: groupId });
      res.status(200).render('groupinfo.html', { group });
    } else {
      res.status(401).redirect('/signin');
    }
  }

  static async sendMessage(req, res) {
    try {
      // Check if a valid user is authenticated
      if (req.query['x-token'] && await AuthController.validateUser(req)) {
        // Get user details
        const user = await UserController.getMe(await AuthController.validateUser(req));
        // Get the username from request parameters
        const { groupId } = req.params; // Extracts the username from request parameters
        // Get the message from the request body
        const { message } = req.body; // Extracts the chat message from the request body
        const date = new Date();
        const data = {
          message,
          time: date.toDateString(),
          sent_by: user.username,
        };
        // Add the message to database and send it back as response
        await dbClient.groupMessages.updateOne({ groupId },
          { $push: { messages: data } });
        data.id = groupId;
        res.status(201).send(data); // Sends the newly sent message
      } else {
        // Send an unauthorized error if not authenticated
        res.status(401).send({ error: 'Unauthorized' }); // Sends an unauthorized error
      }
    } catch (error) {
      // Handle internal server errors
      console.error(error);
      res.status(500).send('Internal Server Error'); // Returns an internal server error message
    }
  }
}

module.exports = GroupController;
