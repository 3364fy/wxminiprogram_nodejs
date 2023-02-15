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
const request = require('request-promise');
app.post("/api/openai", async (req,res)=>{
  var messege=req.body.messege
  const options = {
    method: "POST",
    url: "https://api.openai.com/v1/completions",
    headers: {
      "Authorization": "Bearer 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",
      "Content-Type": "application/json",
      "content-type": "application/json"
    },
    json: {"prompt": `you：${messege} AI：`, "max_tokens": 2080, "model":"text-davinci-003" },
    timeout: 60000
  };
  let a=await request(options).then(res=>{return res.choices[0].text}).catch(err=>{return err})
  res.send({
      data:a
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
