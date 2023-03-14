import fs from 'fs';
import { exec } from 'child_process';

export const admin = ["Andreock", "travarilo"];

export function token() {
    const file_raw = fs.readFileSync("config.json", "utf8" );
    const parsed = JSON.parse( file_raw );
    return parsed.token;
}

export function gen_json(filename, download, changelog_device) {
    let version = download.split("/")[download.split("/").length - 2].split(".")[0];
    return {
        file: filename,
        download_url: download,
        "changelog_device": changelog_device,
        "version": version,
    }
}

export function generate_file_json(json, device_name){
    fs.writeFileSync("./bananadroid_devices/" + device_name + ".json", JSON.stringify(json));
}

export function commit_and_push(device) {
    exec(`cd bananadroid_devices && git pull && git add . && git commit -m "update ${device}" && git push`, (error, stdout, stderr) => {
        if (error) {
            console.log(error);
            return false;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return false;
        }
        return true;
    });
}