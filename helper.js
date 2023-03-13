import fs from 'fs';
import { exec } from 'child_process';

export function token() {
    const file_raw = fs.readFileSync("config.json", "utf8" );
    const parsed = JSON.parse( file_raw );
    return parsed.token;
}

/*
{
    "file": filename,
    "download_url": url,
    "changelog_source": changelog_url,
    "changelog_device": changelog_device    
*/

export function gen_json(filename, download, changelog_source, changelog_device) {
    return {
        file: filename,
        download_url: download,
        "changelog_source": changelog_source,
        "changelog_device": changelog_device
    }
}

export function generate_file_json(json, device_name){
    fs.writeFileSync("./bananadroid_devices/" + device_name + ".json", JSON.stringify(json));
}

export function commit_and_push() {
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