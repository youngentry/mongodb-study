const router = require("express").Router();

const isLogin = (요청, 응답, next) => {
  console.log(요청.user);
  if (요청.user) {
    next();
  } else {
    응답.send("로그인 안했어요.");
  }
};

// 모든 router에 대해 middleware 실행
// router.use(isLogin);
// 특정 router에 대해 middleware 실행
router.use("/sports", isLogin);

router.get("/sports", (요청, 응답) => {
  응답.send("스포츠 게시판");
});

router.get("/game", (요청, 응답) => {
  응답.send("게임 게시판");
});

module.exports = router;
