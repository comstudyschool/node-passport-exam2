'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
// .env 파일을 로드하여 환경 변수 사용
require('dotenv').config();  

// config 파일에서 환경별 설정 가져오기
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  // use_env_variable 설정을 사용하여 환경 변수에서 데이터베이스 URL을 가져옴
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  // config.json 파일의 정보로 데이터베이스 연결
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// 모델 파일을 읽어와 Sequelize에 연결
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// 모델 간의 관계 설정
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
