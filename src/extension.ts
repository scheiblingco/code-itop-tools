import { existsSync, readFileSync } from 'fs';
import * as vscode from 'vscode';
import fetch from 'node-fetch';
import * as https from 'https';
const PREFIX = 'code-itop-tools.';

const OUTPUT_CHANNEL = vscode.window.createOutputChannel('iTop Tools');

function log(message: string, severity: string = 'INFO'): void {
    OUTPUT_CHANNEL.appendLine(severity + ' - ' + message);
    OUTPUT_CHANNEL.show();
}

function data2String(data: any): string {
    if (data instanceof Error) {
        return data.stack || data.message;
    }

    if (typeof data === 'string') {
        return data;
    }

    return JSON.stringify(data, null, 2);
}

function isConfigFileValid(path: string) {
    if (!existsSync(path)) return false;
    var content = "";
    try {
        var content = readFileSync(path).toString();
        if (!content || content.search("app_root_url") == -1) {
            log(content);
            return false;
        }
    }
    catch {
        return false;
    }
    log("Config file at " + path + " is valid");
    return true;
}

function getiTopURL(path: string = "") {
        
        if (isConfigFileValid(path)) {
            var content = readFileSync(path).toString();

            if (content) {
                var line = content.match(/app_root_url.{0,10}[\'\"]+(.*)[\'\"]+/);
                if (line) {
                    log(data2String("iTop URL is: " + line[1]));
                    return line[1];
                }
                return "";
            }
    }
    return "";
}

export async function askSetConfigSetting() {
    var PLUGIN_CFG = vscode.workspace.getConfiguration(PREFIX.slice(0, -1));

    const chk = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        openLabel: 'Select iTop Configuration',
    });

    if (chk) {
        isConfigFileValid(chk[0].fsPath);
        var iurl = getiTopURL(chk[0].fsPath);
        if (iurl && iurl != "") {
            log("Successfully fetched iTop URL");
            PLUGIN_CFG.update('itop-url', iurl, true);
            PLUGIN_CFG = vscode.workspace.getConfiguration(PREFIX.slice(0, -1));
            
            vscode.window.showInformationMessage("iTop URL " + iurl + " successfully configured");
        }
    }

    log(data2String(chk));
    console.log(data2String(chk));
}

export async function runGetRequest(host: string, path: string, search_reply: string, success: string = "", callbackFunction: Function = null)
{
    var PLUGIN_CFG = vscode.workspace.getConfiguration(PREFIX.slice(0, -1));

    var opts = {
        hostname: host,
        port: 443,
        path: path,
        method: "GET",
        rejectUnauthorized: PLUGIN_CFG.get('ignore-certificate-errors', false) == false,
        timeout: PLUGIN_CFG.get('timeout', 30000)
    }

    const req = await https.request(opts, (res) => {
        log('Finished get request ('+ res.statusCode +') to ' + opts['path'])

        res.on('data', (d) => {
            if (!d.includes(search_reply)) {
                log(`Get Response to ${path} failed to contain ${search_reply} as expected.\nActual response:\n${d}`)
                throw new Error(`Response Failed to contain ${search_reply} as expected.\nActual response:\n${d}`);
            }
            vscode.window.showInformationMessage(success);
            if (callbackFunction) {
                callbackFunction();
            }
        });
    });

    req.on('error', (error) => {
        log(`Response Failed`)
        vscode.window.showErrorMessage(`Response Failed: ${data2String(error)}`);
    });

    req.end();
}

export async function runPostRequest(host: string, path: string, body: string, search_reply: string, success: string)
{
    var PLUGIN_CFG = vscode.workspace.getConfiguration(PREFIX.slice(0, -1));

    var opts = {
        hostname: host,
        port: 443,
        path: path,
        method: "POST",
        body: body,
        rejectUnauthorized: PLUGIN_CFG.get('ignore-certificate-errors', false) == false,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": body.length
        },
        timeout: PLUGIN_CFG.get('timeout', 30000)
    }

    const req = https.request(opts, (res) => {
        log('Finished post request ('+ res.statusCode +') to ' + opts['path'])
        log("headers: " + JSON.stringify(res.headers));
        
        res.on('error', (error) => {
            log(`Post Response Failed`)
            vscode.window.showErrorMessage(`Post Response Failed: ${data2String(error)}`);
        });


        res.on('data', (d) => {
            if (!d.includes(search_reply)) {
                log(`Post Response to ${path} Failed to contain ${search_reply} as expected (${body}).\nActual response:\n${d}`)
                vscode.window.showErrorMessage(d);
                vscode.window.showErrorMessage('Updating datamodel failed');
                throw new Error(`Response Failed to contain ${search_reply} as expected.\nActual response:\n${d}`);
            }
            if (res.statusCode != 200) {
                log("ERROR: ");
                log(d);
            }
            
            vscode.window.showInformationMessage(success)
            vscode.window.showInformationMessage(success);
        });
    });

    req.on('error', (error) => {
        log(`Post Request Failed`)
        vscode.window.showErrorMessage(`Post Request Failed: ${data2String(error)}`);
    });
    
    req.write(body);

    req.end();
}

