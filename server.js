const path = require('path');
const express = require('express');
// sets up an Express session and connects the session to our Sequelize db
const session = require('express-session');
// set up Handlebars.js as app's template engine of choice
const exphbs = require('express-handlebars');

const app = express();
const PORT = process.env.PORT || 3001;


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