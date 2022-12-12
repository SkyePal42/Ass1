#!/usr/bin/env node
// TODO https://adventofcode.com/2022/day/1
// Service on VPS: Twister
// How it was made: https://stackoverflow.com/questions/4018154/how-do-i-run-a-node-js-app-as-a-background-service

const express = require('express');
const app = express();
const jsonfile = require('jsonfile');
const path = require('path');

const port = 3000;
app.use(express.json());
app.use(express.static(path.join(__dirname, '/assets')));
app.use(express.static(path.join(__dirname, '/client')));
app.use(
  express.static(
    path.join(__dirname, '/node_modules/@fortawesome/fontawesome-free')
  )
);

app.get(['/', '/index', '/home'], (req, res) => {
  res.sendFile(path.join(__dirname, '/client/index.html'));
});

app.get('/api/post/get/all/:user', (req, res) => {
  const user = req.params.user;

  const file = path.join(__dirname, '/data.json');
  jsonfile.readFile(file, (err, data) => {
    if (err) console.error(err);

    const posts = [];
    data.posts.forEach((post, index) => {
      posts.push({
        id: index,
        title: post.title,
        content: post.content,
        user: post.user,
        creationDate: post.creationDate,
        lastEdit: post.lastEdit,
        likes: post.likes.length,
        liked: post.likes.includes(user),
        comments: post.comments.length
      });
    });

    res.json(posts);
  });
});

function removeItemOnce(arr, value) {
  const index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

app.post('/api/post/like', (req, res) => {
  const file = path.join(__dirname, '/data.json');
  jsonfile.readFile(file, (err, data) => {
    if (err) console.error(err);
    if (req.body.post < data.posts.length) {
      if ('user' in req.body && req.body.user) {
        const post = data.posts[req.body.post];
        if (post.likes.includes(req.body.user)) {
          post.likes = removeItemOnce(post.likes, req.body.user);
        } else {
          post.likes.push(req.body.user);
        }
        res.json({
          status: 200,
          liked: post.likes.includes(req.body.user),
          likes: post.likes.length
        });
        data.posts[req.body.post] = post;
        jsonfile.writeFile(file, data, function (err) {
          if (err) console.error(err);
        });
      } else {
        res.json({ status: 400, message: 'Invalid Username' });
      }
    } else {
      res.json({ status: 404, message: 'Array OutOfBounds' });
    }
  });
});

app.post('/api/post/add', (req, res) => {
  const file = path.join(__dirname, '/data.json');
  jsonfile.readFile(file, (err, data) => {
    if (err) console.error(err);
    data.posts.push({
      title: req.body.title,
      content: req.body.content,
      user: req.body.user,
      creationDate: Date.now(),
      lastEdit: Date.now(),
      likes: [],
      comments: []
    });
    jsonfile.writeFile(file, data, function (err) {
      if (err) console.error(err);
    });
  });

  res.sendStatus(200);
});

app.post('/api/post/comment/add', (req, res) => {
  const file = path.join(__dirname, 'data.json');
  jsonfile.readFile(file, (err, data) => {
    if (err) console.error(err);
    data.posts[req.body.post].comments.push({
      comment: req.body.comment,
      user: req.body.user,
      creationDate: Date.now()
    });
    jsonfile.writeFile(file, data, function (err) {
      if (err) console.error(err);
    });
  });

  res.sendStatus(200);
});

app.get('/api/post/comment/get/:post', (req, res) => {
  const file = path.join(__dirname, '/data.json');
  jsonfile.readFile(file, (err, data) => {
    if (err) console.error(err);
    if (req.params.post < data.posts.length) {
      res.json({ status: 200, comments: data.posts[req.params.post].comments });
    } else {
      res.json({ status: 400 });
    }
    // case handling for if not a valid post
  });
});

app.get('/list', function (req, resp) {
  resp.json({
    data: 'hello',
    second_data: 'hello2'
  });
});

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '/client/404.html'));
});

app.listen(port, () => {
  console.log(`ASS1 running on port ${port}`);
});
