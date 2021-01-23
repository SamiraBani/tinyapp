const emailExists = (userDatabase, email) => {
   if (userDatabase[email]) {
      return true;
   } else {
      return false;
   }
}

const passwordMatching = (userDatabase, email, password) => {
   if (userDatabase[email].password === password) {
      return true
   } else {
      return false;
   }
}

const fetchUser = (userDatabase, email) => {
   for(const userId in userDatabase) {
      const user = userDatabase[userId];
      if (user.email === email){
         return user;
      }
   }
   return null;
}

module.exports = {emailExists, passwordMatching, fetchUser}