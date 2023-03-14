import TelegramBot from 'node-telegram-bot-api';
import { upload } from './commands.js';
import { generate_file_json, gen_json, token, commit_and_push } from './helper.js';
import { exec } from 'child_process';

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

    bot.onText(upload, (msg, match) => {
        const chatId = msg.chat.id;
        const args = match[1].split(' ');
        const device_name = args[0];
        const download_url = args[1];
        const changelog_device = args[2];
        const photo = args[3];
        if(device_name == null || download_url == null){
            bot.sendMessage(chatId, "Missing arguments");
            bot.sendMessage(chatId, "Usage: /upload device_name download_url changelog_device(optional) phone_image_url");
        }else {
            try {
                const json = gen_json(device_name, download_url, changelog_device, photo);
                generate_file_json(json, device_name);
                const commit = commit_and_push(device_name);
                bot.sendMessage(chatId, "Device updated successfully");
            } catch (error) {
                console.error(error)
                bot.sendMessage(chatId, "Error during uploading update to git")
            }

        }
    });


    // Listen for any kind of message. There are different kinds of
    // messages.
    bot.on('message', (msg, match) => {
        const chatId = msg.chat.id;
        if(msg.text == "/upload")
            bot.sendMessage(chatId, "Usage: /upload device_name download_url changelog_device(optional) phone_image_url");
    });
}

main();