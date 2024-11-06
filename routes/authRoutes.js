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