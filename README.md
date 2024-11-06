# **단계별 실습 메뉴얼**

**Node.js, Passport.js, MySQL, Sequelize**를 사용하여 간단한 인증 시스템 구축.

이 메뉴얼은 프로젝트 생성부터 테스트 실행까지 전체 과정을 포함합니다.

## WSL에 MySQL 도커 컨테이너 생성

- 도커 데스크탑을 먼저 실행

```bash
# WSL에서 도커 설치 확인
docker --version

# 새 사용자 계정을 도커 그룹에 추가
sudo usermod -aG docker $USER
# 변경 사항 적용
newgrp docker
# docker 그룹에 속한 사용자 보기 
getent group docker

docker run -d -it --name my-mysql \
-v ~/mysql_data:/var/lib/mysql \
-e MYSQL_ROOT_PASSWORD=1234 \
-p 3307:3306 \
mysql:5.7

# 생성 된 도커 컨테이너 목록
docker ps
docker ps -a

# vs-code접속 할 경우 퍼미션 변경
sudo chmod 777 /var/run/docker.sock
source ~/.bashrc

# mysql 도커 컨테이너 내부로 진입
docker exec -it my-mysql mysql -uroot -p1234
```

---

## 프로젝트 생성 및 초기 설정

1. **프로젝트 폴더 생성 및 git 설정 초기화**
    
    ```bash
    # 새 프로젝트 생성
    cd ~
    mkdir passport-example
    cd passport-example
    npm init -y
    
    # git 설정 초기화
    git init
    git add --all
    git commit -m "passport example"
    git branch -M main
    git remote add origin https://github.com/깃계정/레파지토리
    git push -u origin main
    ```
    
2. **필수 패키지 설치**
    
    ```bash
    npm i -S express mysql2 sequelize dotenv ejs
    npm i -S passport passport-local express-session bcryptjs connect-flash
    npm i -D nodemon
    npm i -D sequelize-cli jest supertest
    ```
    
3. **프로젝트 디렉토리 구조 설정**
    - node init 명령으로 자동 생성: package.json 등.
    - sequelize-cli init 명령으로 자동 생성 : models, migrations, seeders, config 등.
    - 직접 생성 : app.js, routes, tests, views, .env 등.
    
    ```bash
    passport-example/                   # 프로젝트 루트 디렉터리
    ├── app.js                          # app의 진입 파일, 서버 및 미들웨어 설정
    ├── config/                         # 설정 파일을 저장하는 디렉터리
    │   ├── config.json                 # Sequelize 데이터베이스 설정 파일
    │   └── passport.js                 # Passport.js 설정 파일 (인증 전략 설정)
    ├── migrations/                     # DB 마이그레이션 파일을 저장하는 디렉터리
    │   └── [timestamp]-create-user.js  # User 테이블 생성 마이그레이션 파일 (예시)
    ├── models/                         # Sequelize 모델을 정의하는 디렉터리
    │   ├── index.js                    # Sequelize 초기화 및 모델 연결 설정 파일
    │   └── user.js                     # User 모델 정의 파일 (사용자 정보 스키마 정의)
    ├── routes/                         # Express 라우터를 정의하는 디렉터리
    │   └── authRoutes.js               # 인증 관련 라우터 파일
    ├── seeders/                        # 초기 데이터 생성을 위한 Seed 파일 저장 디렉터리
    │   └── [timestamp]-demo-user.js    # Seed 파일 예시 (기본 사용자 생성)
    ├── tests/                          # 테스트 코드를 저장하는 디렉터리
    │   └── auth.test.js                # 인증 관련 기능을 테스트하는 Jest 테스트 파일
    ├── views/                          # EJS 뷰 템플릿 파일을 저장하는 디렉터리
    │   ├── login.ejs                   # 로그인 페이지 EJS 템플릿
    │   └── dashboard.ejs               # 대시보드 페이지 EJS 템플릿 (로그인 후 접근 가능)
    ├── .env                            # 환경 변수 설정 파일 (DB URL 등 민감 정보 저장)
    └── package.json                    # 프로젝트 의존성 목록 및 npm 스크립트 설정
    ```
    

