const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));
const PORT = 8080;

const mongoUri = `mongodb+srv://sys0321:max0321@cluster0.lncdty3.mongodb.net/todoapp?retryWrites=true&w=majority`;
const { MongoClient } = require("mongodb");
const client = new MongoClient(mongoUri, { useUnifiedTopology: true });
var db;

client.connect((에러) => {
  if (에러) return console.log(에러);
  db = client.db("todoapp");

  app.listen(8080, function () {
    console.log("listening on 8080");
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

app.post("/add", (요청, 응답) => {
  응답.send(`/add로 POST 전송 성공했다. 요청.body.title = ${요청.body.title}`);
  console.log(요청.body.title);
});
