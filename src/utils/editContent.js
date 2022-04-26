const fs = require("fs");
const path = require("path");
const queryStr = /^- \[\[flomo\]\]/;
const testStr = `
- [[flomo]]
    - 内容
`;
replaceContent("test", queryStr, testStr);

function replaceContent(filePath, sourceRegx, targetStr) {
  let replaceFile = function (filePath, sourceRegx, targetStr) {
    fs.readFile(filePath, "utf-8", function (err, data) {
      if (err) {
        console.log("err", err);
        return err;
      }
      console.log("data", data);
      let str = data.toString();
      console.log("sourceRegx.test(str)", sourceRegx.test(str)); //true
      let hasFlomo = sourceRegx.test(str);
      if (hasFlomo) {
        str = str.replace(sourceRegx, targetStr);
      } else {
        str = str+ targetStr;
      }
      fs.writeFileSync(filePath, str, function (err) {
        if (err) return err;
      });
    });
  };

  //遍历test文件夹
  fs.readdir("../" + filePath + "", function (err, files) {
    if (err) {
      console.log("err", err);
      return err;
    }
    if (files.length != 0) {
      files.forEach((item) => {
        let path = "../" + filePath + "/" + item;
        //判断文件的状态，用于区分文件名/文件夹
        fs.stat(path, function (err, status) {
          if (err) {
            return err;
          }
          let isFile = status.isFile(); //是文件
          let isDir = status.isDirectory(); //是文件夹

          if (isFile) {
            replaceFile(path, sourceRegx, targetStr);
            console.log("修改路径为:" + path + "文件成功");
          }

          if (isDir) {
            console.log("文件夹：" + item);
          }
        });
      });
    }
  });
}