---

## Sequelize 설정 및 데이터베이스 구성

1. **Sequelize 초기화**
    
    ```bash
    npx sequelize-cli init
    ```
    
2. **데이터베이스 설정 파일 수정**
    
    `config/config.json` 파일을 열고 MySQL 데이터베이스 설정을 추가합니다.
    
    ```json
    {
      "development": {
        "username": "root",
        "password": "1234",
        "database": "shopping_mall",
        "host": "127.0.0.1",
        "dialect": "mysql",
        "port": 3307
      },
      "test": {
        "username": "root",
        "password": "1234",
        "database": "shopping_mall",
        "host": "127.0.0.1",
        "dialect": "mysql",
        "port": 3307
      },
      "production": {
        "username": "root",
        "password": "1234",
        "database": "shopping_mall",
        "host": "127.0.0.1",
        "dialect": "mysql",
        "port": 3307
      }
    }
    ```
    
    - 또는 `.env` 파일에 데이터베이스 정보를 넣어도 됩니다. (예: `DATABASE_URL`).
        
        (이하 내용은 선택입니다. 꼭 **`.env`** 파일을 사용 해야 하는 것은 아닙니다. )
        
        - .env 파일을 생성하고 다음 내용을 입력 합니다.
        
        ```
        DATABASE_URL=mysql://root:1234@127.0.0.1:3307/shopping_mall
        ```
        
        - config/config.json을  DATABASE_URL 정보로 수정
        
        ```json
        {
          "development": {
            "use_env_variable": "DATABASE_URL",
            "dialect": "mysql"
          },
          "test": {
            "use_env_variable": "DATABASE_URL",
            "dialect": "mysql"
          },
          "production": {
            "use_env_variable": "DATABASE_URL",
            "dialect": "mysql"
          }
        }
        ```
        
        - .env 파일을 사용 하기 위해서는 dotenv 패키지를 설치 하고
        
        ```bash
        # 위에서 미리 한꺼번에 설치 함.
        npm install dotenv
        ```
        
        - **프로젝트에서 `dotenv` 설정** (`models/index.js` 파일 상단에 추가)
        
        ```jsx
        require('dotenv').config();
        ```
        
3. **데이터베이스 생성**
    - 다음 sequelize-cli 를 이용해서 데이터베이스를 생성 합니다.
    
    ```bash
    npx sequelize-cli db:create
    ```
    
    실행 결과
    
    ```bash
    Sequelize CLI [Node: 20.18.0, CLI: 6.6.2, ORM: 6.37.5]
    
    Loaded configuration file "config/config.json".
    Using environment "development".
    Database shopping_mall created.
    ```
    
    MySQL 데이터베이스 생성 확인
    
    ```sql
    mysql> show databases;
    +--------------------+
    | Database           |
    +--------------------+
    | information_schema |
    | mysql              |
    | performance_schema |
    | **shopping_mall**      |
    | sys                |
    +--------------------+
    5 rows in set (0.01 sec)
    ```
    

---

## 모델 및 마이그레이션 생성

1. **User 모델 및 마이그레이션 생성**
    - models에 user.js 파일 자동 생성.
    
    ```bash
    npx sequelize-cli model:generate --name User \
                      --attributes username:string,password:string
    ```
    
2. **마이그레이션 실행**
    - 데이터베이스에 실제 테이블이 생성 됨.
    
    ```bash
    npx sequelize-cli db:migrate
    ```
    
    - 마이그레이션 명령 실행 후 MySQL에서 결과 확인
    
    ```sql
    mysql> use shopping_mall
    Database changed
    
    mysql> show tables;
    +-------------------------+
    | Tables_in_shopping_mall |
    +-------------------------+
    | SequelizeMeta           |
    | Users                   |
    +-------------------------+
    2 rows in set (0.00 sec)
    
    mysql> desc Users;
    +-----------+--------------+------+-----+---------+----------------+
    | Field     | Type         | Null | Key | Default | Extra          |
    +-----------+--------------+------+-----+---------+----------------+
    | id        | int(11)      | NO   | PRI | NULL    | auto_increment |
    | username  | varchar(255) | YES  |     | NULL    |                |
    | password  | varchar(255) | YES  |     | NULL    |                |
    | createdAt | datetime     | NO   |     | NULL    |                |
    | updatedAt | datetime     | NO   |     | NULL    |                |
    +-----------+--------------+------+-----+---------+----------------+
    5 rows in set (0.00 sec)
    ```
    

