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
