//#region 變數
const { MessageEmbed, GuildMember } = require('discord.js');
const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const fs = require('fs');
const fetch = require('node-fetch');
const axios = require('axios')
//#endregion

let ver = "21w46-rc1"
let debug = "" //請勿更改

//#region 變數宣告區域
let config_path = "./Json/config.json"
let err = ""
let consolechannel = ""
let config_json
let beta = ""
//#endregion

//#region 初始化文件檢測
fs.readFile(config_path, function (error, data) {
    if (error) {
        if (error.errno == -4058) {
            fetch('http://exptech.mywire.org/config.json')
                .then(function (res) {
                    return res.json();
                }).then(function (json) {
                    fs.writeFile(config_path, JSON.stringify(json), (err) => {
                    })
                })
        }
    }
})
//#endregion

//#region 初始化
fs.readFile(config_path, function (error, data) {
    if (error) {
        err = err + ":name_badge: config 文件讀取錯誤\n"
        E_error("Error: config 文件讀取錯誤", error)
    } else {
        config_json = JSON.parse(data.toString());
        if (config_json["token"] != "") {
            if (config_json["console"] != "") {
                consolechannel = config_json["console"]
                API = config_json["API_URL"]
                client.login(config_json["token"])
            } else {
                err = err + ":name_badge: console 值為空\n"
                E_error("Error: console 值為空")
            }
        } else {
            err = err + ":name_badge: token 值為空\n"
            E_error("Error: token 值為空")
        }
    }
})
//#endregion

//#region 初始化完成
client.on('ready', () => {
    if (debug == "1") {
        C_send(consolechannel, ":closed_lock_with_key: 檢測到非正式版本 為確保數據安全已終止進程 - " + ver);
        console.log('\x1b[31m', "Warn: 非正式版本 版本: " + ver, '\x1b[0m')
        C_send(consolechannel, ":octagonal_sign: Warn: 非正式版本 版本: " + ver)
        STOP()
    } else {
        if (err == "") {
            C_send(consolechannel, ":white_check_mark: 機器人成功啟動 - " + ver);
        } else if (err == "Update") {
            C_send(consolechannel, ":warning: 機器人已啟動 版本: " + ver + "\n:name_badge: 配置文件須更新 請使用 Update 完成更新");
            err = ""
        } else {
            C_send(consolechannel, ":warning: 機器人已啟動 版本: " + ver + "\n:name_badge: 啟動過程拋出異常 試著使用 Reload 來定位錯誤");
        }
        if (beta != "") C_send(consolechannel, ":satellite: 已啟用 Beta 功能 可能導致崩潰 請留意\n" + beta);
        console.log('\x1b[32m', `使用身份 ${client.user.tag} 登入 版本: ` + ver + "\n\n 如需更改代碼請創建分支或新增拉取請求並遵守 AGPL-3.0 開源協議\n\n GitHub: https://github.com/ExpTech-tw/Discord-Bot-Public", '\x1b[0m');
    }
});
//#endregion

