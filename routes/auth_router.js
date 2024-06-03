const { Router } = require("express");
const bcrypt = require('bcrypt');
const UserDAO = require("../daos/user_dao");
const jwt = require('jsonwebtoken');

const router = Router();

// isAuthoirized middleware function
const isAuthorized = async (req, res, next) => {
  let token = req.headers.authorization;
  if(!token || token.indexOf('Bearer ') !== 0) {
    return res.status(401).send("Authorization is null!");
  } else {
    token = token.replace('Bearer ', '');
    const decodedToken = jwt.decode(token);
    if(!decodedToken) {
      res.status(401).send("Bad Token!");
    } else {
      req.decodedToken = decodedToken;
      next();
    }
  }
}

const isAdmin = async (req, res, next) => {
  const decodedToken = req.decodedToken;
  if(decodedToken.roles.includes('admin')) {
    next();
  } else {
    res.status(403).send("Forbidden: You are not authorized to access this resource!");
  }
}

// Signups POST /auth/signup
router.post("/signup", async(req, res, next) =>{
  const email = req.body.email;
  const password = req.body.password;
  let roles = req.body.roles;

  if(!req.body.roles) {
    roles = ["user"];
  }

  if(!email || !password) {
    res.status(400).send("Email or password not specified!");
  } else if(!password.length) {
    res.status(400).send("Password is empty!");
  } else {
    const encryptedPassword = await bcrypt.hash(password, 8);

    // Check if user already exists in the database
    const existingUser = await UserDAO.getUser(email);
    if(existingUser) {
      return res.status(409).send("User email already exist!");
    }

    const user = await UserDAO.createUser({email: email, password: encryptedPassword, roles: roles});
    if(!user) {
      res.status(400).send("User is null");
    } else {
      res.json(user);
    }
  }
});

// Login POST /auth/login
router.post("/login", async(req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  if(!email) {
    return res.status(401).send("Email must be specified");
  }
  if(!password) {
    return res.status(400).send("Password must be specified");
  }

  const user = await UserDAO.getUser(email);
  if(!user) {
    res.status(401).send("User does not exist!");
  } else {
    // Check if password match stored password
    // const encryptedPassword = await bcrypt.hash(password, 8);
    bcrypt.compare(password, user.password)
      .then(async (match) => {
        if(match) {
          // Password match so, generate a token
          const token = await UserDAO.makeJWTForUser(user._id, email, user.roles);

          res.json({token: token});
        } else {
          res.status(401).send("Password does not match stored password");
        }
      });
  }
});

// Change password PUT /auth/password
router.put("/password", isAuthorized, async(req, res, next) => {
  const decodedToken = req.decodedToken;
  const email = decodedToken.email;
  const password = req.body.password;

  if(!password) {
    return res.status(400).send("Password is null!");
  } else if(!password.length) {
    return res.status(400).send("Password is empty!");
  }

  // Get the user by email
  let user = await UserDAO.getUser(email);
  if(!user) {
    return res.status(401).send("User does not exist!");
  }

  user = await UserDAO.updateUserPassword(user._id, password);
  if(!user) {
    res.status(401).send("Failed to update password");    
  } else {
    res.json(user);
  }
})

router.post("/logout", (req, res, next) => {
  res.status(404).send("Resource does not exist!");
})

module.exports = {
  router,
  isAuthorized,
  isAdmin
};