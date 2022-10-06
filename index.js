const express = require("express");
const cors = require("cors");
const app = express();
const models = require("./models");
const multer = require("multer");
const port = "8080";

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  }),
});

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

// req -> 요청 / res -> 응답

app.get("/products", (req, res) => {
  // order -> 데이터 베이스의 정렬순서 설정가능
  models.Product.findAll({
    order: [["id", "DESC"]], //ASC
    attributes: ["id", "name", "price", "seller", "description", "imageUrl", "createdAt"],
  })
    .then((result) => {
      res.send({
        product: result,
      });
    })
    .catch((error) => {
      console.error(error);
      res.send("에러 발생");
    });
});

app.get("/products/:id", (req, res) => {
  const params = req.params;
  const { id } = params;
  models.Product.findOne({ where: { id: id } })
    .then((result) => {
      console.log("product:", result);
      res.send({ product: result });
    })
    .catch((error) => {
      console.error(error);
      res.send("상품조회시 에러가 발생했습니다");
    });
});

app.post("/image", upload.single("image"), function (req, res) {
  const file = req.file;
  console.log(file);
  res.send({
    imageUrl: file.path,
  });
});

app.post("/products", (req, res) => {
  const body = req.body;
  const { name, price, seller, description, imageUrl } = body;
  if (!name || !price || !seller || !description) {
    res.send("모든 필드를 입력해주세요");
  }
  // models 뒤에 Product 값은 products.js 에 const products = sequelize.define 에 있는 Product 의 이름을 가져옴 (똑같이 작성해야함)
  models.Product.create({ name, price, seller, description, imageUrl })
    .then((result) => {
      console.log("상품생성결과", result);
      res.send({ result });
    })
    .catch((error) => {
      console.log(error);
      res.send("상품업로드에 문제가 발생했습니다");
    });
});

app.post("/login", (req, res) => {
  res.send("로그인해주세요.");
});

app.listen(port, () => {
  console.log("망고샵의 서버가 돌아가고 있습니다.");
  models.sequelize
    .sync()
    .then(() => {
      console.log("DB 연결 성공");
    })
    .catch((err) => {
      console.error(err);
      console.log("DB 연결 실패");
      process.exit();
    });
});