export async function checkDatamodel(callbackFunction: Function) {
    var PLUGIN_CFG = vscode.workspace.getConfiguration(PREFIX.slice(0, -1));

    log("Checking datamodel");
    var url = PLUGIN_CFG.get('itop-url', 'none');
    var toolkit = PLUGIN_CFG.get('toolkit-path', 'toolkit');

    if (url && toolkit && url != "" && toolkit != "") {
        url = url.replace(/\/$/, "");
        toolkit = toolkit.replace(/^\//, "").replace(/\/$/, "");
        var resurl = url + "/" + toolkit + "/" + "ajax.toolkit.php?operation=check_db_schema&rebuild_toolkit_env=true";
        log("Calling " + resurl);

        try {
            runGetRequest(
                url.replace('https://', '').replace('http://', ''),
                "/" + toolkit + "/" + "ajax.toolkit.php?operation=check_db_schema&rebuild_toolkit_env=true",
                "Compile + Update DB tables and views",
                "Validation succeeded, you can now update the datamodel",
                callbackFunction
            )
            
        }
        catch (e) {
            vscode.window.showErrorMessage("Validation failed, see log for more information")
            throw new Error(e);
        }

    }
}
export async function applyCodeChanges() {
    var PLUGIN_CFG = vscode.workspace.getConfiguration(PREFIX.slice(0, -1));

    checkDatamodel(() => {
        var url = PLUGIN_CFG.get('itop-url', 'none');
        var toolkit = PLUGIN_CFG.get('toolkit-path', 'toolkit');

        if (url && toolkit && url != "" && toolkit != "") {
            url = url.replace(/\/$/, "");
            toolkit = toolkit.replace(/^\//, "").replace(/\/$/, "");

            log("Calling " + "/" + toolkit + "/" + "ajax.toolkit.php");

            try {
                var sym = 1;
                if (PLUGIN_CFG.get('symlinks', false) == false) {
                    sym = 0;
                }
                runPostRequest(
                    url.replace('https://', '').replace('http://', ''),
                    "/" + toolkit + "/" + "ajax.toolkit.php",
                    "operation=update_code&symlink="+sym,
                    "Done!",
                    "Successfully applied code changes to iTop instance"
                )
            }
            catch (e) {
                vscode.window.showErrorMessage("Validation failed, see log for more information")
                throw new Error(e);
            }
        }
    });
}
export async function applyAllChanges() {
    var PLUGIN_CFG = vscode.workspace.getConfiguration(PREFIX.slice(0, -1));

    checkDatamodel(() => {
        var url = PLUGIN_CFG.get('itop-url', 'none');
        var toolkit = PLUGIN_CFG.get('toolkit-path', 'toolkit');

        if (url && toolkit && url != "" && toolkit != "") {
            url = url.replace(/\/$/, "");
            toolkit = toolkit.replace(/^\//, "").replace(/\/$/, "");

            log("Calling " + "/" + toolkit + "/" + "ajax.toolkit.php");

            try {
                var sym = 1;
                if (PLUGIN_CFG.get('symlinks', false) == false) {
                    sym = 0;
                }
                runPostRequest(
                    url.replace('https://', '').replace('http://', ''),
                    "/" + toolkit + "/" + "ajax.toolkit.php",
                    "operation=update_code_db&symlink="+sym,
                    "<p>Done</p>",
                    "Successfully applied code and database changes to iTop instance"
                )
            }
            catch (e) {
                vscode.window.showErrorMessage("Validation failed, see log for more information")
                throw new Error(e);
            }
        }
    }); 
}

export function activate(context: vscode.ExtensionContext) {
    log("Installing code-itop-tools extension")
    log("Current configured path" + vscode.workspace.getConfiguration(PREFIX.slice(0, -1)).get('itop-url', 'none'));
    
    log("Registering getURLFromConfigFile")
    context.subscriptions.push(
        vscode.commands.registerCommand(PREFIX+'getURLFromConfigFile', askSetConfigSetting)
    );

    log("Registering checkDatamodel")

    context.subscriptions.push(
        vscode.commands.registerCommand(PREFIX+'checkDatamodel', checkDatamodel)
    );

    log("Registering applyDatabaseChanges")

    context.subscriptions.push(
        vscode.commands.registerCommand(PREFIX+'applyCodeChanges', applyCodeChanges)
    );

    log("Registering applyAllChanges")

    context.subscriptions.push(
        vscode.commands.registerCommand(PREFIX+'applyAllChanges', applyAllChanges)
    );

    log("code-itop-tools extension installed")

}

export function deactivate() {}

