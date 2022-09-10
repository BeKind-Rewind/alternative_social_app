const path = require('path');
const express = require('express');
const session = require('express-session');
const exphbs = require('express-handlebars');
const fileUpload = ('express-fileupload')

const PORT = process.env.PORT || 3001;

//Profile picture
app.use(fileUpload());

// Static Files
app.use(express.static('public'));
app.use(express.static('upload'));


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

const helpers = require('./utils/helpers');
const hbs = exphbs.create({ helpers });

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(require('./controllers/'));

sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => console.log('Now listening'));
});