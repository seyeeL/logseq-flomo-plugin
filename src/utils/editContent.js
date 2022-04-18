var fs = require("fs");
var path = require("path");

replaceContent("test", "8888", "<p>666<p>");

function replaceContent(filePath, replacement, substitutes) {
    
    let replaceFile = function (filePath, sourceRegx, targetStr) {
        fs.readFile(filePath,'utf-8', function (err, data) {
            if (err) {
                console.log('err',err);
                return err;
            }
            console.log('data',data);
            let str = data.toString();
            
            str = str.replace(sourceRegx, targetStr);
            fs.writeFileSync(filePath, str, function (err) {
                if (err) return err;
            });
        });
    };

    //遍历test文件夹
    fs.readdir("../" + filePath + "", function (err, files) {
        if (err) {
            console.log('err',err);
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
                        replaceFile(path, replacement, substitutes);
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