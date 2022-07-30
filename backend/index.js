var express = require("express");
var mongoose = require("mongoose");
var bodyparser = require("body-parser");
var User = require("./models/User");
var db = "mongodb://localhost:27017/Users";
var bcrypt = require("bcrypt");
var saltRounds = 10;
var app = express();
const cors = require("cors");

var port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Database is connected");
  })
  .catch((err) => {
    console.log("Error is ", err.message);
  });

app.get("/", (req, res) => {
  res.status(200).send(`Hi Welcome to the Login and Signup API`);
});

app.post("/signup", async (req, res) => {
  var newUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });


  await User.findOne({ name: newUser.name, email: newUser.email })
    .then(async (profile) => {
      if (!profile) {
        bcrypt.hash(newUser.password, saltRounds, async (err, hash) => {
          if (err) {
            console.log("Error Occured 1", err.message);
          } else {
            newUser.password = hash;
            await newUser
              .save()
              .then(() => {
                res.status(200).json({
                  error: false,
                  message: "user signup successful",
                });
              })
              .catch((err) => {
                console.log("Error Occured 2", err.message);
              });
          }
        });
      } else {
        res.json({
          error: true,
          message: "User already exists...",
        });
      }
    })
    .catch((err) => {
      console.log("Error Occured 3", err.message);
      return res.json({
        error: true,
        message: err.message,
      });
    });
});

app.post("/login", async (req, res) => {
  var newUser = {};
  newUser.name = req.body.name;
  newUser.email = req.body.email;
  newUser.password = req.body.password;

  await User.findOne({ name: newUser.name, email: newUser.email })
    .then((profile) => {
      if (!profile) {
        res.json({ error: true, message: "User does not exist" });
      } else {
        bcrypt.compare(
          newUser.password,
          profile.password,
          async (err, result) => {
            if (err) {
              console.log("Error Occured", err.message);
            } else if (result == true) {
              res.json({
                error: false,
                message: "login successful",
              });
            } else {
              res.json({
                error: true,
                message: "invalid password",
              });
            }
          }
        );
      }
    })
    .catch((err) => {
      console.log("Error Occured ", err.message);
      res.json({
        error: true,
        message: "err.message",
      });
    });
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
