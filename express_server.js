const express = require("express");
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const { getUserByEmail, urlsForUser, generateRandomString } = require("./helper");

const app = express();
const PORT = 8080; 

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({ name: "session", keys: ["something1", "something2"] }));



const urlDatabase = {};

const users = {};


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get('/', (req, res) => {
  const userId = req.session['user_id'];
  if (!users[userId]) {
    return res.redirect('/login');
  }
  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  const userId = req.session['user_id'];
  let newUrlDatabase = urlsForUser(userId, urlDatabase);
  let templateVars = {
    urls: newUrlDatabase,
    user: users[userId]
  };
  if (users[userId]) {
    return res.render("urls_index", templateVars);
  } else {
    return res.redirect("/login");
  }
});

//Only logged in users can visit the page to create new URL
app.get("/urls/new", (req, res) => {
  const userId = req.session['user_id'];
  let templateVars = {
    user: users[userId]
  };
  if (users[userId]) {
    return res.render("urls_new", templateVars);
  }
  return res.redirect('/login');
});


app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userId = req.session['user_id'];
  if (!urlDatabase[shortURL]) {
    return res.send("Short URL does not exist!")
  }
  if (users[userId] && urlDatabase[shortURL].userID === userId) {
    const longURL = urlDatabase[shortURL].longURL;
    let templateVars = {
      shortURL,
      longURL,
      user: users[userId]
    };
    return res.render("urls_show", templateVars);
  }
  const err = "Access denied!";
  return res.send("Access denied!")
});


app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userId = req.session['user_id'];
  if (!urlDatabase[shortURL]) {
    return res.send("URL does not exist!")
  }
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});


//Create new URL
app.post("/urls", (req, res) => {
  const generatedUrl = generateRandomString();
  const userId = req.session['user_id'];
  if (!users[userId]) {
    return res.send("You need to register or login to create new URL!");
  }
  urlDatabase[generatedUrl] = {
    longURL: req.body.longURL,
    userID: userId
  };
  res.redirect(`/urls/${generatedUrl}`);
});



//Edit URL
app.post('/urls/:shortURL', (req, res)=>{
  const shortURL = req.params.shortURL;
  const userId = req.session['user_id'];
  if (!users[userId]) {
    return res.send("You need to register or login to edit URL!")
  }
  if (urlDatabase[shortURL].userID !== userId) {
    const err = "You can not edit others URL!";
    return res.send("You can not edit others URL!")
  }
  for (let url in urlDatabase) {
    if (url === shortURL) {
      urlDatabase[shortURL].longURL = req.body.newURL;
    }
  }
  res.redirect('/urls');
});


app.post('/urls/:shortURL/delete', (req, res)=>{
  const userId = req.session['user_id'];
  const shortURL = req.params.shortURL;
  if (!users[userId]) {
    return res.send("You need to register or login to delete URL!")
  }
  if (urlDatabase[shortURL].userID !== userId) {
    return res.send("You can not delete others URL!")
  }
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  const userId = req.session['user_id'];
  let templateVars = {
    user: users[userId]
  };
  if (users[userId]) {
    return res.redirect('/urls');
  }
  res.render("urls_login", templateVars);
});


app.post('/login', (req, res) => {
  const { email, password } = req.body;
  let templateVars = {
    user: null
  };
  if (email === '' || password === '') {
    const err = "Email and pasword are required!";
    return res.send(err)
  }
  const userId = getUserByEmail(email, users);
  const user = users[userId];
  if (!userId || !bcrypt.compareSync(password, user.password)) {
    const err = "Email or pasword not match!";
    return res.send(err)
  }
  req.session['user_id'] = user.id;
  return res.redirect('/urls');
});


app.post('/logout', (req, res) => {
  req.session['user_id'] = null;
  res.redirect('/urls');
});


app.get('/register', (req, res) => {
  const userId = req.session['user_id'];
  let templateVars = {
    user: users[userId]
  };
  if (users[userId]) {
    return res.redirect('/urls');
  }
  res.render('urls_register', templateVars);
});



app.post('/register', (req, res) => {
  const { email, password } = req.body;
  let templateVars = {
    user: null
  };
  if (email === '' || password === '') {
    const err = "Email and pasword are required!";
    return res.send(err)
  }
  if (getUserByEmail(email, users)) {
    const err = "Email exist!";
    return res.send(err)
  }
  const id = generateRandomString();
  const hashPass = bcrypt.hashSync(password, saltRounds);
  users[id] = {
    id,
    email,
    password: hashPass
  };
  req.session['user_id'] = id;
  res.redirect('/urls');
});