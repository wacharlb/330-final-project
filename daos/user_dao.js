const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = {};

// Store a user record
module.exports.createUser = async (userObj) => {
  try {
    const user = await User.create(userObj);
    return user;
  } catch {
    return null;
  }
}

// Get a user record using their email
module.exports.getUser = async (email) => {
  console.log("user_dao getUser, called");
  try {
    const user = await User.findOne({ email: email});
    console.log("user_dao getUser, user:", user);
    return user;
  } catch {
    return null;
  }
}

// Update the user's password field
module.exports.updateUserPassword = async (userId, password) => {
  // create a new encrypted password;
  const newEncryptedPassword = await bcrypt.hash(password, 8);

  try {
    const user = await User.findOneAndUpdate(
      { _id: userId }, 
      { password: newEncryptedPassword },
      { new: true }
    ).lean();
    return user;
  } catch {
    return null;
  }
}

// Generates and returns a token for a given user id
module.exports.makeJWTForUser = async (userId, email, roles) => {
  const secret = 'my super secret';
  const data = { _id: userId.toString(), email: email, roles: roles };
  let token = jwt.sign(data, secret)
  return token;
}