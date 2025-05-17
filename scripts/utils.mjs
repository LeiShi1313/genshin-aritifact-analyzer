import fs from "fs";
import axios from 'axios';

Object.defineProperty(String.prototype, 'capitalize', {
    value: function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    },
    enumerable: false
});

export const download_image = async (url, image_path) => {
    try {
        const response = await axios.get(url, { responseType: 'stream', timeout: 5000 });
        const writer = fs.createWriteStream(image_path, { flags: 'w' });
        response.data.pipe(writer);
        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
        return true;
    } catch (err) {
        console.error(`Failed to download ${url}: ${err.message}`);
        return false;
    }
}

export const download_from_amber = async (resource_name, type, image_path) => {
    console.log(`Downloading ${resource_name} from amber`);
    let url;
    if (type === 'artifact') {
        url = `https://gi.yatta.top/assets/UI/reliquary/${resource_name}`;
    } else {
        url = `https://gi.yatta.top/assets/UI/${resource_name}`;
    }
    return download_image(url, image_path);
}


export const download_from_yuheng = async (resource_name, type, image_path) => {
    console.log(`Downloading ${resource_name} from yuheng`);
    let url;
    if (type === 'artifact') {
        url = `https://homdgcat.wiki/homdgcat-res/Relic/${resource_name}.png`;
    } else if (type ==='gacha') {
        url = `https://homdgcat.wiki/homdgcat-res/Gacha/${resource_name}.png`;
    } else {
        url = `https://homdgcat.wiki/homdgcat-res/Avatar/${resource_name}.png`;
    }

    return download_image(url, image_path);
}

const get_from_amber = async (url) => {
    const response = await axios.get(url);
    if (response.status !== 200) {
        console.error(`Failed to fetch artifact from amber: ${response.status}`);
        return null;
    } else if (response.data.response !== 200) {
        console.error(`Failed to fetch artifact from amber: ${response.data.response}`);
        return null;
    } else if (response.data?.data?.items === undefined) {
        console.error(`Failed to fetch artifact from amber: ${response.data.data.items}`);
        return null;
    }
    return response.data.data.items;
}

export const get_artifact_from_amber = async () => {
    console.log("Fetching artifact from amber");
    return get_from_amber("https://gi.yatta.top/api/v2/en/reliquary");
}

export const get_weapon_from_amber = async () => {
    console.log("Fetching weapon from amber");
    return get_from_amber("https://gi.yatta.top/api/v2/en/weapon");
}

export const get_character_from_amber = async () => {
    console.log("Fetching character from amber");
    return get_from_amber("https://gi.yatta.top/api/v2/en/avatar");
}

const update_local_data = async (filePath, remoteData, remoteDataReader) => {
    try {
        // Read existing local data
        let localData = readNamesFromFile(filePath);

        // Merge remote data with local data, keeping local data if it exists
        const newData = Object.values(remoteData).filter(item => !localData.includes(remoteDataReader(item))).map(remoteDataReader);
        const mergedData = [...localData, ...newData];
        console.log(`newData: ${newData}`);
        console.log(`localData: ${localData.length}, remoteData: ${Object.values(remoteData).length}, newData: ${newData.length}, mergedData: ${mergedData.length}`);
        // Write merged data back to file
        const writeStream = fs.createWriteStream(filePath, { flags: 'w' });
        for (const item of mergedData) {
            writeStream.write(item + '\n');
        }
        writeStream.end();

        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });
        console.log(`Updated local data in ${filePath}`);
    } catch (error) {
        console.error(`Error updating local data: ${error.message}`);
    }
};

export const update_artifact_data = async (filePath) => {
    const remoteData = await get_artifact_from_amber();
    if (!remoteData) {
        console.error("Failed to fetch remote artifact data");
        return;
    }
    return update_local_data(filePath, remoteData, (item) => item.name);
}

export const update_weapon_data = async (filePath) => {
    const remoteData = await get_weapon_from_amber();
    if (!remoteData) {
        console.error("Failed to fetch remote weapon data");
        return;
    }
    return update_local_data(filePath, remoteData, (item) => item.name.replace(/\"/g, ''));
}

export const update_character_data = async (filePath) => {
    const remoteData = await get_character_from_amber();
    if (!remoteData) {
        console.error("Failed to fetch remote character data");
        return;
    }
    return update_local_data(filePath, remoteData, (item) => {
        if (item.name !== "Traveler") return item.name;
        return "Traveler " + item.id.split("-")[1].capitalize();
    });
}

export const readNamesFromFile = (filePath) => {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        return content.split('\n').filter(line => line.trim() !== '');
    } catch (error) {
        console.error(`Error reading file: ${error.message}`);
        return [];
    }
};

export const lngToRegion = {
    'CHS': 'zh',
    'CHT': 'zh-Hant',
    'Japanese': 'ja',
    'Korean': 'ko',
    'Spanish': 'es',
    'French': 'fr',
    'German': 'de',
}
