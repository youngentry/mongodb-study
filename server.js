const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const PORT = 8080;
const mongoUri = `mongodb+srv://sys0321:max0321@cluster0.lncdty3.mongodb.net/todoapp?retryWrites=true&w=majority`;

const { MongoClient } = require("mongodb");
const client = new MongoClient(mongoUri, { useUnifiedTopology: true });
var db;

client.connect((에러) => {
  if (에러) return console.log(에러);
  db = client.db("todoapp");

  app.listen(8080, function () {
    console.log("8080 포트 tooapp Database에 연결 되었음");
  });
});

app.post("/add", (요청, 응답) => {
  응답.send(`/add로 POST 전송 성공했다.`);
  db.collection("counter").findOne({ name: "게시물수" }, (에러, 결과) => {
    const 총게시물갯수 = 결과.totalPost;

    db.collection("post").insertOne({ _id: 총게시물갯수, 제목: 요청.body.title, 날짜: 요청.body.date }, (에러, 결과) => {
      console.log("저장완료");
      db.collection("counter").updateOne({ name: "게시물수" }, { $inc: { totalPost: 1 } }, (에러, 결과) => {
        if (에러) return console.log(에러);
      });
    });
  });
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

app.get("/list", (요청, 응답) => {
  db.collection("post")
    .find()
    .toArray((에러, 결과) => {
      응답.render("list.ejs", { posts: 결과 });
    });
});