//#region 訊息處理區域
client.on('messageCreate', message => {
    try {
        if (message.author.bot == true) return

        if (message.content == "簽到" || message.content == "签到") {
            axios
                .post(API, 'API=' + config_json["API_KEY"] + '&&function=minecraft-economy-sign&&user=' + message.author.id + '&&group=' + message.guild.id + '&&server=' + message.guild.name + '&&name=' + message.member.displayName)
                .then(res => {
                    if (res.data["response"] == "Success") {
                        message.reply(":white_check_mark: 簽到成功 積分 +" + res.data["data"])
                    } else if (res.data["response"] == "Different") {
                        message.reply(":name_badge: 簽到失敗 你無法在此伺服器簽到")
                    } else {
                        message.reply(":name_badge: 簽到失敗 今日無法再簽到")
                    }
                })
                .catch(error => {
                    E_error(":name_badge: Error: 3-5-0016", error)
                })
        }

        if (message.content.startsWith("$price")) {
            axios
                .post(API, 'API=' + config_json["API_KEY"] + '&&function=minecraft-economy-price&&group=' + message.guild.id + '&&msg=' + message.content + '&&user=' + message.author.id)
                .then(res => {
                    if (res.data["state"] == "Success") {
                        if (res.data["response"] == "undefined") {
                            message.reply(":name_badge: 查無此類型硬幣")
                        } else {
                            message.reply("1 " + res.data["server"] + "幣 ➝ " + res.data["data"] + " 積分")
                        }
                    } else {
                        E_error(":name_badge: Error: 3-5-0016", error)
                    }
                })
                .catch(error => {
                    E_error(":name_badge: Error: 3-5-0016", error)
                })
        }

        if (message.content.startsWith("$buy")) {
            axios
                .post(API, 'API=' + config_json["API_KEY"] + '&&function=minecraft-economy-buy&&group=' + message.guild.id + '&&msg=' + message.content + '&&user=' + message.author.id + '&&name=' + message.member.displayName)
                .then(res => {
                    if (res.data["state"] == "Success") {
                        if (res.data["response"] == "undefined") {
                            message.reply(":name_badge: 查無此類型硬幣")
                        } else if (res.data["response"] == "insufficient") {
                            message.reply(":name_badge: 未符合交易條件\n\n交易金額: " + res.data["total"] + "\n價格: 1" + res.data["server"] + "幣 ➝ " + res.data["data"] + " 積分\n\n我的硬幣: " + res.data["Coin"] + "\n我的積分: " + res.data["Integral"] + "\n\n" + res.data["server"] + "持有硬幣: " + res.data["coin"] + "\n" + res.data["server"] + "持有積分: " + res.data["integral"])
                        } else if (res.data["response"] == "Server insufficient") {
                            message.reply(":name_badge: 伺服器 未符合交易條件\n\n交易金額: " + res.data["total"] + "\n價格: 1" + res.data["server"] + "幣 ➝ " + res.data["data"] + " 積分\n\n我的硬幣: " + res.data["Coin"] + "\n我的積分: " + res.data["Integral"] + "\n\n" + res.data["server"] + "持有硬幣: " + res.data["coin"] + "\n" + res.data["server"] + "持有積分: " + res.data["integral"])
                        } else if (res.data["response"] == "Not data found") {
                            message.reply(":name_badge: 查無玩家數據 試著使用 [簽到] 建立數據")
                        } else {
                            message.reply(":white_check_mark: 交易成功\n\n交易金額: " + res.data["total"] + "\n價格: 1" + res.data["server"] + "幣 ➝ " + res.data["data"] + " 積分\n\n我的硬幣: " + res.data["Coin"] + "\n我的積分: " + res.data["Integral"] + "\n\n" + res.data["server"] + "持有硬幣: " + res.data["coin"] + "\n" + res.data["server"] + "持有積分: " + res.data["integral"])
                        }
                    } else {
                        E_error(":name_badge: Error: 3-5-0016", error)
                    }
                })
                .catch(error => {
                    E_error(":name_badge: Error: 3-5-0016", error)
                })
        }

        if (message.content.startsWith("$sell")) {
            axios
                .post(API, 'API=' + config_json["API_KEY"] + '&&function=minecraft-economy-sell&&group=' + message.guild.id + '&&msg=' + message.content + '&&user=' + message.author.id + '&&name=' + message.member.displayName)
                .then(res => {
                    if (res.data["state"] == "Success") {
                        if (res.data["response"] == "undefined") {
                            message.reply(":name_badge: 查無此類型硬幣")
                        } else if (res.data["response"] == "insufficient") {
                            message.reply(":name_badge: 未符合交易條件\n\n交易金額: " + res.data["total"] + "\n價格: 1" + res.data["server"] + "幣 ➝ " + res.data["data"] + " 積分\n\n我的硬幣: " + res.data["Coin"] + "\n我的積分: " + res.data["Integral"] + "\n\n" + res.data["server"] + "持有硬幣: " + res.data["coin"] + "\n" + res.data["server"] + "持有積分: " + res.data["integral"])
                        } else if (res.data["response"] == "Server insufficient") {
                            message.reply(":name_badge: 伺服器 未符合交易條件\n\n交易金額: " + res.data["total"] + "\n價格: 1" + res.data["server"] + "幣 ➝ " + res.data["data"] + " 積分\n\n我的硬幣: " + res.data["Coin"] + "\n我的積分: " + res.data["Integral"] + "\n\n" + res.data["server"] + "持有硬幣: " + res.data["coin"] + "\n" + res.data["server"] + "持有積分: " + res.data["integral"])
                        } else if (res.data["response"] == "Not data found") {
                            message.reply(":name_badge: 查無玩家數據 試著使用 [簽到] 建立數據")
                        } else {
                            message.reply(":white_check_mark: 交易成功\n\n交易金額: " + res.data["total"] + "\n價格: 1" + res.data["server"] + "幣 ➝ " + res.data["data"] + " 積分\n\n我的硬幣: " + res.data["Coin"] + "\n我的積分: " + res.data["Integral"] + "\n\n" + res.data["server"] + "持有硬幣: " + res.data["coin"] + "\n" + res.data["server"] + "持有積分: " + res.data["integral"])
                        }
                    } else {
                        E_error(":name_badge: Error: 3-5-0016", error)
                    }
                })
                .catch(error => {
                    E_error(":name_badge: Error: 3-5-0016", error)
                })
        }

        if (message.content.startsWith("$me")) {
            axios
                .post(API, 'API=' + config_json["API_KEY"] + '&&function=minecraft-economy-me&&user=' + message.author.id)
                .then(res => {
                    if (res.data["state"] == "Success") {
                        if (res.data["response"] == "Not data found") {
                            message.reply(":name_badge: 查無玩家數據 試著使用 [簽到] 建立數據")
                        } else {
                            message.reply(":white_check_mark: 查詢成功\n\n總資產: " + res.data["total"] + "\n\n我的硬幣: " + res.data["Coin"] + "\n我的積分: " + res.data["Integral"])
                        }
                    } else {
                        E_error(":name_badge: Error: 3-5-0016", error)
                    }
                })
                .catch(error => {
                    E_error(":name_badge: Error: 3-5-0016", error)
                })
        }

        if (message.content.startsWith("$rank")) {
            axios
                .post(API, 'API=' + config_json["API_KEY"] + '&&function=minecraft-economy-rank&&user=' + message.author.id)
                .then(res => {
                    message.reply(res.data["response"])
                })
                .catch(error => {
                    E_error(":name_badge: Error: 3-5-0016", error)
                })
        }

        if (message.content.startsWith("$set")) {
            axios
                .post(API, 'API=' + config_json["API_KEY"] + '&&function=minecraft-economy-set&&user=' + message.author.id + '&&group=' + message.guild.id)
                .then(res => {
                    if (res.data["state"] == "Success") {
                        if (res.data["response"] == "ServerTime") {
                            message.reply(":name_badge: 變更所屬伺服器失敗 今日無法再變更所屬伺服器")
                        } else if (res.data["response"] == "The same") {
                            message.reply(":name_badge: 變更所屬伺服器失敗 此伺服器已是你的所屬伺服器")
                        } else {
                            message.reply(":white_check_mark: 變更所屬伺服器成功 已將此伺服器設為你的所屬伺服器")
                        }
                    } else {
                        E_error(":name_badge: Error: 3-5-0016", error)
                    }
                })
                .catch(error => {
                    E_error(":name_badge: Error: 3-5-0016", error)
                })
        }

    } catch (error) {
        if (message.channel.id == consolechannel) return
        err = err + ":name_badge: Error: 4-0-0013\n"
        E_error(":name_badge: Error: 4-0-0013", error)
    }
});
//#endregion

//#region 指定頻道訊息
function C_send(id, msg) {
    try {
        client.channels.cache.get(id).send(msg);
    } catch (error) {
        E_error(":name_badge: Error: 2-0-0017", error)
    }
}
//#endregion

//#region 錯誤輸出調用
function E_error(error, info) {
    if (error == ":name_badge: Error: 3-5-0016") {
        if (API = config_json["API_URL"]) {
            API = config_json["API_URL_SPARE"]
            client.channels.cache.get(consolechannel).send(":name_badge: API 主服務器異常 已轉向備用服務器" + ver)
        } else {
            API = config_json["API_URL"]
            client.channels.cache.get(consolechannel).send(":name_badge: API 次服務器異常 已轉向主服務器" + ver)
        }
    }
    client.channels.cache.get(consolechannel).send(error + " 版本: " + ver)
    if (info != "") client.channels.cache.get(consolechannel).send(":recycle: 錯誤詳情: " + info)
}
//#endregion