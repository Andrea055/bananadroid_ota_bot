import TelegramBot from 'node-telegram-bot-api';
import { upload, photo, grant } from './commands.js';
import { generate_file_json, gen_json, token, commit_and_push, admin } from './helper.js';
import { exec } from 'child_process';
import fs from 'fs';
import https from 'https';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()

async function main() {

    try {
        exec("git clone https://github.com/bananadroid-devices/bananadroid_devices.git", (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
        });
    } catch (error) {
        console.log(error)
    }



    // Create a bot that uses 'polling' to fetch new updates
    const bot = new TelegramBot(await token(), { polling: true });

    bot.onText(upload, async (msg, match) => {
        const chatId = msg.chat.id;
        if(await prisma.manteiner.findFirst({where: {
            Name: msg.chat.username
        }}) != null) {
            const args = match[1].split(' ');
            const device_name = args[0];
            const download_url = args[1];
            const changelog_device = args[2];
            if (device_name == null || download_url == null || changelog_device == null) {
                bot.sendMessage(chatId, "Usage: /upload device_name download_url changelog_device");
            } else {
                try {
                    const json = gen_json(device_name, download_url, changelog_device);
                    generate_file_json(json, device_name);
                    commit_and_push(device_name);
                    bot.sendMessage(chatId, "Device updated successfully");
                } catch (error) {
                    console.error(error)
                    bot.sendMessage(chatId, "Error during uploading update to git")
                }
            }
        }else {
            bot.sendMessage(chatId, "User is not present in mantainer DB");
        }

    });

    bot.onText(photo, (msg, match) => {
        const chatId = msg.chat.id;
        const args = match[1].split(' ');
        const device = args[0];
        const photo = args[1];
        if (device == null || photo == null) {
            bot.sendMessage(chatId, "Usage: /set_device_photo device_name photo_url");
        } else {
            try {
                if(photo.split("/")[photo.split("/").length - 1].split(".")[photo.split("/")[photo.split("/").length - 1].split(".").length - 1] == "png"){
                    const file = fs.createWriteStream("bananadroid_devices/photos/" + device + ".png");
                    const request = https.get(photo, function (response) {
                        response.pipe(file);
        
                        // after download completed close filestream
                        file.on("finish", () => {
                            commit_and_push(device)
                            bot.sendMessage(chatId, "Photo uploaded successfully")
                        });
                    });
                }else {
                    bot.sendMessage(chatId, "Photo is not a png");
                }
            }catch (exception) {
                console.log(exception)
                bot.sendMessage(chatId, "Error during upload to git");
            }
        }
    });

    bot.onText(grant, async (msg, match) => {
        const chatId = msg.chat.id;
        try {
            if(admin.indexOf(msg.chat.username) != -1) {
                const mantainer = match[1];
                await prisma.manteiner.create({
                    data: {
                        Name: mantainer.substring(1)
                    }
                })
                bot.sendMessage(chatId, "Permission granted!");
            }else {
                bot.sendMessage(chatId, "You can't do this!")
            }
        }catch (exception) {
            bot.sendMessage(chatId, "User already present in DB");
        }
    });

    // Listen for any kind of message. There are different kinds of
    // messages.
    bot.on('message', (msg, match) => {
        const chatId = msg.chat.id;
        if (msg.text == "/upload")
            bot.sendMessage(chatId, "Usage: /upload device_name download_url changelog_device");
        else if(msg.text == "/set_device_photo"){
            bot.sendMessage(chatId, "Usage: /set_device_photo device_name photo_url(must be PNG)")
        } else if(msg.text == "/grant"){
            bot.sendMessage(chatId, "Usage: /grant Username")
        }
    });
}

main();