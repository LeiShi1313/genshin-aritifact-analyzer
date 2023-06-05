const axios = require("axios");
const fs = require("fs");
const util = require('util');
const stream = require('stream');

const finished = util.promisify(stream.finished);

const download_image = async (url, image_path) => {
    const writer = fs.createWriteStream(image_path);
    const response = axios({
        url,
        responseType: "stream",
    })
    if (response.status !== 200) {
        throw new Error(`Failed to download ${url}`);
    }
    response.data.pipe(writer)
    return new Promise((resolve, reject) => {
        let error = null;
        writer.on("error", (err) => {
            error = err;
            writer.close();
            reject(err);
        });
        writer.on("close", () => {
            if (!error) {
                resolve(true);
            }
        });
    });
}

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