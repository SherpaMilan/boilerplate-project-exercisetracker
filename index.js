const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(express.json()); 

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// Create first users container/array
let users = [];



// Create a New User
app.post('/api/users', (req, res) => {
  // Check if the username property exists in the request body
  if (!req.body || !req.body.username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const { username } = req.body;
  
  // Create a new user object with username and generated _id
  const newUser = {
    _id: generateUserId(), // Generate a unique user ID
    username: username,
    exercises: []
  };
  
  // Add the new user to the users array
  users.push(newUser);
  
  // Return the response object with username and _id properties
  res.json({
    username: newUser.username,
    _id: newUser._id
  });
  console.log(req.body);
});





// Get all Users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// Add Exercise


app.post('/api/users/:_id/exercises', function(req, res) {
  const _id = req.params._id;
  const description = req.body.description;
  const duration = Number(req.body.duration);
  const date = req.body.date ? new Date(req.body.date).toDateString() : new Date().toDateString();

  // Find the user with the given _id
  const userIndex = users.findIndex(user => user._id === _id);

  // Check if the user exists
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Add the exercise to the user's exercises array
  users[userIndex].exercises.push({
    description: description,
    duration: duration,
    date: date
  });

  // Return the updated user object with exercise fields added
  res.json({
    _id: users[userIndex]._id,
    username: users[userIndex].username,
    description: description,
    duration: duration,
    date: date
  });
});





// Get User's Exercise Log
app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;
  let user = users.find(user => user._id === _id);
  if (!user) {
    return res.json({ error: 'User not found' });
  }
  let logs = user.exercises;
  if (from) {
    logs = logs.filter(exercise => new Date(exercise.date) >= new Date(from));
  }
  if (to) {
    logs = logs.filter(exercise => new Date(exercise.date) <= new Date(to));
  }
  if (limit) {
    logs = logs.slice(0, limit);
  }

  // Convert duration strings to numbers
  logs.forEach(log => {
    log.duration = Number(log.duration); // Parse duration as number
  });

  // Format date property as string using toDateString() method
  const formattedLogs = logs.map(entry => ({
    description: entry.description,
    duration: entry.duration,
    date: new Date(entry.date).toDateString() // Format date as string
  }));

  // Respond with the formatted logs
  res.json({
    _id: user._id,
    username: user.username,
    count: formattedLogs.length,
    log: formattedLogs
  });
});






// Helper function to generate a unique user ID
function generateUserId() {
  return Math.random().toString(36).substring(2, 8);
}

const port = process.env.PORT || 3000;
const listener = app.listen(port, () => {

  console.log('Your app is listening on port ' + listener.address().port);
});
