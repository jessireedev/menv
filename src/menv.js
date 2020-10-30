// const fs = require("fs");
import fs from "fs";

const filename = ".env";

function init () {
    fs.writeFile(filename, "", function (err) {
        if (err) return console.log(err);
        console.log(filename + ' created');
    });
}

function add (key, value) {
    let values = getvalues();
    values.push({ key, value });

    fs.writeFile(filename, formatvalues(values), function (err) {
        if (err) return console.log(err);
        console.log(`Key \"${key}\" added`);
    });
}

function list () {
    const values = getvalues();

    for(var i=0; i<values.length; i++) {
        const { key = "", value = "" } = values[i];
        console.log(`${key}\t\"${value}\"`);
    }
}

function get (key = "") {
    const selected = getvalue(key);
    if(selected.hasOwnProperty("key"))
        console.log(`Key \"${selected.key}\" contains the value: \"${selected.value}\"`);
    else 
        console.log(`Key \"${key}\" not found`)
} 

function edit(key = "", value = "") {
    let values = getvalues();

    values = values.map((item) => { 
        if(item.key === key) item.value = value;
        return item;
    });

    fs.writeFile(filename, formatvalues(values), function (err) {
        if (err) return console.log(err);
        console.log(`Key \"${key}\" updated`);
    });
}

function del(key = "") {
    let values = getvalues();

    values = values.filter((item) => { return item.key !== key; });

    fs.writeFile(filename, formatvalues(values), function (err) {
        if (err) return console.log(err);
        console.log(`Key \"${key}\" deleted`);
    });
}

function parsekeyvalue (line) {
    const parsed = line.trim().split("=");
    return { key: parsed[0], value: parsed[1] };
}

function getvalues () {
    const content = fs.readFileSync(filename, 'utf-8');
    const lines = content.split('\n');
    let values = [];
    for(var line in lines) {
        values.push(parsekeyvalue(lines[line]));
    }

    return values;
}

function getvalue (key = "") {
    const content = fs.readFileSync(filename, 'utf-8');
    const lines = content.split('\n');
    let neededvalue = {};
    for(var line in lines) {
        const currentline = parsekeyvalue(lines[line]);
        if(currentline.key === key) {
            neededvalue = currentline;
        }
    }

    return neededvalue;
}

function formatvalues (values) {
    let contents = [];
    for(var i=0; i<values.length; i++) {
        const { key = "", value = "" } = values[i];
        if(key !== "")
            contents.push(`${key}=${value}`);
    }
    return contents.join('\n');
}

export default function menv (action = "", key = "", value = "") {
    switch(action) {
        case "init" : init(); break;
        case "list" : list(); break;
        case "add" : add(key, value); break;
        case "get" : get(key); break;
        case "edit" : edit(key, value); break;
        case "delete" : del(key); break;
        case "getvalue" : return getvalue(key); break;
        default: console.log("invalid option");
    }
}
