require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://saodat:saodat11@cluster0.bn3rkf5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


const postsRouter = require('./routes/posts');
app.use('/posts', postsRouter);


app.get('/', async (req, res) => {
  const Post = require('./models/post');
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).limit(6);
    res.render('index', { title: 'Travel Journal', posts });
  } catch (error) {
    res.render('index', { title: 'Travel Journal', posts: [] });
  }
});


app.use((err, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (unlinkError) => {
      if (unlinkError) console.error('Error deleting file:', unlinkError);
    });
  }

  console.error(err);
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
