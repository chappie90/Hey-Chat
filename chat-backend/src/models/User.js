const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    dropDups: true
  },
  password: {
    type: String,
    required: true
  },
  expoToken: String,
  badgeCount: { type: Number, default: 0 },
  contacts: [
     { 
       user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
       previousChat: { type: Boolean, default: false }
     }
  ],
  profile: {
    imgPath: String,
    imgName: String
  },
  privateChats: [
    {
      privateChat: { type: mongoose.Schema.Types.ObjectId, ref: 'PrivateChat' },
      pinned: { type: Boolean, default: false }
    }
  ],
  groups: [
    {
      group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
      pinned: { type: Boolean, default: false }
    }
  ],
  youtube: {
    lastVideoId: String,
    lastVideoCurrentTime: String
  }
});

userSchema.pre('save', function(next) {
  const user = this;
  if (!user.isModified('password')) {
    return next();
  }

  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }

    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function(candidatePassword) {
  const user = this;

  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, user.password, (err, isMatch) => {
      if (err) {
        return reject(err);
      }

      if (!isMatch) {
        return reject(false);
      }

      resolve(true);
    });
  });
};

mongoose.model('User', userSchema);