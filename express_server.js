const express = require("express");
const cookieSession = require("cookie-session");
// const cookieParser = require("cookie-parser");
const bodyParser = require("body-Parser");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const { emailExists, passwordMatching, fetchUser } = require("./helper");

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cookieParser());
app.use(cookieSession({ name: "session", keys: ["something1", "something2"] }));

const generateRandomString = function() {
  let rand = Math.random()
    .toString(36)
    .substring(7, 1);
  return rand;
};

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  user1: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  user2: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2b$10$hptgeIkx4UFLO4K/DZgElOo.b92f8EkhPBdYfu2y7vP4MEb0ZN8M2"
  }
};

app.get("/", (req, res) => {
  const email = req.session["email"];
  console.log("email", email);
  if (!users[email]) {
    return res.redirect("/login");
  }
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.get("/urls/new", (req, res) => {
  // const templateVars = { email: req.session["email"] };
  // res.render("urls_new", templateVars);

  const email = req.session["email"];
  let templateVars = { email: email };
  if (users[email]) {
    return res.render("urls_new", templateVars);
  }
  return res.redirect("/login");
});

app.get("/urls", (req, res) => {
  // const templateVars = { urls: urlDatabase, email: req.session["email"] };
  // res.render("urls_index", templateVars);

  const email = req.session["email"];
  let templateVars = { urls: urlDatabase, email: email };
  if (users[email]) {
    return res.render("urls_index", templateVars);
  } else {
    req.session["email"] = null;
    res.send("You need to register or login to access this page!");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    email: req.session["email"]
  };
  res.render("urls_show", templateVars);
});

//  app.post("/urls", (req, res) => {
//    console.log(req.body);  // Log the POST request body to the console
//    res.send("Ok");         // Respond with 'Ok' (we will replace this)
//  });

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  // const generatedUrl = generateRandomString();
  // urlDatabase[generatedUrl] = req.body.longURL;
  // res.redirect(`/urls/${generatedUrl}`);

  const generatedUrl = generateRandomString();
  const email = req.session["email"];
  if (!users[email]) {
    return res.send("You need to register or login to create new URL!");
  }
  urlDatabase[generatedUrl] = req.body.longURL;
  res.redirect(`/urls/${generatedUrl}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const idToDelete = req.params.shortURL;
  delete urlDatabase[idToDelete];
  res.redirect("/urls");
});

// app.get("/urls/:shortURL", (req, res) => {
//   const updateId = req.params.shortURL;
//   urlDatabase[updateId] = req.body.longURL;
//   res.redirect("/urls");

//   const shortURL = req.params.shortURL;
//   const email = req.session["email"];
//   if (!urlDatabase[shortURL]) {
//     return res.send("Short URL does not exist!");
//   }
//   if (users[email] && urlDatabase[shortURL].userID === userId) {
//     const longURL = urlDatabase[shortURL].longURL;
//     let templateVars = { shortURL, longURL, user: users[userId] };
//     return res.render("urls_show", templateVars);
//   }
//   const err = "Access denied!";
//   let templateVars = { err, user: users[userId] };
//   res.render("unauthorized", templateVars);
// });

app.post("/urls/:shortURL", (req, res) => {
  const newUrl = req.body.newURL;
  // console.log(newUrl);
  const id = req.params.shortURL;
  urlDatabase[id] = newUrl;
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  // const templateVars = { email: null };
  // res.render("url_login", templateVars);

  const email = req.session["email"];
  let templateVars = { email: null };
  if (users[email]) {
    return res.redirect("/urls");
  }
  res.render("url_login", templateVars);
});

app.post("/login", (req, res) => {
  // console.log(req.body);
  const incomingEmail = req.body.email;
  const incomingPassword = req.body.password;
  const user = fetchUser(users, incomingEmail);

  if (!user || !bcrypt.compareSync(incomingPassword, user.password)) {
    return res.send("Email or pasword not match!");
  }
  req.session["email"] = incomingEmail;
  return res.redirect("/urls");

  // if (user) {
  //   // if (incomingPassword === user.password){
  //   if (bcrypt.compareSync(incomingPassword, user.password)) {
  //     // res.session("email", incomingEmail);
  //     req.session["email"] = incomingEmail;

  //     return res.redirect("/urls");
  //   }
  //   return res.send("wrong password");
  // }
  // res.send("Email not found");
});

app.post("/logout", (req, res) => {
  // res.clearCookie("email");
  req.session["email"] = null;
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  // const templateVars = { email: null };
  // res.render("url_register", templateVars);

  const email = req.session["email"];
  let templateVars = { email: null };
  if (users[email]) {
    return res.redirect("/urls");
  }
  res.render("url_register", templateVars);
});

app.post("/register", (req, res) => {
  const incomingEmail = req.body.email;
  const incomingPassword = req.body.password;
  const incomingId = generateRandomString();
  const hashPass = bcrypt.hashSync(incomingPassword, saltRounds);
  console.log("password:", hashPass);
  if (incomingEmail === "" || incomingPassword === "") {
    return res.send("Email and pasword are required!");
  }

  if (emailExists(users, incomingEmail)) {
    res.send("email already exist!");
    // res.redirect("/register");
  } else {
    const newUser = {
      id: incomingId,
      email: incomingEmail,
      password: hashPass
    };
    users[incomingEmail] = newUser;
  }
  req.session["email"] = incomingEmail;
  res.redirect("/urls");
});
