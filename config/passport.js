const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const { User } = require('../models');

module.exports = (passport) => {
  // LocalStrategy 설정
  passport.use(
    new LocalStrategy({ usernameField: 'username' }, async (username, password, done) => {
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
      const user = await User.findByPk(id);  // 세션에서 사용자의 ID를 받아 데이터베이스에서 사용자 정보를 조회
      done(null, user);  // 조회된 사용자 정보를 요청에 저장
    } catch (error) {
      done(error);  // 오류가 발생하면 오류와 함께 호출
    }
  });
};
