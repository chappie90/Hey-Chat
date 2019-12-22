const express = require('express');
const mongoose = require('mongoose');
const User = mongoose.model('User');

const router = express.Router();

router.post('/contacts/search', async (req, res) => {
  const { search } = req.body;

  try {
    if (search) {
      const contacts = await User.find({ username: { $regex: search } }, { username: 1, _id: 0 }).limit(10);
      if (contacts.length == 0) {
        return res.send({ contacts: [] });
      }
      res.send({ contacts });
    }  
  } catch (err) {
    return res.status(422).send(err.message);
  }
});

router.post('/contacts/add', async (req, res) => {
  const { username, contact } = req.body;

  try {
    const newContact = await User.findOneAndUpdate(
      { username: username },
      { $addToSet: {
          contacts: {
            username: contact,
            chat: []
          }
        }
      },
      { new: true }
    );

    if (!newContact) {
      return  res.status(422).send({ error: 'Something went wrong with your request' });
    }

    res.send({ contact });
  } catch (err) {
    return res.status(422).send(err.message);
  }
});

router.post('/contacts', async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.findOne({ username }, { 'contacts.username': 1, _id: 0 });

    if (!user) {
      return res.status(422).send({ error: 'Something went wrong with your request' });
    }

    const contacts = user.contacts.map(c => c.username);

    res.send({ contacts });
  } catch (err) {
    return res.status(422).send(err.message);
  }

});

module.exports = router;