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

app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/fail",
  }),
  (요청, 응답) => {
    응답.redirect("/");
  }
);

const isLogin = (요청, 응답, next) => {
  console.log(요청.user);
  if (요청.user) {
    next();
  } else {
    응답.send("로그인 안했어요.");
  }
};

app.get("/mypage", isLogin, (요청, 응답) => {
  console.log(요청.user);
  응답.render("mypage.ejs", { user: 요청.user });
});

passport.use(
  new LocalStrategy(
    {
      usernameField: "id",
      passwordField: "password",
      session: true,
      passReqToCallback: false,
    },
    function (입력한아이디, 입력한비번, done) {
      console.log(입력한아이디, 입력한비번);
      db.collection("login").findOne({ id: 입력한아이디 }, function (에러, 결과) {
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

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (아이디, done) {
  db.collection("login").findOne({ id: 아이디 }, (에러, 결과) => {
    done(null, 결과);
  });
});

app.get("/search", (요청, 응답) => {
  const 검색조건 = [
    {
      $search: {
        index: "titleSearch",
        text: {
          query: 요청.query.value,
          path: "제목",
        },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 5 },
  ];
  console.log(요청.query);
  db.collection("post")
    .aggregate(검색조건)
    .toArray((에러, 결과) => {
      응답.render("searchList.ejs", { searchResult: 결과 });
    });
});

app.post("/register", (요청, 응답) => {
  // 아이디 유효성 검사
  const checkId = /^[a-zA-Z0-9]{4,20}$/;
  if (!checkId.test(요청.body.id)) {
    console.log("아디 4~20 자리의 영문자또는 숫자");
    return 응답.redirect("/login");
  }

  // 비밀번호 유효성 검사
  const checkPassword = /^[a-zA-Z0-9]{4,20}$/;
  if (!checkPassword.test(요청.body.password)) {
    console.log("비번 4~20 자리의 영문자또는 숫자");
    return 응답.redirect("/login");
  }

  // 아이디 중복체크
  db.collection("login").findOne({ id: 요청.body.id }, (에러, 결과) => {
    if (결과) {
      console.log("아디 중복임");
      return 응답.redirect("/login");
    }
    db.collection("login").insertOne({ id: 요청.body.id, pw: 요청.body.password }, (에러, 결과) => {
      return 응답.redirect("/");
    });
  });
});

app.post("/add", (요청, 응답) => {
  응답.send(`/add로 POST 전송 성공했다.`);
  db.collection("counter").findOne({ name: "게시물수" }, (에러, 결과) => {
    const 총게시물갯수 = 결과.totalPost;
    const 저장할데이터 = { _id: 총게시물갯수, 작성자: 요청.user._id, 제목: 요청.body.title, 날짜: 요청.body.date };

    db.collection("post").insertOne(저장할데이터, (에러, 결과) => {
      console.log("저장완료");
      db.collection("counter").updateOne({ name: "게시물수" }, { $inc: { totalPost: 1 } }, (에러, 결과) => {
        if (에러) return console.log(에러);
      });
    });
  });
});

app.delete("/delete", (요청, 응답) => {
  console.log("삭제요청");
  요청.body._id = parseInt(요청.body._id);

  const 삭제할데이터 = { _id: 요청.body._id, 작성자: 요청.user._id };

  db.collection("post").deleteOne(삭제할데이터, (에러, 결과) => {
    if (에러) return console.log(에러, "에러");
    if (결과) return console.log(결과.deleteCount, "결과");
    응답.status(200).send({ message: "성공했습니다." });
  });
});
