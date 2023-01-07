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

// 230101 16:49 받아온 데이터를 삭제합니다.
app.delete("/delete", (요청, 응답) => {
  console.log(요청.body); // { _id: '1' } jquery로 보낸 데이터
  요청.body._id = parseInt(요청.body._id); // 데이터가 int 1이 아닌 string "1" 이 넘어왔기 때문에 변환을 해준다.
  db.collection("post").deleteOne(요청.body, (에러, 결과) => {
    console.log("삭제했습니다.");
  });
});

// 230101 18:50 응답방법
app.delete("/delete", (요청, 응답) => {
  요청.body._id = parseInt(요청.body._id);
  db.collection("post").deleteOne(요청.body, (에러, 결과) => {
    응답.status(200).send({ message: "삭제성공." });
    // 서버는 응답을 해주어야 한다.
    // 200 성공
    // 400 고객 요청 문제
    // 500 서버 문제
  });
});

// 230103 19:30 params를 이용하여 상세페이지 만들기
// '/detail/:아무문자열' 로 접속을 하면 callback 실행해주세요~
app.get("/detail/:id", (요청, 응답) => {
  // 문자열을 받아오기 때문에 parseInt로 int 형으로 바꿔준다.
  db.collection("post").findOne({ _id: parseInt(요청.params.id) }, (에러, 결과) => {
    // id 중에서 유저가 url 창에 입력한 "문자열" (ex) detail/13) 13을 DB에서 찾는다.
    응답.render("detail.ejs", { data: 결과 });
    // => 그걸 data라는 변수명에 담아서 ejs 파일로 보내주고 렌더링할 준비 해줘
  });
});

// 230104 06:30 PUT요청 해보자
app.put("/edit", (요청, 응답) => {
  // query 문으로 "찾을데이터를", "이럴게바꿔주세요", callback해주세요.
  // $set 연산자는 없으면 추가하고, 있다면 업데이트 합니다.
  // => { _id: 13 } 인 데이터 찾아서, 이 데이터의 {제목:수정전} 을 {제목:수정후} 로 바꿔주세요.
  db.collection("post").updateOne({ _id: parseInt(요청.body.id) }, { $set: { 제목: 요청.body.title, 날짜: 요청.body.title } }, (에러, 결과) => {
    // redirect로 특정 페이지로 보냅니다.
    응답.redirect("/list");
  });
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

// 230106 21:00 회원가입 기능은 passport 아래에 위치
app.post("/register", (요청, 응답) => {
  // id가 이미 있는지 확인
  // id에 앞파벳 숫자만 들어있는지
  // 비밀번호 저장 전에 암호화
  db.collection("login").findOne({ id: 요청.body.id }, (에러, 결과) => {
    if (결과) {
      응답.redirect("/login");
    } else {
      db.collection("login").insertOne({ id: 요청.body.id, pw: 요청.body.password }, (에러, 결과) => {
        응답.redirect("/");
      });
    }
  });
});

// router 가져다 쓰는 방법 use middleware를 이용합니다.
// '/shop'경로로 접속하면 router middleware를 실행합니다.
app.use("/shop", require("./routes/shop.js"));
app.use("/board/sub", require("./routes/board.js"));

// npm i multer 파일 전송을 도와주는 라이브러리 설치
const multer = require("multer");

// 이미지 메모리에 저장하기 (휘발성)
// const storage = multer.memoryStorage

// 이미지 하드에 저장하기
// public폴더 안에 image폴더를 만들어 이곳에 저장합니다.
const storage = multer.diskStorage({
  // 이미지 저장 경로 설정: ./public/image
  destination: (request, file, callback) => {
    callback(null, "./public/image");
  },
  // 파일명 설정: 원본 파일명으로
  filename: (request, file, callback) => {
    callback(null, file.originalname);
    // 날짜 넣고싶으면
    // callback(null, file.originalname + "날짜" + new Date());
  },
  // 이미지 확장자 제한
  fileFilter: function (request, file, callback) {
    var extension = path.extname(file.originalname);
    if (extension !== ".png" && extension !== ".jpg" && extension !== ".jpeg") {
      return callback(new Error("PNG, JPG, JPEG 만 업로드 됨"));
    }
    callback(null, true);
  },
  // 이미지 사이즈 제한 1024*1024는 1MB
  // limits: {
  //   fileSize: 1024 * 1024,
  // },
});

const upload = multer({ storage: storage });

// 이미지는 일반하드에 저장하는 것이 싸고 편하기 때문에 DB에 저장은 하지 않는 편
app.get("/upload", (요청, 응답) => {
  응답.render("upload.ejs");
});

// 파일은 하나 업로드
// app.post("/upload", upload.single("input의 name 속성이름"), (요청, 응답) => {
app.post("/upload", upload.single("profile"), (요청, 응답) => {
  응답.send("업로드 성공");
});

// 파일을 여러개 업로드하려면 single이 아니라 array, input태그에 multiple
// app.post("/upload", upload.array("profile", 10), (요청, 응답) => {
//   응답.send("업로드 성공");
// });

// 업로드한 이미지 보여주기는 파라미터 문법을 써서
app.get("/image/:imageName", (요청, 응답) => {
  // __dirname은 현재 server.js 파일이 있는 경로
  응답.sendFile(__dirname + "/public/image/" + 요청.params.imageName);
});

// MulterError: Unexpected field 에러가 발생한 원인은
// input의 name property와 upload.single("") 의 값이 다를 경우
// 그런데 한글 썼더니 오류납니다. 영어 씁시다.
