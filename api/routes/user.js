const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const env = require("../../env");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

router.get("/signup", (req, res, next) => {
  User.find()
    .select("")
    .exec()
    .then(result => {
      const response = {
        count: result.length,
        users: result.map(ele => {
          return {
            username: ele.username,
            password: ele.password
          };
        })
      };
      res.status(200).json(response);
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

router.post("/signup", (req, res, next) => {
  console.log("Signup route");

  User.findOne({ username: req.body.username })
    .then(result => {
      if (result) {
        return res.status(409).json({
          message: "Username exist"
        });
      } else {
        const user = new User({
          _id: new mongoose.Types.ObjectId(),
          username: req.body.username,
          password: req.body.password
        });
        return user.save();
      }
    })
    .then(result => {
      res.status(201).json({
        message: "Created succesfully",
        createdUser: {
          username: result.username,
          password: result.password,
          request: {
            type: "GET",
            url: "http://localhost:3000/products/" + result.password
          }
        }
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

router.post("/login", (req, res, next) => {
  console.log("Login route");

  User.findOne({ username: req.body.username, password: req.body.password })
    .then(result => {
      console.log(result);
      if (result) {
        const token = jwt.sign(
          {
            username: result.username,
            userId: result._id
          },
          env.SECRET_KEY,
          {
            expiresIn: "1h"
          }
        );
        res.status(200).json({
          message: "Login succesfully",
          token: token
        });
      } else {
        return res.status(401).json({
          message: "Authorization failed",
          isAuthorized: false
        });
      }
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

module.exports = router;
