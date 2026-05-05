require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const exphbs = require('express-handlebars');
const fileUpload = require('express-fileupload');
const rateLimit = require('express-rate-limit');
const { v2: cloudinary } = require('cloudinary');
const { csrfProtection } = require('./middleware/csrfProtection');
const requireSameOriginRequest = require('./middleware/requireSameOriginRequest');

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';
const sessionSecret = process.env.SESSION_SECRET;

if (isProduction) {
  app.set('trust proxy', 1);
  if (!sessionSecret) {
    throw new Error('SESSION_SECRET is required in production.');
  }
}

app.disable('x-powered-by');

const helmet = require('helmet');
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'"],
      'style-src': ["'self'", 'https://fonts.googleapis.com'],
      'font-src': ["'self'", 'https://fonts.gstatic.com'],
      'img-src': ["'self'", 'data:', 'https:'],
      'connect-src': ["'self'"],
      'form-action': ["'self'"],
      'object-src': ["'none'"],
      'base-uri': ["'self'"]
    }
  }
}));

// File upload support
app.use(fileUpload({
  useTempFiles: true,
  limits: { fileSize: 5 * 1024 * 1024 },
  abortOnLimit: true,
  safeFileNames: true,
  preserveExtension: true
}));
app.use(express.static(path.join(__dirname, 'public'), { dotfiles: 'ignore', index: false }));
app.use(express.static(path.join(__dirname, 'upload'), { dotfiles: 'ignore', index: false }));

const helpers = require('./utils/helpers');
const hbs = exphbs.create({ helpers });

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

// Sequelize session store
const sequelize = require('./config/connection');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

const sess = {
  name: 'sessionId',
  secret: sessionSecret || 'fallback-secret-change-in-production',
  cookie: {
    httpOnly: true,
    sameSite: 'strict',
    secure: isProduction,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  resave: false,
  saveUninitialized: false,
  store: new SequelizeStore({ db: sequelize })
};

app.use(session(sess));
app.use(csrfProtection);

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many auth attempts. Please try again later.' }
});

app.use('/api', apiLimiter);
app.post('/api/users', authLimiter);
app.post('/api/users/login', authLimiter);
app.use('/api', requireSameOriginRequest);

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '25kb', parameterLimit: 50 }));

app.use(require('./controllers/'));

app.use((req, res) => {
  res.status(404).json({ message: 'Not found.' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack || err);
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
});

module.exports = app;

if (require.main === module) {
  sequelize.sync({ force: false }).then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  });
}
