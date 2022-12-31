const express = require("express"); // 라이브러리를 쓸게요.
const app = express(); // express 객체 생성할게요.
app.use(express.urlencoded({ extended: true }));
// 221231 19:20 EJS 서버에서 가져온 데이터 html에 쉽게 뿌리기
// ejs 라이브러리를 설치합니다.
// $ npm i --save-dev ejs
// 아래와 같이 ejs를 view engine으로 등록합니다.
app.set("view engine", "ejs");

const PORT = 8080;

// 221231 03:30 MongoDB 연결방법
// connect에서 복사해 온 uri에  username, password, database name를 알맞게 입력해줍니다.
const mongoUri = `mongodb+srv://sys0321:max0321@cluster0.lncdty3.mongodb.net/todoapp?retryWrites=true&w=majority`;
// MongoClient 모듈을 가져옵니다.
const { MongoClient } = require("mongodb");
// MongoClient class를 생성합니다. 두번째 인자는 중요하지 않은 warning을 제거해준다 합니다.
const client = new MongoClient(mongoUri, { useUnifiedTopology: true });
// 변수를 하나 생성합니다.
let db;

client.connect((에러) => {
  // 221231 02:00 에러가 발생했을 때 에러를 출력하려면
  if (에러) return console.log(에러);

  // 221231 02:30 데이터베이스에 연결하기
  // todoapp 데이터베이스에 접속합니다.
  db = client.db("todoapp");

  // post collection에 데이터를 저장합니다. id는 _언더바를 붙여주어야 합니다.
  db.collection("post").insertOne({ _id: 1, 이름: "You", nationality: "KOR" }, (에러, 결과) => {
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
});

// 221231 19:10 post 요청을 통해서 유저가 입력한 정보를 데이터베이스에 저장하려면 이렇게
app.post("/add", (요청, 응답) => {
  app.post("/add", (요청, 응답) => {
    응답.send(`/add로 POST 전송 성공했다.`);
    // 230101 03:30 counter collection에서 {name:'게시물수'} 를 찾고 싶다.
    db.collection("counter").findOne({ name: "게시물수" }, (에러, 결과) => {
      const 총게시물갯수 = 결과.totalPost;

      db.collection("post").insertOne({ _id: 총게시물갯수, 제목: 요청.body.title, 날짜: 요청.body.date }, (에러, 결과) => {
        console.log("저장완료");
        // 230101 03:30 데이터 수정하기
        // 결과.totalPost 의 값을 +1 해주어야 다음에 생성할 때 id가 겹치지 않는다
        // $set 연산자: 바꿔주세요. $inc: 증가시켜주세요
        db.collection("counter").updateOne({ 수정할데이터 }, { $inc: { 수정값 } }, (에러, 결과) => {
          if (에러) return console.log(에러);
        });
      });
    });
  });
});

// 221231 19:32 데이터베이스에서 받아온 자료 넣어주려면 render
app.get("/list", (요청, 응답) => {
  // 모든 데이터 가져오기
  db.collection("post")
    .find()
    .toArray((에러, 결과) => {
      console.log(결과);
      // => post collection에서 모든 데이터를 찾아 array 형태로 담은 결과를
      // list.ejs 파일을 렌더할 때 {보낼데이터이름: 결과} 형태로 데이터를 전달해 주세요.
      응답.render("list.ejs", { posts: 결과 });
    });
});
