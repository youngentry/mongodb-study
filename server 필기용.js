const express = require("express"); // 라이브러리를 쓸게요.
const app = express(); // express 객체 생성할게요.
app.use(express.urlencoded({ extended: true }));
const PORT = 8080;

// 221231 03:30 MongoDB 연결방법
// connect에서 복사해 온 uri에  username, password, database name를 알맞게 입력해줍니다.
const mongoUri = `mongodb+srv://sys0321:max0321@cluster0.lncdty3.mongodb.net/todoapp?retryWrites=true&w=majority`;
// MongoClient 모듈을 가져옵니다.
const { MongoClient } = require("mongodb");
// MongoClient class를 생성합니다.
const client = new MongoClient(mongoUri, { useUnifiedTopology: true });
// 변수를 하나 생성합니다.
let db;

client.connect((에러) => {
  // 221231 02:00 에러가 발생했을 때 에러를 출력하려면
  if (에러) return console.log(에러);

  // 221231 02:30 데이터베이스에 연결하기
  // 아래와 똑같이 입력합니다.
  db = client.db("todoapp");

  // post collection에 데이터를 저장합니다.
  db.collection("post").insertOne({ 이름: "You", nationality: "KOR" }, (에러, 결과) => {
    console.log("저장완료");
  });

  app.listen(PORT, () => {
    console.log(`${PORT} 포트 서버 실행.`);
  });
});

// 8080 포트에 서버를 연결하고, callback 실행할게요.
app.listen(PORT, () => {
  console.log(`누군가 ${PORT} 포트로 접속했다.`);
});

// "/테스트"로 접속하면 callback 실행할게요.
app.get("/테스트", (요청, 응답) => {
  // 화면에 "테스트 페이지입니다."를 그려주세요.
  // => test.html을 보내면? /test에서 test.html파일을 렌더링 한다.
  응답.send("/테스트 페이지입니다.");
});

// 파일을 GET 주소로 보내기 위해서는 응답.sendFile(__dirname + "/보낼파일명")
app.get("/", (요청, 응답) => {
  응답.sendFile(__dirname + "/index.html");
});

// html에서 "/경로"로 POST요청을 하면, callback 함수를 실행해주세요.
// 이용자가 입력한 값은 (요청)에 저장된다.
// 값을 가져오려면 상단에 app.use(express.urlencoded({extended: true})) 추가
app.post("/경로", (요청, 응답) => {
  응답.send("/add로 POST 전송 성공했다");
  console.log(요청.body.title);
});
