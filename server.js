const app = require('./app');  // app.js에서 설정한 Express 애플리케이션 불러오기

// 서버 포트 설정 (환경 변수 PORT가 설정되어 있으면 해당 포트를 사용하고, 그렇지 않으면 3000번 포트를 사용)
const PORT = process.env.PORT || 3000;

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
