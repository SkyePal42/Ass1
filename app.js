#!/usr/bin/env node
// TODO https://adventofcode.com/2022/day/1
// Service on VPS: Twister
// How it was made: https://stackoverflow.com/questions/4018154/how-do-i-run-a-node-js-app-as-a-background-service

// Load Modules
const express = require('express');
const app = express();
const jsonfile = require('jsonfile');
const path = require('path');

// * Check if data file exists
const fs = require('fs');
const file = path.join(__dirname, 'data.json');

if (!fs.existsSync(file)) {
  fs.writeFile(
    file,
    '{"posts":[],"users":{},"images":["image-missing.png"],"pronouns":["Prefer Name","Any Pronoun","They/Them","She/Her","He/Him","She/They","He/They","They/She","They/He"]}',
    (err) => console.error(err)
  );
}

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

// Database Location

function createUser(username) {
  jsonfile.readFile(file, (err, data) => {
    if (err) console.error(err);

    if (!(username in data.users)) {
      data.users[username] = { image: 0, creation: Date.now(), pronoun: 0 };
      jsonfile.writeFile(file, data, function (err) {
        if (err) console.error(err);
      });
    }
  });
}

app.get('/api/post/get/all/:user', (req, res) => {
  createUser(req.params.user);

  const user = req.params.user;

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

app.get('/api/pronoun/get', (req, res) => {
  jsonfile.readFile(file, (err, data) => {
    if (err) console.error(err);
    res.json(data.pronouns);
  });
});

app.get('/api/pronoun/get/:id', (req, res) => {
  jsonfile.readFile(file, (err, data) => {
    if (err) console.error(err);
    res.json(data.pronouns[req.params.id]);
  });
});

app.get('/api/image/get/url/:id', (req, res) => {
  jsonfile.readFile(file, (err, data) => {
    if (err) console.error(err);
    if (req.params.id < data.images.length) {
      res.json(data.images[req.params.id]);
    } else {
      res.json(data.images[0]);
    }
  });
});

app.get('/api/image/get/all', (req, res) => {
  jsonfile.readFile(file, (err, data) => {
    if (err) console.error(err);
    res.json(data.images);
  });
});

app.get('/api/image/user/:username', (req, res) => {
  jsonfile.readFile(file, (err, data) => {
    if (err) console.error(err);
    res.json({
      index: data.users[req.params.username].image,
      source: data.images[data.users[req.params.username].image]
    });
  });
});

app.get('/api/user/get/:username', (req, res) => {
  jsonfile.readFile(file, (err, data) => {
    if (err) console.error(err);
    if (req.params.username in data.users) {
      let noPosts = 0;
      let noLikes = 0;
      let noLiked = 0;

      data.posts.forEach((post) => {
        if (post.user === req.params.username) {
          noPosts++;
          noLikes += post.likes.length;
          if (post.likes.includes(req.params.username)) noLiked--;
        } else if (post.likes.includes(req.params.username)) noLiked++;
      });

      res.json({
        static: data.users[req.params.username],
        dynamic: { posts: noPosts, likes: noLikes, liked: noLiked },
        status: 200
      });
    } else {
      res.json({
        static: { image: 0, creation: Date.now(), pronoun: 0 },
        dynamic: { posts: 'N/A', likes: 'N/A', liked: 'N/A' },
        status: 500
      });
    }
  });
});

app.post('/api/user/image/set', (req, res) => {
  jsonfile.readFile(file, (err, data) => {
    if (err) console.error(err);
    if (req.body.username in data.users) {
      let noPosts = 0;
      let noLikes = 0;
      let noLiked = 0;

      data.posts.forEach((post) => {
        if (post.user === req.body.username) {
          noPosts++;
          noLikes += post.likes.length;
          if (post.likes.includes(req.body.username)) noLiked--;
        } else if (post.likes.includes(req.body.username)) noLiked++;
      });

      if (data.images.length > req.body.image) {
        data.users[req.body.username].image = req.body.image;
      }

      jsonfile.writeFile(file, data, function (err) {
        if (err) console.error(err);

        res.json({
          static: data.users[req.body.username],
          dynamic: { posts: noPosts, likes: noLikes, liked: noLiked },
          status: 200
        });
      });
    } else {
      res.json({
        static: { image: 0, creation: Date.now(), pronoun: 0 },
        dynamic: { posts: 'N/A', likes: 'N/A', liked: 'N/A' },
        status: 500
      });
    }
  });
});

// Code Modified From: https://medium.com/geekculture/nodejs-image-upload-with-multer-e6cf08c1562f
const multer = require('multer');
const sharp = require('sharp');

const upload = multer({
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload a valid image file'));
    }
    cb(undefined, true);
  }
});

function checkImageNameConflict(originalname, extension, index) {
  if (
    fs.existsSync(
      path.join(
        __dirname,
        `/assets/user_images/${originalname}${
          index > 0 ? index : ''
        }${extension}`
      )
    )
  ) {
    return checkImageNameConflict(originalname, extension, index + 1);
  } else {
    return path.join(
      __dirname,
      `/assets/user_images/${originalname}${index > 0 ? index : ''}${extension}`
    );
  }
}

app.post('/api/upload/image', upload.single('image'), async (req, res) => {
  try {
    const filename = checkImageNameConflict(
      path.parse(req.file.originalname).name,
      path.parse(req.file.originalname).ext,
      0
    );
    await sharp(req.file.buffer)
      .resize({ width: 512, height: 512 })
      .png()
      .toFile(filename);
    jsonfile.readFile(file, (err, data) => {
      if (err) console.error(err);
      data.images.push(path.basename(filename));
      jsonfile.writeFile(file, data, function (err) {
        if (err) console.error(err);
        res.json({ status: 201, message: 'Image uploaded succesfully' });
      });
    });
  } catch (error) {
    console.log(error);
    res.json({ status: 400, message: error });
  }
});

// * Default path handling & Server Start

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '/client/404.html'));
});

module.exports = app;
