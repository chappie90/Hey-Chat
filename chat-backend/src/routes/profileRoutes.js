const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path'); 
const axios = require('axios');

const User = mongoose.model('User');
const checkAuth = require('../middlewares/checkAuth');

let CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dycqqk3s6/upload';

const router = express.Router();

const MIME_TYPE_PROFILE = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_PROFILE[file.mimetype];
    let error = new Error('Invalid mime type');
    if (isValid) {
      error = null;
    }
    cb(error, './public/uploads/');
  },
  filename: (req, file, cb) => {
    const name = file.originalname;
    const ext = MIME_TYPE_PROFILE[file.mimetype];
    cb(null, name + '_' + Date.now() + '.' + ext);
  }
});

router.post(
  '/image/upload', 
  checkAuth, 
  multer({ storage: storage, limits: { fieldSize: 25 * 1024 * 1024 } }).single('profile'),
  async (req, res) => {
    const username = req.body.user;
    const url = req.protocol + '://' + req.get('host');
    const imgPath = url + '/public/uploads/' + req.file.filename;
    const base64 = req.body.base64;

    try {
  
      let cloudinaryData = {
        file: base64,
        upload_preset: 'ml_default'
      };     

      const response = await axios.post(CLOUDINARY_URL, cloudinaryData);

      if (response.status !== 200) {
        return res.status(422).send({ error: 'Could not save image' });
      }

      let urlParts = response.data.url.split('/');
      urlParts.splice(-2, 1);
      let url = urlParts.join('/');

      const user = await User.findOneAndUpdate(
        { username: username },
        { profile: {
          imgPath,
          imgName: req.file.filename,
          cloudinaryImgPath: url
        } },
        { new: true }
      );

      if (!user) {
        return res.status(422).send({ error: 'Could not save image' });
      } 

      let path = user.profile.cloudinaryImgPath; 
      let imageParts = path.split('/');
      imageParts.splice(-1, 0, 'w_400');
      path = imageParts.join('/');
      
      res.status(200).send({ img: path });
    } catch (err) {
      console.log(err);
      res.status(422).send({ error: 'Could not save image' });
    }
});

router.patch('/image/delete', checkAuth, async (req, res) => {
  const username = req.body.username;

  try {
    const user = await User.findOneAndUpdate(
      { username: username },
      { profile: {} },
      { new: true }
    );

    if (!user) {
      return res.status(422).send({ error: 'Could not delete image' });
    }

    res.status(200).send({ user });
  } catch (err) {
    console.log(err);
    res.status(422).send({ error: 'Could not delete image' });
  }
});

router.get('/image', checkAuth, async (req, res) => {
  const username = req.query.user;
  let modifiedPath;

  try {
    const user = await User.find({ username });

    if (!user) {
      return res.status(422).send({ error: 'Could not fetch image' }); 
    }


    let origPath = user[0].profile.cloudinaryImgPath;
    if (origPath) {
      let imageParts = origPath.split('/');
      // If you want to center on face
      // imageParts.splice(-1, 0, 'w_500,h_500,c_crop,g_face,r_max/w_400');
      imageParts.splice(-1, 0, 'w_400');
      modifiedPath = imageParts.join('/');
    } else {
      modifiedPath = origPath;
    }
    
    res.status(200).send({ image: modifiedPath });
  } catch (err) {
    console.log(err);
    res.status(422).send({ error: 'Could not fetch image' });
  }
});

module.exports = router;