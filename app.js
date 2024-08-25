// jshint esversion:6
const axios = require('axios');
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare...";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque...";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien...";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://shriharshranjangupta:NZVPxEcnTa2pXl0n@cluster0.azeu8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', 
  { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('Error connecting to MongoDB Atlas:', err));

// Creating Schema for the posts
const postSchema = new mongoose.Schema({
  _id: String, // Using the title as the ID
  title: String,
  content: String,
  date: { type: Date, default: Date.now }
});

// Creating a mongoose model based on this Schema
const Post = mongoose.model("Post", postSchema);

app.get("/", function(req, res) {
  Post.find({})
    .sort({ date: -1 }) // Sort by date in descending order (newest first)
    .then(posts => {
      res.render("home", {
        startingContent: homeStartingContent,
        posts: posts
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).send("Error fetching posts.");
    });
});


app.get("/about", function(req, res) {
  res.render("about", { aboutContent: aboutContent });
});

app.get("/contact", function(req, res) {
  res.render("contact", { contactContent: contactContent });
});

app.get("/compose", function(req, res) {
  res.render("compose");
});

// Save the title and the post into our blogDB database
app.post("/compose", function(req, res) {
  const title = req.body.postTitle;
  const slug = _.kebabCase(title); // Convert title to a URL-friendly slug

  if (!title) {
    return res.status(400).send("Title cannot be empty.");
  }

  const post = new Post({
    _id: slug, // Set slug as the ID
    title: title,
    content: req.body.postBody
  });

  post.save().then(() => {
    console.log('Post added to DB.');
    res.redirect('/');
  })
  .catch(err => {
    res.status(400).send("Unable to save post to database. Possible duplicate title.");
  });
});



const url = `https://sociallensblog.onrender.com/`;



const interval = 30000;

function reloadWebsite() {
  axios.get(url)
    .then(response => {
      console.log(`Reloaded at ${new Date().toISOString()}: Status Code ${response.status}`);
    })
    .catch(error => {
      console.error(`Error reloading at ${new Date().toISOString()}:`, error.message);
    });
}

setInterval(reloadWebsite, interval);

//




app.get("/posts/:postId", function(req, res) {
  const requestedPostId = req.params.postId;

  Post.findOne({ _id: requestedPostId })
    .then(function(post) {
      res.render("post", {
        title: post.title,
        content: post.content,
        date: post.date.toDateString()
      });
    })
    .catch(function(err) {
      console.log(err);
      res.status(404).send("Post not found.");
    });
});

app.get("/search", function(req, res) {
  const searchQuery = req.query.query;

  // Find posts where the title contains the search query (case-insensitive)
  Post.find({ title: new RegExp(searchQuery, 'i') })
    .then(posts => {
      if (posts.length > 0) {
        res.render("home", {
          startingContent: homeStartingContent,
          posts: posts,
          noResults: false
        });
      } else {
        res.render("home", {
          startingContent: homeStartingContent,
          posts: [],
          noResults: true
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).send("Error occurred while searching for posts.");
    });
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});




