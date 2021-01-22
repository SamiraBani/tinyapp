const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-Parser");
const {emailExists, passwordMatching, fetchUser} = require('./helper');

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const generateRandomString = function() {
   let rand = Math.random().toString(36).substring(7, 1);
   return rand;
    };


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
   "user1": {
     id: "userRandomID", 
     email: "user@example.com", 
     password: "purple-monkey-dinosaur"
   },
  "user2": {
     id: "user2RandomID", 
     email: "user2@example.com", 
     password: "dishwasher-funk"
   }
 };

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
   res.json(urlDatabase);
 });

 app.get("/hello", (req, res) => {
   res.send("<html><body>Hello <b>World</b></body></html>\n");
 });

 app.get("/urls/new", (req, res) => {
   res.render("urls_new");
 });

 
 app.get("/urls", (req, res) => {

   const templateVars = { urls: urlDatabase,  username: req.cookies["username"]};
   res.render("urls_index", templateVars);
 });
 

app.get("/urls/:shortURL", (req, res) => {
   const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"]};
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
   const generatedUrl = generateRandomString();
   urlDatabase[generatedUrl] = req.body.longURL;
   res.redirect(`/urls/${generatedUrl}`); 
});


 app.post("/urls/:shortURL/delete", (req, res) => {  
   const idToDelete = req.params.shortURL;
   delete urlDatabase[idToDelete];
   res.redirect('/urls');      
 });
   
 app.get("/urls/:shortURL", (req, res) => {  
   const updateId = req.params.shortURL;
   urlDatabase[updateId] = req.body.longURL;
   res.redirect('/urls');      
 });

 app.post("/urls/:shortURL", (req, res) => {
    const newUrl = req.body.newURL;
    // console.log(newUrl);
   const id = req.params.shortURL;
   urlDatabase[id]= newUrl
   res.redirect('/urls');
 });

app.post("/login", (req, res) => {
  console.log(req.body);
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect('/urls');
 });

 app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
 });

 app.get("/url_register", (req, res) => {
   res.render('/urls');
});
   
app.post("/url_register", (req, res) => {
   const incomingEmail = req.body.email;
   const incomingPassword = req.body.password;
   const incomingId = generateRandomString();
   if(emailExists(users, incomingEmail)){
      console.log("email already exist!");
      res.redirect('/url_register');
   } else{
      const newUser = {
         id: incomingId,
         email: incomingEmail,
         password: incomingPassword
      }
   users[incomingEmail] = newUser;   
   }
   res.redirect('/url_login');
});

 