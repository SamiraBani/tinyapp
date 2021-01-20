const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


const generateRandomString = function() {
   let rand = Math.random().toString(36).substring(7, 1);
   return rand;
    };


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
   const templateVars = { urls: urlDatabase };
   res.render("urls_index", templateVars);
 });
 

app.get("/urls/:shortURL", (req, res) => {
   const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
   res.render("urls_show", templateVars);
 });


//  app.post("/urls", (req, res) => {
//    console.log(req.body);  // Log the POST request body to the console
//    res.send("Ok");         // Respond with 'Ok' (we will replace this)
//  });

 app.get("/u/:shortURL", (req, res) => {
    console.log(req.params.shortURL);
   const longURL = urlDatabase[req.params.shortURL];
   console.log("anystring");
   console.log(urlDatabase);
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
   
  