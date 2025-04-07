const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { body } = require('express-validator');
const postsController = require('../controllers/posts');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

const validatePost = [
  body('title')
    .trim()
    .isLength({ min: 1 }).withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Title cannot be more than 100 characters'),
  body('location')
    .trim()
    .isLength({ min: 1 }).withMessage('Location is required'),
  body('description')
    .trim()
    .isLength({ min: 1 }).withMessage('Description is required')
    .isLength({ max: 2000 }).withMessage('Description cannot be more than 2000 characters')
];

router.get('/', postsController.getAllPosts);
router.get('/new', postsController.createPostForm);
router.post('/', upload.single('image'), validatePost, postsController.createPost);
router.get('/:id', postsController.getPost);
router.get('/:id/edit', postsController.editPostForm);
router.post('/:id/edit', upload.single('image'), validatePost, postsController.updatePost);
router.post('/:id/delete', postsController.deletePost);

module.exports = router;
