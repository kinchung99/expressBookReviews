const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Task 6: Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if user already exists
  const userExists = users.some((user) => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // Register user
  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registered. Now you can login" });
});

// Task 1: Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Task 2: Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Book not found with this ISBN" });
  }
});
  
// Task 3: Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.toLowerCase();
  const matchedBooks = [];
  
  // Obtain keys and iterate through the book object entries
  Object.keys(books).forEach((key) => {
    if (books[key].author.toLowerCase() === author) {
      matchedBooks.push({ isbn: key, ...books[key] });
    }
  });

  if (matchedBooks.length > 0) {
    return res.status(200).json(matchedBooks);
  } else {
    return res.status(404).json({ message: "No books found by this author" });
  }
});

// Task 4: Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase();
  const matchedBooks = [];

  Object.keys(books).forEach((key) => {
    if (books[key].title.toLowerCase() === title) {
      matchedBooks.push({ isbn: key, ...books[key] });
    }
  });

  if (matchedBooks.length > 0) {
    return res.status(200).json(matchedBooks);
  } else {
    return res.status(404).json({ message: "No books found with this title" });
  }
});

// Task 5: Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "No reviews found for this ISBN" });
  }
});

module.exports.general = public_users;