const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const { json } = require("express");

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const app = express();
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: "timebanking",
    resave: false,
    saveUninitialized: true,
  })
);

const db = mysql.createConnection({
  user: "root",
  host: "localhost",
  password: "123456",
  database: "TimeBanking",
});

app.get("/user_list", (req, res) => {
  db.query("select * from user", (err, result) => {
    if (result.length == 0) {
      res.send("no user");
    } else {
      db.query(
        "select * from user where name = ?",
        [req.query.name],
        (err, result) => {
          res.send(result[0].name);
        }
      );
    }
  });
});

app.post("/register", (req, res) => {
  console.log(req.body);
  const name = req.body.name;
  const password = req.body.password;
  const address = req.body.address;

  db.query(
    "INSERT INTO user (name, password, address) VALUES (?,?,?)",
    [name, password, address],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  );
});

app.post("/login", (req, res) => {
  const name = req.body.name;
  const password = req.body.password;

  db.query(
    "SELECT * FROM user WHERE name = ? AND password = ?",
    [name, password],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      if (result.length != 0) {
        req.session.user = result;
        console.log(req.session.user);
        res.send({ message: "you are logged in", result: result });
      } else {
        res.send({ message: "no matched user" });
      }
    }
  );
});

app.get("/login", (req, res) => {
  if (req.session.user) {
    res.send({ loggedIn: true, user: req.session.user });
  } else {
    console.log(req.session);
    res.send({ loggedIn: false });
  }
});

app.get("/logout", (req, res) => {
  if (req.session.user) {
    req.session.destroy();
    res.send("session destroyed");
  } else {
    res.send("there is no session");
  }
});

app.listen(3001, () => {
  console.log("success");
});