---

## Passport 설정

1. **`config/passport.js` 파일 생성**
    - 직접 파일을 생성 해서 수동으로 작성 해야 합니다.
    - 사용자 조회 및 비밀번호 검증 및 세션 저장 (serializeUser), 세션 복원 (deserializeUser)
    
    ```jsx
    const LocalStrategy = require('passport-local').Strategy;
    const bcrypt = require('bcryptjs');
    const { User } = require('../models');
    
    module.exports = (passport) => {
      // LocalStrategy 설정
      passport.use(
        new LocalStrategy({ usernameField: 'username' }, 
    											    async (username, password, done) => {
          try {
            // 데이터베이스에서 사용자를 찾음
            const user = await User.findOne({ where: { username } });
            
            // 사용자가 존재하지 않으면 실패 메시지와 함께 인증 실패 처리
            if (!user) return done(null, false, { message: 'User not found' });
    
            // 비밀번호 비교 (입력된 비밀번호와 데이터베이스에 저장된 해시된 비밀번호 비교)
            const isMatch = await bcrypt.compare(password, user.password);
            
            // 비밀번호가 일치하지 않으면 인증 실패 처리
            if (!isMatch) return done(null, false, { message: 'Incorrect password' });
    
            // 사용자 인증 성공 시 사용자 정보를 반환
            return done(null, user);
          } catch (error) {
            // 오류가 발생한 경우 오류와 함께 인증 실패 처리
            return done(error);
          }
        })
      );
    
      // 사용자 정보를 세션에 저장
      passport.serializeUser((user, done) => done(null, user.id));
    
      // 세션에서 사용자 정보를 복원 (데이터베이스에서 사용자 정보를 조회)
      passport.deserializeUser(async (id, done) => {
        try {
    	    // 세션에서 사용자의 ID를 받아 데이터베이스에서 사용자 정보를 조회
          const user = await User.findByPk(id);  
          done(null, user);  // 조회된 사용자 정보를 요청에 저장
        } catch (error) {
          done(error);  // 오류가 발생하면 오류와 함께 호출
        }
      });
    };
    ```
    

---

## Express 서버 설정 (`app.js`)

1. **패스포트 설정을 `app.js`에 추가**
    
    ```jsx
    const express = require('express');
    const session = require('express-session');
    const passport = require('passport');
    const flash = require('connect-flash');
    const authRoutes = require('./routes/authRoutes');
    // Passport 설정 파일을 불러와 Passport 초기화
    require('./config/passport')(passport);  
    
    const app = express();
    
    // JSON 요청을 파싱하여 req.body에 담음
    app.use(express.json());  
    // URL-encoded 요청 데이터를 파싱하여 req.body에 담음
    app.use(express.urlencoded({ extended: true }));  
    
    // 세션 설정
    app.use(session({
      secret: 'your_secret_key',  // 세션 암호화 키
      resave: false,              // 세션이 변경되지 않은 경우에도 다시 저장할지 설정
      saveUninitialized: true,    // 초기화되지 않은 세션을 저장할지 설정
    }));
    
    // 플래시 메시지 설정 (로그인 오류 메시지 등 일회성 메시지 저장)
    app.use(flash());  
    
    // Passport 초기화 및 세션 사용 설정
    app.use(passport.initialize());
    app.use(passport.session());
    
    // 뷰 엔진 설정
    app.set("view engine", "ejs");
    app.set("views", "./views");
    
    // 인증 관련 라우트 설정
    app.use('/auth', authRoutes);
    
    // 대시보드 라우트
    app.get('/dashboard', (req, res) => {
      if (req.isAuthenticated()) {  // 사용자가 인증된 경우에만 대시보드 표시
        res.render('dashboard', { username: req.user.username });
      } else {
        res.redirect('/auth/login');
      }
    });
    
    module.exports = app;
    
    ```
    

