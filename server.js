const path = require('path');
const express = require('express');
const session = require('express-session');
const exphbs = require('express-handlebars');
const fileUpload = require('express-fileupload');

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
app.use(fileUpload()); //* image upload

const helpers = require('./utils/helpers');
const hbs = exphbs.create({ helpers });

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// photo related**
// app.get('/', (req, res) => {
//   res.render('');
// });

// photo upload**
app.post('', (req, res) => {
  let sampleFile;
  let uploadPath;

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  sampleFile = req.files.sampleFile;
  uploadPath = __dirname + '/upload/' + sampleFile.name;

  console.log(sampleFile);

  sampleFile.mv(uploadPath, function (err) {
    if (err) return res.status(500).send(err);

    res.send('FILE UPLOADED!');

  })
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(require('./controllers/'));

sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => console.log('Now listening'));
});