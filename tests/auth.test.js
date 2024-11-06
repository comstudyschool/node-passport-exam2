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