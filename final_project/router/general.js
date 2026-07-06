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

// Task 10: Get the book list available in the shop using Async/Await / Promises
public_users.get('/', async function (req, res) {
  try {
    const getBooksList = () => {
      return new Promise((resolve) => {
        resolve(books);
      });
    };

    const bookList = await getBooksList();
    return res.status(200).send(JSON.stringify(bookList, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books", error: error.message });
  }
});

// Task 11: Get book details based on ISBN using Async/Await / Promises
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  const getBookByISBN = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject({ status: 404, message: "Book not found with this ISBN" });
    }
  });

  getBookByISBN
    .then((book) => {
      return res.status(200).json(book);
    })
    .catch((err) => {
      return res.status(err.status || 500).json({ message: err.message });
    });
});
  
// Task 12: Get book details based on author using Async/Await / Promises
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author.toLowerCase();

  try {
    const getBooksByAuthor = () => {
      return new Promise((resolve, reject) => {
        const matchedBooks = [];
        Object.keys(books).forEach((key) => {
          if (books[key].author.toLowerCase() === author) {
            matchedBooks.push({ isbn: key, ...books[key] });
          }
        });

        if (matchedBooks.length > 0) {
          resolve(matchedBooks);
        } else {
          reject({ status: 404, message: "No books found by this author" });
        }
      });
    };

    const matched = await getBooksByAuthor();
    return res.status(200).json(matched);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
});

// Task 13: Get all books based on title using Async/Await / Promises
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase();

  const getBooksByTitle = new Promise((resolve, reject) => {
    const matchedBooks = [];
    Object.keys(books).forEach((key) => {
      if (books[key].title.toLowerCase() === title) {
        matchedBooks.push({ isbn: key, ...books[key] });
      }
    });

    if (matchedBooks.length > 0) {
      resolve(matchedBooks);
    } else {
      reject({ status: 404, message: "No books found with this title" });
    }
  });

  getBooksByTitle
    .then((matched) => {
      return res.status(200).json(matched);
    })
    .catch((err) => {
      return res.status(err.status || 500).json({ message: err.message });
    });
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