---

## 라우트 설정 (`routes/authRoutes.js`)

- path 라우트 모듈 분리
    
    ```jsx
    const express = require('express');
    const passport = require('passport');
    const bcrypt = require('bcryptjs');
    const { User } = require('../models');  // User 모델을 데이터베이스와 연결
    const router = express.Router();
    
    // 회원가입 라우트
    router.post('/register', async (req, res) => {
      const { username, password } = req.body;  // 요청 본문에서 사용자명과 비밀번호를 가져옴
      const hashedPassword = await bcrypt.hash(password, 10);  // 비밀번호를 해시 처리
    
      try {
        // 새로운 사용자 생성 및 데이터베이스에 저장
        await User.create({ username, password: hashedPassword });
        res.redirect('/auth/login');  // 회원가입 성공 시 로그인 페이지로 리디렉션
      } catch (error) {
        // 회원가입 실패 시 에러 메시지와 함께 400 상태 코드 반환
        res.status(400).json({ error: 'Registration failed' });
      }
    });
    
    // 로그인 페이지 라우트 (GET 요청)
    router.get('/login', (req, res) => {
      const messages = req.flash('error');  // 로그인 실패 시 Flash 메시지를 가져옴
      res.render('login', { messages });  // login.ejs 템플릿에 메시지를 전달하여 렌더링
    });
    
    // 로그인 처리 라우트 (POST 요청)
    router.post('/login', passport.authenticate('local', {
      successRedirect: '/dashboard',      // 로그인 성공 시 대시보드로 리디렉션
      failureRedirect: '/auth/login',     // 로그인 실패 시 로그인 페이지로 리디렉션
      failureFlash: true                  // 실패 시 Flash 메시지를 활성화
    }));
    
    // 로그아웃 라우트
    router.get('/logout', (req, res) => {
      req.logout((err) => {  // 로그아웃 처리
        if (err) return next(err);  // 로그아웃 실패 시 오류 처리
        res.redirect('/auth/login');  // 로그아웃 후 로그인 페이지로 리디렉션
      });
    });
    
    module.exports = router;  // 라우터 모듈 내보내기
    ```
    
- server.js파일 생성
    
    ```sql
    // app.js에서 설정한 Express 애플리케이션 불러오기
    const app = require('./app');  
    
    // 서버 포트 설정 
    const PORT = process.env.PORT || 3000;
    
    // 서버 시작
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
    ```
    

### 서버 실행

- 단순 node 명령으로 서버 실행
    
    ```sql
    node server.js
    ```
    
- package.json 파일의 “script” 수정
    
    ```json
    "scripts": {
        "test": "jest",
        "dev": "nodemon server.js",
        "start": "node server.js"
     },
    ```
    
- “script” 수정 후 실행
    
    ```json
    npm run dev
    ```
    

### CURL을 이용한 입력 및 로그인 테스트

- curl기능으로 터미널에서 바로 입력 및 로그인 테스트 가능.
    
    ```bash
    # 첫번째 데이터 저장 (저장 실행 후 MySQL에서 확인 가능)
    curl -X POST http://localhost:3000/auth/register \
      -H "Content-Type: application/json" \
      -d '{"username": "user1", "password": "1234"}'
    
    # 로그인 요청 테스트 (성공시 cookies.txt 결과 쿠키 생성)
    curl -X POST http://localhost:3000/auth/login \
    -d "username=user1&password=1234" \
    -c cookies.txt
    ```
    

---

## 뷰 파일 생성 (`views/login.ejs` 및 `views/dashboard.ejs`)

- **`views/login.ejs`**
    
    ```html
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Login</title>
    </head>
    <body>
      <h2>Login</h2>
      <% if (messages.length > 0) { %>
        <div><%= messages[0] %></div>
      <% } %>
      <form action="/auth/login" method="POST">
        <input type="text" name="username" placeholder="Username" required />
        <input type="password" name="password" placeholder="Password" required />
        <button type="submit">Login</button>
      </form>
    </body>
    </html>
    
    ```
    
