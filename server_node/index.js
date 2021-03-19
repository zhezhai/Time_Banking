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

//====================================== api =========================================

//register a user
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

// login post method for supervisor
app.post("/admin_login", (req, res) => {
  const name = req.body.name;
  const password = req.body.password;
  if (name == "admin") {
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
          res.send({ message: "supervisor is logged in", result: result });
        }
      }
    );
  } else {
    res.send({ message: "wrong name for administrator" });
  }
});

//user login
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
        res.send({
          message: "you are logged in",
          result: result,
        });
      } else {
        res.send({ message: "no matched user" });
      }
    }
  );
});

//get user login status
app.get("/login", (req, res) => {
  if (req.session.user) {
    res.send({ loggedIn: true, user: req.session.user });
  } else {
    console.log(req.session);
    res.send({ loggedIn: false });
  }
});

//log out a user
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.send("session destroyed");
});

//create the provider when provider posted a service
app.post("/createProvider", (req, res) => {
  const provider_service = req.body.provider_service;
  const provider_price = req.body.provider_price;
  if (req.session.user) {
    const provider_name = req.session.user[0].name;
    const provider_vid = req.session.user[0].address;
    db.query(
      "INSERT INTO provider (provider_name, provider_service, provider_price, provider_vid) VALUES (?,?,?,?)",
      [provider_name, provider_service, provider_price, provider_vid],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          console.log(result);
          res.send(result);
        }
      }
    );
  }
});

//alter the provider status for service display, 0 is not choosen, 1 is choosen
app.post("/alterProvider", (req, res) => {
  const provider_status = req.body.provider_status;
  const provider_id = req.body.provider_id;
  db.query(
    "UPDATE provider SET provider_status = ? WHERE id = ?",
    [provider_status, provider_id],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        if (result.length === 0) {
          res.send("provider not updated");
        } else {
          res.send({ message: "provider updated!", result: result });
        }
      }
    }
  );
});

//get the provider list
app.get("/showProviders", (req, res) => {
  db.query("SELECT * FROM provider", (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

//get a provider given the provider name
app.get("/getProvider", (req, res) => {
  db.query(
    "SELECT * FROM provider WHERE provider_name = ?",
    [req.query.name],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        if (result.length === 0) {
          res.send("provider does not exist");
        } else {
          res.send(result);
        }
      }
    }
  );
});

//create a recipient when user clicks on the service card on dashboard
app.post("/createRecipient", (req, res) => {
  const serviceid = req.body.recipient_serviceid;
  const provider_name = req.body.provider_name;
  const name = req.body.recipient_name;
  const service_info = req.body.recipient_serviceinfo;
  const price = req.body.recipient_price;
  const address = req.body.recipient_vid;
  db.query(
    "INSERT INTO recipient (service_id, provider_name, recipient_name, recipient_service, recipient_price, recipient_vid) VALUES (?,?,?,?,?,?)",
    [serviceid, provider_name, name, service_info, price, address],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  );
});

//show the recipient list
app.get("/showRecipients", (req, res) => {
  db.query("SELECT * FROM recipient", (err, result) => {
    if (err) {
      console.log(err);
    }
    if (result.length != 0) {
      res.send(result);
    } else {
      res.send("empty recipient list");
    }
  });
});

app.listen(3001, () => {
  console.log("success");
});
