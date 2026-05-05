# Alt Soc App

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://choosealicense.com/licenses/mit/)

## Description
A positive social media environment for posting, discussing, and promoting experiences and tech content. Once an account is created, users can create posts, manage them from their dashboard, comment, upvote, and set a profile picture.

Built with Node.js, Express, Sequelize/MySQL, Handlebars, and Cloudinary for profile picture uploads.

## Table of Contents
- [Usage](#usage)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [Questions](#questions)
- [License](#license)

## Usage

Users can post and view posts by others, comment, and upvote. Requires a MySQL database and a Cloudinary account for profile picture uploads.

## Installation

1. Clone the repository
2. Install [Node.js](https://nodejs.org/) and MySQL
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file in the root directory (see [Environment Variables](#environment-variables))
5. Create the database in MySQL:
   ```sql
   CREATE DATABASE your_db_name;
   ```
6. (Optional) Seed the database:
   ```bash
   npm run seeds
   ```
7. Start the server:
   ```bash
   npm start
   ```
   Or, for development with auto-restart:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env` file with the following:

```
DB_NAME=your_database_name
DB_USER=your_mysql_username
DB_PW=your_mysql_password
SESSION_SECRET=a_long_random_secret_string
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
```

## Future Development

- Photo albums for posts
- Video upload and albums
- Meme creator / image editor
- Marketplace

## Contributing

Collaboration with Boyd Roberts (coleyrockin) and Vanessa Oja (vanessaoja).

## Questions

GitHub: [BeKind-Rewind](https://github.com/BeKind-Rewind)
Email: Challenge641@gmail.com

## License

Licensed under the [MIT](https://choosealicense.com/licenses/mit/) license.
