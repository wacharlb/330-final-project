const { Router } = require("express");
const bcrypt = require('bcrypt');
const UserDAO = require("../daos/user_dao");
const jwt = require('jsonwebtoken');

const router = Router();

// isAuthoirized middleware function
const isAuthorized = async (req, res, next) => {
  console.log("auth_router, isAuthorizied, called");
  let token = req.headers.authorization;

  console.log("auth_router, isAuthorizied, token:", token);

  if(!token || token.indexOf('Bearer ') !== 0) {
    console.log("auth_router, isAuthorizied, token is null");

    return res.status(401).send("Authorization is null!");
  } else {
    token = token.replace('Bearer ', '');
    const decodedToken = jwt.decode(token);
    console.log("auth_router, isAuthorizied, decodedToken:", decodedToken);
    if(!decodedToken) {
      console.log("auth_router, isAuthorizied, token is null");
      res.status(401).send("Bad Token!");
    } else {
      req.decodedToken = decodedToken;
      next();
    }
  }
}

const isAdmin = async (req, res, next) => {
  console.log("auth_router, isAdmin, called");
  const decodedToken = req.decodedToken;

  if(decodedToken.roles.includes('admin')) {
    next();
  } else {
    console.log("auth_router, isAdmin, else 403");
    res.status(403).send("Forbidden: You are not authorized to access this resource!");
  }
}

// Signups POST /auth/signup
router.post("/signup", async(req, res, next) =>{
  console.log("auth_router post /signup, called");
  const email = req.body.email;
  const password = req.body.password;
  const roles = req.body.roles;

  if(!req.body.roles) {
    roles = ["user"];
  }

  console.log("auth_router post /signup, email:", email);
  console.log("auth_router post /signup, password:", password);

  if(!email || !password) {
    console.log("auth_router post /signup, email or passord are null");
    res.status(400).send("Email or password not specified!");
  } else if(!password.length) {
    console.log("auth_router post /signup, password is empty");
    res.status(400).send("Password is empty!");
  } else {
    const encryptedPassword = await bcrypt.hash(password, 8);
    console.log("auth_router post /signup, encryptedPassword:", encryptedPassword);

    // Check if user already exists in the database
    const existingUser = await UserDAO.getUser(email);
    console.log("auth_router post /signup, existingUser:", existingUser);
    if(existingUser) {
      return res.status(409).send("User email already exist!");
    }

    const user = await UserDAO.createUser({email: email, password: encryptedPassword, roles: roles});
    console.log("auth_router post /signup, user:", user);
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
  console.log("auth_router put /password, called");
  const decodedToken = req.decodedToken;
  const email = decodedToken.email;
  const password = req.body.password;

  console.log("auth_router put /password, decodedToken:", decodedToken);
  console.log("auth_router put /password, email:", email);
  console.log("auth_router put /password, password:", password);

  if(!password) {
    return res.status(400).send("Password is null!");
  } else if(!password.length) {
    return res.status(400).send("Password is empty!");
  }

  // Get the user by email
  let user = await UserDAO.getUser(email);
  console.log("auth_router put /password, user:", user);
  if(!user) {
    console.log("auth_router put /password, user is null:");
    return res.status(401).send("User does not exist!");
  }

  user = await UserDAO.updateUserPassword(user._id, password);
  console.log("auth_router put /password, updatedUserPassword, user, password:", user, password);
  if(!user) {
    console.log("auth_router put /password, user is crap:");
    res.status(401).send("Failed to update password");    
  } else {
    console.log("auth_router put /password, else user:", user);
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