- `views/dashboard.ejs`
    
    ```html
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Dashboard</title>
    </head>
    <body>
      <h1>Welcome, <%= username %>!</h1>
      <a href="/auth/logout">Logout</a>
    </body>
    </html>
    ```
    

---

## Seed 파일을 사용해 테스트 사용자 추가

1. **Seed 파일 생성**
    - **`seeders/[timestamp]-demo-user.js`** 파일이 자동으로 생성 됨.
    
    ```bash
    npx sequelize-cli seed:generate --name demo-user
    ```
    
2. **Seed 파일 수정 (`seeders/[timestamp]-demo-user.js`)**
    
    ```jsx
    'use strict';
    const bcrypt = require('bcryptjs');
    
    module.exports = {
      async up(queryInterface, Sequelize) {
        const hashedPassword = await bcrypt.hash('1234', 10);
        return queryInterface.bulkInsert('Users', [{
          username: 'user2',
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        }]);
      },
    
      async down(queryInterface, Sequelize) {
        return queryInterface.bulkDelete('Users', { username: 'user1' });
      }
    };
    ```
    
3. **Seed 파일 실행**
    - 다음 명령 실행 후 MySQL 데이터 베이스에서 확인 하면 새 데이터가 추가 된 것을 확인 가능.
    
    ```bash
    npx sequelize-cli db:seed:all
    ```
    

---

## 테스트 설정 (`tests/auth.test.js`)

```jsx
// HTTP 요청을 테스트하기 위한 supertest 모듈 불러오기
const request = require('supertest');  
// 테스트할 Express 애플리케이션(app.js)을 불러옴
const app = require('../app');         

// 로그인 경로에 대한 테스트 그룹 정의
describe('POST /auth/login', () => {
  // 개별 테스트: 로그인 성공 시 /dashboard로 리다이렉트되는지 확인
  it('로그인 성공 시 /dashboard로 리다이렉트해야 합니다.', async () => {
    // 로그인 요청 전송
    const response = await request(app)
	    // POST 요청으로 /auth/login 경로에 접속
      .post('/auth/login') 
      // 사용자명과 비밀번호를 포함하여 전송           
      .send({ username: 'user1', password: '1234' });  

    // 서버 응답 헤더의 location이 /dashboard로 설정되었는지 확인
    expect(response.headers.location).toBe('/dashboard');
  });
});
```

---

## 서버 실행 및 테스트

1. **서버 실행**
    - 테스트 전에 먼저 nodemon 실행을 중지 한다.
    
    ```bash
    node app.js
    
    ```
    
2. **테스트 실행**
    
    ```bash
    npm test
    ```
    
    - 터미널 실행 결과
    
    ```bash
    ~/passport-example2$ npm test
    
    > passport-example2@1.0.0 test
    > jest
    
      console.log
        Executing (default): SELECT `id`, `username`, `password`, `createdAt`, `updatedAt` FROM `Users` AS `User` WHERE `User`.`username` = 'user1' LIMIT 1;
    
          at Sequelize.log (node_modules/sequelize/src/sequelize.js:1281:15)
    
     PASS  tests/auth.test.js
      POST /auth/login
        ✓ 로그인 성공 시 /dashboard로 리다이렉트해야 합니다. (256 ms)
    
    Test Suites: 1 passed, 1 total
    Tests:       1 passed, 1 total
    Snapshots:   0 total
    Time:        1.373 s
    Ran all test suites.
    Jest did not exit one second after the test run has completed.
    
    'This usually means that there are asynchronous operations that weren't stopped in your tests. Consider running Jest with `--detectOpenHandles` to troubleshoot this issue.
    ```
    

## 브라우저에서 접속

- 먼저 서버를 실행 하고 브라우저 주소 창에 http://localhost:3000/auth/login 입력.

![image.png](image.png)

- 로그인 성공

![image.png](image (1).png)