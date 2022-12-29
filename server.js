const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));

const PORT = 8080;

app.listen(PORT, () => {
  console.log(`${PORT} 포트 서버 실행.`);
});

app.get("/beauty", (요청, 응답) => {
  응답.send("뷰티용품 쇼핑 페이지");
});

app.get("/", (요청, 응답) => {
  응답.sendFile(__dirname + "/index.html");
});

app.get("/write", (요청, 응답) => {
  응답.sendFile(__dirname + "/write.html");
});

app.post("/add", (요청, 응답) => {
  응답.send(`/add로 POST 전송 성공했다. 요청.body.title = ${요청.body.title}`);
  console.log(요청.body.title);
});
