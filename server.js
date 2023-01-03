const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));
const methodOverride = require("method-override");
app.use(methodOverride("_method"));

app.set("view engine", "ejs");
app.use("/public", express.static("public"));

const PORT = 8080;
const mongoUri = `mongodb+srv://sys0321:max0321@cluster0.lncdty3.mongodb.net/todoapp?retryWrites=true&w=majority`;

const { MongoClient } = require("mongodb");
const client = new MongoClient(mongoUri, { useUnifiedTopology: true });
var db;

client.connect((에러) => {
  if (에러) return console.log(에러);
  db = client.db("todoapp");

  app.listen(PORT, function () {
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
  응답.render("index.ejs");
});

app.get("/write", (요청, 응답) => {
  응답.render("write.ejs");
});

app.get("/list", (요청, 응답) => {
  db.collection("post")
    .find()
    .toArray((에러, 결과) => {
      응답.render("list.ejs", { posts: 결과 });
    });
});

app.delete("/delete", (요청, 응답) => {
  요청.body._id = parseInt(요청.body._id);
  db.collection("post").deleteOne(요청.body, (에러, 결과) => {
    응답.status(200).send({ message: "성공했습니다." });
    // 서버는 응답을 해주어야 한다.
    // 200 성공
    // 400 고객 요청 문제
    // 500 서버 문제
  });
});

app.get("/detail/:id", (요청, 응답) => {
  db.collection("post").findOne({ _id: parseInt(요청.params.id) }, (에러, 결과) => {
    if (결과) {
      return 응답.render("detail.ejs", { data: 결과 });
    }
    응답.render("detail404.ejs");
  });
});

app.get("/edit/:id", (요청, 응답) => {
  db.collection("post").findOne({ _id: parseInt(요청.params.id) }, (에러, 결과) => {
    if (결과) {
      console.log(결과);
      return 응답.render("edit.ejs", { post: 결과 });
    }
    응답.render("detail404.ejs");
  });
});

app.put("/edit", (요청, 응답) => {
  db.collection("post").updateOne({ _id: parseInt(요청.body.id) }, { $set: { 제목: 요청.body.title, 날짜: 요청.body.date } }, (에러, 결과) => {
    console.log("수정 성공");
    응답.redirect("/list");
  });
});
