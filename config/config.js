require('dotenv').config();

module.exports = {
  development: {
    username: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    host: process.env.MYSQL_HOST || '127.0.0.1', 
    dialect: 'mysql',
    define: { underscore: true },
    logging: false,
    port: process.env.MYSQL_PORT || 3306,
    dialectOptions: {
      connectTimeout: 30000 // 30 giây
    }
  },
  test: {
    username: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    host: process.env.MYSQL_HOST || '127.0.0.1',
    dialect: 'mysql',
    define: { underscore: true },
    logging: false,
    port: process.env.MYSQL_PORT || 3306,
    dialectOptions: {
      connectTimeout: 30000
    }
  },
  production: {
    username: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    host: process.env.MYSQL_HOST || '127.0.0.1',
    dialect: 'mysql',
    logging: false,
    port: process.env.MYSQL_PORT || 3306,
    dialectOptions: {
      connectTimeout: 30000
    }
  }
};