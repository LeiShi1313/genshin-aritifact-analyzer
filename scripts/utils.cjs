const fs = require("fs");
const util = require('util');
const stream = require('stream');
const axios = require('axios').default;

const finished = util.promisify(stream.finished);

const download_image = async (url, image_path) => {
    try {
        const response = await axios.get(url, { responseType: 'stream',});
        const writer = fs.createWriteStream(image_path, { flags: 'w' });
        response.data.pipe(writer);
        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (err) {
        console.error(`Failed to download ${url}`);
        throw err;
    }
}

const download_from_amber = async (resource_name, type, image_path) => {
    console.log(`Downloading ${resource_name} from amber`);
    let url;
    if (type === 'artifact') {
        url = `https://api.ambr.top/assets/UI/reliquary/${resource_name}`;
    } else {
        url = `https://api.ambr.top/assets/UI/${resource_name}`;
    }
    return download_image(url, image_path);
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
exports.download_from_amber = download_from_amber;
exports.lngToRegion = lngToRegion;