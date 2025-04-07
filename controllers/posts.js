const Post = require('../models/post');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');


exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.render('posts/index', { title: 'All Posts', posts });
  } catch (error) {
    res.status(500).render('error', { 
      message: 'Error fetching posts',
      error: req.app.get('env') === 'development' ? error : {}
    });
  }
};


exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).render('error', { message: 'Post not found' });
    }
    res.render('posts/show', { title: post.title, post });
  } catch (error) {
    res.status(500).render('error', { 
      message: 'Error fetching post',
      error: req.app.get('env') === 'development' ? error : {}
    });
  }
};


exports.createPostForm = (req, res) => {
  res.render('posts/create', { title: 'Create New Post' });
};


exports.createPost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    return res.status(400).render('posts/create', {
      title: 'Create New Post',
      errors: errors.array(),
      post: req.body
    });
  }

  try {
    const post = new Post({
      title: req.body.title,
      location: req.body.location,
      description: req.body.description,
      image: req.file ? `/uploads/${req.file.filename}` : null
    });

    await post.save();
    res.redirect('/posts/' + post._id);
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    res.status(500).render('error', {
      message: 'Error creating post',
      error: req.app.get('env') === 'development' ? error : {}
    });
  }
};


exports.editPostForm = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).render('error', { message: 'Post not found' });
    }
    res.render('posts/edit', { title: 'Edit Post', post });
  } catch (error) {
    res.status(500).render('error', {
      message: 'Error fetching post',
      error: req.app.get('env') === 'development' ? error : {}
    });
  }
};


exports.updatePost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    return res.status(400).render('posts/edit', {
      title: 'Edit Post',
      errors: errors.array(),
      post: { ...req.body, _id: req.params.id }
    });
  }

  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).render('error', { message: 'Post not found' });
    }

    if (req.file && post.image) {
      const oldImagePath = path.join(__dirname, '../public', post.image);
      fs.unlink(oldImagePath, (err) => {
        if (err && err.code !== 'ENOENT') console.error('Error deleting old image:', err);
      });
    }

    post.title = req.body.title;
    post.location = req.body.location;
    post.description = req.body.description;
    if (req.file) {
      post.image = `/uploads/${req.file.filename}`;
    }

    await post.save();
    res.redirect('/posts/' + post._id);
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    res.status(500).render('error', {
      message: 'Error updating post',
      error: req.app.get('env') === 'development' ? error : {}
    });
  }
};


exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).render('error', { message: 'Post not found' });
    }

    if (post.image) {
      const imagePath = path.join(__dirname, '../public', post.image);
      fs.unlink(imagePath, (err) => {
        if (err && err.code !== 'ENOENT') console.error('Error deleting image:', err);
      });
    }

    await post.deleteOne();
    res.redirect('/posts');
  } catch (error) {
    res.status(500).render('error', {
      message: 'Error deleting post',
      error: req.app.get('env') === 'development' ? error : {}
    });
  }
};
