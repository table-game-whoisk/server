import express, { RequestHandler } from "express";
import path from "path";
import { UserCache } from "../cache/user";
import multiparty, { Form } from "multiparty";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import tunnel from "tunnel";

const router = express.Router();

class Room {
  test: RequestHandler = async (req, res, next) => {
    try {
      res.sendFile(path.resolve(__dirname, "../IM/ws.html"));
    } catch (e) {
      next(e);
    }
  };
  upload: RequestHandler = async (req, res, next) => {
    try {
      const token = UserCache.token;
      let form = new multiparty.Form();

      const agent = tunnel.httpsOverHttp({
        proxy: {
          host: "213.52.102.32",
          port: 10800
        }
      });

      form.parse(req, function (err, fields, files) {
        try {
          const img = files.img[0];
          if (img.size > 4 * 1024 * 1024) {
            res.json({ msg: "上传失败" });
          }
          const data = new FormData();
          data.append("smfile", fs.createReadStream(img.path));
          data.append("format", "json");

          axios
            .post("https://sm.ms/api/v2/upload", data, {
              headers: {
                Authorization: token,
                "Content-Type": "multipart/form-data"
              },
              httpsAgent: agent,
              proxy: false // 设置axios不要自动检测命令行代理设置
            })
            .then(({ data }) => {
              res.json(data.data);
            })
            .catch((e) => {
              res.json({ msg: "上传失败" });
            });
        } catch (err) {
          console.log(err);
          res.json({ msg: "上传失败" });
        }
      });
    } catch (e) {
      next(e);
    }
  };
}

export const room = new Room();

router.get("/test", room.test);
router.post("/upload", room.upload);

export default router;
