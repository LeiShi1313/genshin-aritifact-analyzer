const axios = require("axios");
const fs = require("fs");

const download_image = (url, image_path) =>
    axios({
        url,
        responseType: "stream",
    })
        .then(
            (response) =>
                new Promise((resolve, reject) => {
                    response.data
                        .pipe(fs.createWriteStream(image_path))
                        .on("finish", () => resolve())
                        .on("error", (e) => reject(e));
                })
        )
        .catch((e) => {
            console.log(`error downloading ${url}: ${e}`);
            // console.log("url is: " + url);
        });

const lngToRegion = {
    'CHS': 'zh',
    'CHT': 'zh-Hant',
    'Japanese': 'ja',
    'Korean': 'ko',
    'Spanish': 'es',
    'French': 'fr',
    'German': 'de',    
}
        
exports.download_image = download_image;
exports.lngToRegion = lngToRegion;