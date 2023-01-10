const fs = require("fs");
const { parse } = require("csv-parse");
const genshindb = require("genshin-db");

const subList = [
    /* ATK_PERCENT */ 7,
    /* HP_PERCENT */ 6,
    /* DEF_PERCENT */ 8,
    /* ELEMENTAL_MASTERY */ 4,
    /* ENERGY_RECHARGE */ 5,
    /* CRIT_RATE */ 9,
    /* CRIT_DAMAGE */ 10,
]
const attrMap = {
    '攻': [7],
    '生': [6],
    '防': [8],
    '精': [4],
    '充': [5],
    '双暴': [9, 10],
    '暴伤': [10],
    '暴率': [9],
    '治': [11],
    '雷': [15],
    '冰': [13],
    '火': [19],
    '水': [17],
    '风': [12],
    '岩': [16],
    '草': [14],
    '物': [18],
}

const setMap = {
    "魔女": 6,
    "追忆": 32,
    "攻击2": 32,
    "绝缘": 11,
    "宗室": 22,
    "少女": 20,
    "乐团": 40,
    "千岩": 33,
    "水套": 16,
    "角斗士": 15,
    "海染": 23,
    "精通2": 40,
    "风套": 39,
    "辰砂": 38,
    "冰风": 3,
    "苍白": 24,
    "骑士": 4,
    "如雷": 35,
    "饰金": 14,
    "磐岩": 1,
    "华馆": 17,
    "草套": 7
}

const characterMap = {
    "迪卢克": 14,
    "胡桃": 19,
    "宵宫": 46,
    "可莉": 25,
    "香菱": 41,
    "班尼特": 12,
    "烟绯": 45,
    "托马": 39,
    "安柏": 9,
    "辛焱": 44,
    "夜兰": 54,
    "绫人": 53,
    "心海": 35,
    "公子": 38,
    "莫娜": 28,
    "行秋": 43,
    "芭芭拉": 10,
    "温迪": 40,
    "万叶": 21,
    "魈": 42,
    "琴": 20,
    "砂糖": 37,
    "早柚": 36,
    "鹿野院": 56,
    "甘雨": 18,
    "绫华": 23,
    "申鹤": 50,
    "优菈": 16,
    "七七": 31,
    "重云": 13,
    "罗莎": 34,
    "凯亚": 22,
    "迪奥娜": 15,
    "雷神": 32,
    "八重": 52,
    "赛诺": 61,
    "刻晴": 24,
    "皇女": 17,
    "九条": 26,
    "雷泽": 33,
    "北斗": 11,
    "丽莎": 27,
    "久岐忍": 55,
    "多莉": 58,
    "钟离": 47,
    "凝光": 29,
    "一斗": 49,
    "阿贝多": 7,
    "云堇": 51,
    "诺艾尔": 30,
    "五郎": 48,
    "提纳里": 59,
    "科莱": 57,
    "草神": 63,
}

const mapSuit = (sets) => {
    if (sets.length === 1) return [{ setCombos: [{ set: setMap[sets[0]], count: 4 }] }];
    else if (sets.length === 2) return [{ setCombos: [{ set: setMap[sets[0]], count: 2 }, { set: setMap[sets[1]], count: 2 }] }];
}

const builds = []
fs.createReadStream("../config/build.csv")
    .pipe(parse({ delimiter: ",", from_line: 2 }))
    .on("data", function (row) {
        if (row.every((e) => !e)) return;
        const rawBuild = {
            character: characterMap[row[0]],
            name: row[1],
            suits: mapSuit(row.slice(2, 4).filter((set) => set)),
            weapons: [],
            flowerAttributes: [1],
            plumeAttributes: [2],
            sandsAttributes: attrMap[row[4]],
            gobletAttributes: attrMap[row[5]],
            circletAttributes: attrMap[row[6]],
            subAttributes: row.slice(7, 14).map((attr, idx) => attr !== '' ? { type: subList[idx], value:1} : null).filter((e) => e),
        }
        builds.push(rawBuild);
        // console.log(JSON.stringify(rawBuild));
    })
    .on("end", function () {
        console.log(JSON.stringify(builds));
    });
// genshindb.weapons('names', { matchCategories: true }).map((e) => {
//     console.log(`"${e}",`);
// })
