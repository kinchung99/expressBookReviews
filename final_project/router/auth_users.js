const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    let userswithsamename = users.filter((user) => user.username === username);
    return userswithsamename.length > 0;
}

const authenticatedUser = (username, password) => {
    let validusers = users.filter((user) => user.username === username && user.password === password);
    return validusers.length > 0;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (authenticatedUser(username, password)) {

        let accessToken = jwt.sign({ data: username }, 'access', { expiresIn: 60 * 60 });

        req.session.authorization = { accessToken, username };
        
        return res.status(200).json({ message: "User successfully logged in" });
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});


// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const reviewText = req.query.review || req.body.review; 
    
    const username = req.user ? req.user.data : req.session.authorization['username'];

    if (!reviewText) {
        return res.status(400).json({ message: "Review content is required" });
    }

    if (books[isbn]) {
        if (!books[isbn].reviews) {
            books[isbn].reviews = {};
        }

        books[isbn].reviews[username] = reviewText;

        return res.status(200).json({ 
            message: `Review successfully added/updated for ISBN ${isbn} by user ${username}`,
            reviews: books[isbn].reviews 
        });
    } else {
        return res.status(404).json({ message: "Book not found with this ISBN" });
    }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    
    const username = req.user ? req.user.data : (req.session.authorization ? req.session.authorization['username'] : null);

    if (!username) {
        return res.status(403).json({ message: "User not logged in or authenticated" });
    }

    if (books[isbn]) {
        const book = books[isbn];

        if (book.reviews && book.reviews[username]) {
            delete book.reviews[username];

            return res.status(200).json({ 
                message: `Review for ISBN ${isbn} successfully deleted by user ${username}`,
                reviews: book.reviews 
            });
        } else {
            return res.status(404).json({ message: "You have not posted a review for this book" });
        }
    } else {
        return res.status(404).json({ message: "Book not found with this ISBN" });
    }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
