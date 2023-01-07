// 230107 17:30 route로 관리하기
// express 모듈에서 Router() 메서드를 가져옵니다.
const router = require("express").Router();

// routes 폴더를 만들어 페이지를 구분합니다.
router.get("/shirts", (요청, 응답) => {
  응답.send("셔츠 파는 페이지");
});

router.get("/pants", (요청, 응답) => {
  응답.send("바지 파는 페이지");
});

module.exports = router;
