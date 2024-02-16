/* eslint-disable max-len */

// Import necessary controllers and utilities
const AuthController = require('./AuthController'); // AuthController handles user authentication
const dbClient = require('../utils/db'); // dbClient is a database client utility
const UserController = require('./UsersController'); // UserController manages user data
// Import the required modules


// Define the AppController class
class AppController {
  // Controller for rendering the home page
  static async homePage(req, res) {
    try {
      // Check if a valid user is authenticated
      if (req.query['x-token'] && await AuthController.validateUser(req)) {
        // Get the user's ID
        const id = await AuthController.validateUser(req); // Returns the user's ID
        // Get user details
        const user = await UserController.getMe(id); // Returns user data
        // Render the chat.html page with user's friends and username
        res.status(200).render('chat.html', { friends: user.friends, user: user.username, groups: user.groups }); // Renders the chat.html page
      } else {
        // Redirect to the signin page if not authenticated
        res.status(401).redirect('/signin'); // Redirects to the signin page
      }
    } catch (error) {
      // Handle internal server errors
      console.error(error);
      res.status(500).send('Internal Server Error'); // Returns an internal server error message
    }
  }

  

  // Controller for getting chat messages
  static async getChat(req, res) {
    try {
      // Check if a valid user is authenticated
      if (req.query['x-token'] && await AuthController.validateUser(req)) {
        // Get user details
        const user = await UserController.getMe(await AuthController.validateUser(req)); // Returns user data
        // Get the username from request parameters
        const { name } = req.params; // Extracts the username from request parameters
        // Check if the other user is active
        const { isActive } = await dbClient.users.findOne({ username: name }); // Returns the active status of the other user
        // Get messages between users
        const { messages } = await dbClient.messages.findOne({ ownerId: user._id }); // Returns chat messages
        const msg = messages[name]; // Selects chat messages for the specific user
        // Send chat messages and user's active status
        res.status(200).send({ msg, isActive }); // Sends chat messages and active status
      } else {
        // Redirect to the signin page if not authenticated
        res.status(401).redirect('/signin'); // Redirects to the signin page
      }
    } catch (error) {
      // Handle internal server errors
      console.error(error);
      res.status(500).send('Internal Server Error'); // Returns an internal server error message
    }
  }

  // Controller for sending a chat message
  static async sendMessage(req, res) {
    try {
      // Check if a valid user is authenticated
      if (req.query['x-token'] && await AuthController.validateUser(req)) {
        // Get user details
        const user = await UserController.getMe(await AuthController.validateUser(req)); // Returns user data
        const userMessage = await dbClient.messages.findOne({ ownerId: user._id }); // Returns user's chat messages
        // Get the username from request parameters
        const { name } = req.params; // Extracts the username from request parameters
        // Get the message from the request body
        const { message } = req.body; // Extracts the chat message from the request body
        const date = new Date();
        const user2 = await dbClient.users.findOne({ username: name }); // Returns data for the other user
        const user2Message = await dbClient.messages.findOne({ ownerId: user2._id }); // Returns chat messages for the other user
        const data = {
          message,
          time: date.toDateString(),
          sent_by: user.username,
        };
        // Add the message to both users' message history
        userMessage.messages[name].push(data); // Adds the message to the sender's message history
        user2Message.messages[user.username].push(data); // Adds the message to the receiver's message history
        // Update the messages in the database
        await dbClient.messages.updateOne({ ownerId: user._id }, { $set: { messages: userMessage.messages } }); // Updates sender's messages
        await dbClient.messages.updateOne({ ownerId: user2._id }, { $set: { messages: user2Message.messages } }); // Updates receiver's messages
        await dbClient.users.updateOne(
          { _id: user._id },
          {
            $pull: { friends: user2.username },
          },
        );
        await dbClient.users.updateOne(
          { _id: user._id },
          {
            $push: { friends: { $each: [user2.username], $position: 0 } },
          },
        );
        await dbClient.users.updateOne(
          { _id: user2._id },
          {
            $pull: { friends: user.username },
          },
        );
        await dbClient.users.updateOne(
          { _id: user2._id },
          {
            $push: { friends: { $each: [user.username], $position: 0 } },
          },
        );
        // Send the newly sent message
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

  // Controller for getting user avatar image
  static async getImage(req, res) {
    const { username } = req.params;
    const user = await dbClient.users.findOne({ username });
    if (!user || !user.avatar) {
      res.status(403).send({ message: `${username} does not exist`, category: 'danger' });
      return
    }
    const imageBuffer = user.avatar?.buffer;

    // Set the appropriate content type for the response
    res.contentType('image/jpeg'); // Adjust as needed for different image formats

    // Send the image file as a response
    res.end(imageBuffer);
  }

  // Controller for rendering the landing page
  static LandingPage(req, res) {
    res.render('about.html'); // Renders the about.html page
  }
}

// Export the AppController class
module.exports = AppController;
