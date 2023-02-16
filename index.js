const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { init: initDB, Counter } = require("./db");

const logger = morgan("tiny");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(logger);

// 首页
app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 更新计数
app.post("/api/count", async (req, res) => {
  const { action } = req.body;
  if (action === "inc") {
    await Counter.create();
  } else if (action === "clear") {
    await Counter.destroy({
      truncate: true,
    });
  }
  res.send({
    code: 0,
    data: await Counter.count(),
    req:req.body
  });
});

//访问openAI
var axios = require("axios").default;
const instance = axios.create({
  timeout: 50000 // 设置超时时间为50秒
});

app.post("/api/openai", async (req,res)=>{
  var messege=req.body.messege
  console.log(req.body)
  logger(messege)
  var options = {
    method: 'POST',
    url: 'https://api.openai.com/v1/completions',
    headers: {
      Authorization: 'Bearer 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',
      'Content-Type': 'application/json',
      'content-type': 'application/json'
    },
    data: {prompt: `you：${messege} AI：`, max_tokens: 400, model: 'text-davinci-003', stop: ''},
  };

  instance.request(options).then(function (response) {
    res.send({
      data:response.data.choices[0].text
    }).catch(err=>{
      res.send({
        data:err
      })
    })
  })

})


app.get("/api/openai1", async (req,res)=>{
  var options = {
    method: 'POST',
    url: 'https://api.openai.com/v1/completions',
    headers: {
      Authorization: 'Bearer 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',
      'Content-Type': 'application/json',
      'content-type': 'application/json'
    },
    data: {prompt: `you：你好 AI：`, max_tokens: 400, model: 'text-davinci-003', stop: ''},
  };

  instance.request(options).then(function (response) {
    res.send({
      data:1
    }).catch(err=>{
      res.send({
        data:err
      })
    })
  })

})

// 获取计数
app.get("/api/count", async (req, res) => {
  // const result = await Counter.count();
  res.send({
    code: 0,
    data: 5,
  });
});

// 小程序调用，获取微信 Open ID
app.get("/api/wx_openid", async (req, res) => {
  if (req.headers["x-wx-source"]) {
    res.send(req.headers["x-wx-openid"]);
  }
});

const port = process.env.PORT || 80;

async function bootstrap() {
  await initDB();
  app.listen(port, () => {
    console.log("启动成功", port);
  });
}

bootstrap();
