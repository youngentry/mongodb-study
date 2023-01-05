const express = require("express");
const app = express();
const methodOverride = require("method-override"); // html5 PUT기능
const passport = require("passport"); // 세션 로그인
const LocalStrategy = require("passport-local").Strategy; // 세션 로그인
const session = require("express-session"); // 세션 로그인
require("dotenv").config();

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method")); // html5 PUT기능
app.use(session({ secret: "비밀코드", resave: true, saveUninitialized: false })); // 세션 로그인
app.use(passport.initialize()); // 세션 로그인
app.use(passport.session()); // 세션 로그인

app.set("view engine", "ejs");
app.use("/public", express.static("public"));

const PORT = process.env.PORT;
const DB_URL = process.env.DB_URL;

const { MongoClient } = require("mongodb");
const e = require("express");
const client = new MongoClient(DB_URL, { useUnifiedTopology: true });
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

app.get("/login", (요청, 응답) => {
  응답.render("login.ejs");
});

// local 방식으로 id/password 인증한다.
app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/fail",
  }),
  (요청, 응답) => {
    응답.redirect("/");
  }
);

// middleware 만들기
const isLogin = (요청, 응답, next) => {
  console.log(요청.user);
  if (요청.user) {
    next();
  } else {
    응답.send("로그인 안했어요.");
  }
};

// 두번째 인자로는 middleware를 넣으면 된다. => isLogin
app.get("/mypage", isLogin, (요청, 응답) => {
  console.log(요청.user);
  응답.render("mypage.ejs", { user: 요청.user });
});

passport.use(
  new LocalStrategy(
    {
      // 유저가 form에 입력한 name 속성을 넣어주기
      usernameField: "id",
      passwordField: "password",
      // 로그인 후 세션 저장여부
      session: true,
      // id, password 이외에 검증할 정보를 callback의 req에 담을지 여부
      passReqToCallback: false,
    },
    // id, password 검증 과정. 서버에러있니, id/password일치하는지 검증
    function (입력한아이디, 입력한비번, done) {
      console.log(입력한아이디, 입력한비번);
      db.collection("login").findOne({ id: 입력한아이디 }, function (에러, 결과) {
        // done(서버에러, 성공 시 유저DB데이터/실패 시 false넣기, 출력할 에러메시지)
        if (에러) return done(에러);

        if (!결과) return done(null, false, { message: "존재하지않는 아이디요" });
        if (입력한비번 == 결과.password) {
          return done(null, 결과);
        } else {
          return done(null, false, { message: "비번틀렸어요" });
        }
      });
    }
  )
);

// id를 이용해 세션을 만들고 쿠키로 보냄
// done의 결과가 user로 들어간다.
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

// DB에서 user.id로 유저를 찾고, 유저 정보를 반환한다.
// 바로 위의 serializeUser 메서드에서 user.id가 deserializeUser의 첫번째 인자로 들어오게 된다.
passport.deserializeUser(function (아이디, done) {
  db.collection("login").findOne({ id: 아이디 }, (에러, 결과) => {
    done(null, 결과);
  });
});

// 검색기능 구현하기
app.get("/search", (요청, 응답) => {
  const 검색조건 = [
    {
      $search: {
        index: "titleSearch",
        text: {
          query: 요청.query.value,
          path: "제목", // 여러가지 조건을 찾고 싶으면 ['제목', '날짜']
        },
      },
    },
    // 정렬기능
    { $sort: { _id: 1 } },
    // 표시할 최대 갯수
    { $limit: 5 },
  ];
  console.log(요청.query);
  db.collection("post")
    .aggregate(검색조건)
    .toArray((에러, 결과) => {
      응답.render("searchList.ejs", { searchResult: 결과 });
    });
});
