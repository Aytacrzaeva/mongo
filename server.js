const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 8080;

// Middleware
app.use(bodyParser.json());

// Sample Data
const posts = [
  {
    id: "asc-a123-cxaz-123-acasdas",
    description: "lorem ipsum dolor",
    createdOn: "17.01.2023",
    user: {
      id: "ajn2-sa23m-cmkd2-csmc",
      name: "Suleyman",
      surname: "Dadashov",
      email: "suleyman@code.edu.az"
    }
  }
];

let isLoggedIn = false;

// Login Middleware
function requireLogin(req, res, next) {
  if (!isLoggedIn) {
    return res.sendStatus(401);
  }
  next();
}

// Routes
app.get('/api/users', (req, res) => {
  // This route does not require login
  // Return all users
  res.json(posts.map(post => post.user));
});

app.put('/api/users/:id', requireLogin, (req, res) => {
  const userId = req.params.id;
  const { name, surname, age } = req.body;

  // Find the user by ID
  const user = posts.find(post => post.user.id === userId);

  if (!user) {
    return res.sendStatus(204);
  }

  // Update the user's information
  if (name) user.user.name = name;
  if (surname) user.user.surname = surname;
  if (age) user.user.age = age;

  res.json(user);
});

app.delete('/api/users/:id', requireLogin, (req, res) => {
  const userId = req.params.id;

  // Find the user by ID
  const index = posts.findIndex(post => post.user.id === userId);

  if (index === -1) {
    return res.sendStatus(204);
  }

  // Remove the user from the array
  posts.splice(index, 1);

  res.sendStatus(200);
});

app.post('/api/register', (req, res) => {
  const { name, surname, age, email, password } = req.body;

  // Check if the email is already registered
  const existingUser = posts.find(post => post.user.email === email);

  if (existingUser) {
    return res.status(400).json({ error: 'Email is already registered' });
  }

  // Create a new user object
  const newUser = {
    id: generateUniqueId(),
    name,
    surname,
    age,
    email,
    password
  };

  // Add the new user to the array
  posts.push(newUser);

  res.json(newUser);
});


app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  // Find the user by email and password
  const user = posts.find(post => post.user.email === email && post.user.password === password);

  if (!user) {
    return res.sendStatus(401);
  }

  isLoggedIn = true;

  res.sendStatus(200);
});

app.post('/api/logout', requireLogin, (req, res) => {
  isLoggedIn = false;

  res.sendStatus(200);
});

app.get('/api/posts', (req, res) => {
  // This route does not require login
  // Return all posts
  res.json(posts);
});

app.post('/api/posts', requireLogin, (req, res) => {
  const { description, userId } = req.body;

  // Find the user by ID
  const user = posts.find(post => post.user.id === userId);

  if (!user) {
    return res.status(400).json({ error: 'User not found' });
  }

  // Create a new post object
  const newPost = {
    id: generateUniqueId(),
    description,
    createdOn: getCurrentDate(),
    user
  };

  // Add the new post to the array
  posts.push(newPost);

  res.json(newPost);
});

app.put('/api/posts/:id', requireLogin, (req, res) => {
  const postId = req.params.id;
  const { description } = req.body;

  // Find the post by ID
  const post = posts.find(post => post.id === postId);

  if (!post) {
    return res.sendStatus(204);
  }

  // Update the post's description
  if (description) post.description = description;

  res.json(post);
});

app.delete('/api/posts/:id', requireLogin, (req, res) => {
  const postId = req.params.id;

  // Find the post by ID
  const index = posts.findIndex(post => post.id === postId);

  if (index === -1) {
    return res.sendStatus(204);
  }

  // Remove the post from the array
  posts.splice(index, 1);

  res.sendStatus(200);
});

// Helper functions
function generateUniqueId() {
  // Generate a unique ID (you can use any method you prefer)
  return Math.random().toString(36).substr(2, 9);
}

function getCurrentDate() {
  // Get the current date in the desired format
  const date = new Date();
  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
