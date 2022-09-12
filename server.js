require('dotenv').config();

const path = require('path');
const express = require('express');
// sets up an Express session and connects the session to our Sequelize db
const session = require('express-session');
// set up Handlebars.js as app's template engine of choice
const exphbs = require('express-handlebars');
const fileUpload = require('express-fileupload');


const app = express();
const PORT = process.env.PORT || 3001;

// default option
app.use(fileUpload({ useTempFiles: true}));

const helpers = require('./utils/helpers');
const hbs = exphbs.create({ helpers });

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

const cloudinary = require('cloudinary');

cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET 
});

app.post('/api/users/profile', (req, res)=>{
  const profilePicture = req.files?.profilePicture;
  if(!profilePicture) {
    return res.status(400).send('No files were uploaded.')
  }
  console.log(profilePicture);
  cloudinary.v2.uploader.upload(profilePicture.tempFilePath)
    .then((response) => {
      console.log(response.url);
      res.send('Successful!');
    })
    .catch((err)=>{
      console.error(err);
      res.status(500).send('Didnt work');
    })
});


// importing the connection to sequelize from config/connection.js
const sequelize = require('./config/connection');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

const sess = {
    secret: 'Super secret secret', // replace with actual secret to store in .env
    cookie: {}, // tells our session to use cookies
    resave: false,
    saveUninitialized: true,
    store: new SequelizeStore({
      db: sequelize
    })
};
  
app.use(session(sess));


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('upload'));

app.use(require('./controllers/'));

sequelize.sync({ force: false }).then(() => {
    app.listen(PORT, () => console.log('Now listening'));
});