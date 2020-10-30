import arg from 'arg';
import inquirer from 'inquirer';

import fs from "fs";

import menv from "./menv";

function parseArgumentsIntoOptions(rawArgs) {
    const args = arg(
        {
            "--init" : Boolean,
            "--help" : Boolean,
            "--list" : Boolean,
            "--add" : Boolean,
            "--get" : Boolean,
            "--edit" : Boolean,
            "--delete" : Boolean,
            "--yes" : Boolean,
            "-i" : "--init",
            "-h" : "--help",
            "-l" : "--list",
            "-a" : "--add",
            "-g" : "--get",
            "-e" : "--edit",
            "-d" : "--delete",
            "-y" : "--yes"
        },
        {
            argv: rawArgs.slice(2),
        }
    );
    return {
        init: args['--init'] || false,
        help: args['--help'] || false,
        list: args['--list'] || false,
        add: args['--add'] || false,
        get: args['--get'] || false,
        edit: args['--edit'] || false,
        delete: args['--delete'] || false,
        yes_to_all: args['--yes'] || false,
        key: args._[0],
        value: args._[1]
    };
}

const DEFAULT_FILENAME = ".env";

async function promptForMissingOptions(options) {
    try {
        let { key = "", value = "", yes_to_all = false } = options;

        let confirmation = yes_to_all, stop = false;
    
        if(options.init) {
            if(!yes_to_all) {
                key = DEFAULT_FILENAME;

                if(fs.existsSync(key)) {
                    const { confirm = false } = await inquirer.prompt([
                        {
                            name: "confirm",
                            type: "confirm",
                            message: "Environment file (.env) exists, do you want to overwrite it?"
                        }
                    ]);

                    stop = !confirm;
                }
                // const { confirm = false } = await inquirer.prompt([
                //     {
                //         name: "confirm",
                //         type: "confirm",
                //         message: "Creating .env in a bit, do you want to change the file name?"
                //     }
                // ]);
    
                // if(confirm) {
                //     const { filename = "" } = await inquirer.prompt([
                //         {
                //             name: "filename",
                //             message: "Indicate desired filename for your environment file:"
                //         }
                //     ]);
    
                //     key = filename !== "" ? filename : DEFAULT_FILENAME;
                //     key = DEFAULT_FILENAME;
                // }
                // else {
                //     key = DEFAULT_FILENAME;
                // }
            }
        }
        else if(options.add) {
            if(key === "") {
                const { variable_name = "" } = await inquirer.prompt([
                    {
                        name: "variable_name",
                        message: "Provide a key for your new environment variable:"
                    }
                ]);
                
                key = variable_name;
            }

            const existing_key = menv("getvalue", key);
            if(existing_key.hasOwnProperty("key")) {
                const { confirm = false } = await inquirer.prompt([
                    {
                        name: "confirm",
                        type: "confirm",
                        message: `Key \"${key}\" exists in your environment file, do you want to edit it instead?`
                    }
                ]);

                if(confirm) {
                    options.add = false;
                    options.edit = true;
                    yes_to_all = true;
                    confirmation = confirm;
                }

                stop = !confirm;
            }
    
            if(!stop && value === "") {
                const { variable_value = "" } = await inquirer.prompt([
                    {
                        name: "variable_value",
                        message: `Provide a value for \"${key}\":`
                    }
                ]);

                value = variable_value;
            }
        }
        else if(options.get) {
            if(key === "") {
                const { variable_name = "" } = await inquirer.prompt([
                    {
                        name: "variable_name",
                        message: "Which environment variable would you like to see?"
                    }
                ]);
                
                key = variable_name;
            }
        }
        else if(options.edit) {
            if(key === "") {
                const { variable_name = "" } = await inquirer.prompt([
                    {
                        name: "variable_name",
                        message: "Which environment variable would you like to edit?"
                    }
                ]);
                
                key = variable_name;
            }

            const existing_key = menv("getvalue", key);

            if(Object.keys(existing_key).length === 0) {
                console.log(`Key \"${key}\" not found`);
                stop = true;
            }
    
            if(!stop && value === "") {
                const { variable_value = "" } = await inquirer.prompt([
                    {
                        name: "variable_value",
                        message: `Provide a new value for \"${key}\":`
                    }
                ]);

                value = variable_value;
            }

            if(!stop && !yes_to_all) {
                const { confirm = "" } = await inquirer.prompt([
                    {
                        name: "confirm",
                        type: "confirm",
                        message: "Are you sure you want to edit \"" + key + "\"?",
                    }
                ]);

                confirmation = confirm;
            }
        }
        else if(options.delete) {
            if(key === "") {
                const { variable_name = "" } = await inquirer.prompt([
                    {
                        name: "variable_name",
                        message: "Which environment variable would you like to delete?"
                    }
                ]);
                
                key = variable_name;
            }

            const existing_key = menv("getvalue", key);

            if(Object.keys(existing_key).length === 0) {
                console.log(`Key \"${key}\" not found`);
                stop = true;
            }

            if(!stop && !yes_to_all) {
                const { confirm = "" } = await inquirer.prompt([
                    {
                        name: "confirm",
                        type: "confirm",
                        message: "Are you sure you want to delete \"" + key + "\"?",
                    }
                ]);

                confirmation = confirm;
            }
        }
    
        if(!stop) {
            return { ...options, key, value, confirmation };
        }
    }
    catch (err) {
        return err;
    }
}

const actions = {
    init: function () {
        return new Promise((resolve, reject) => {
            menv("init");
            resolve();
        })
    },
    add: function ({ key = "", value = "" }) {
        return new Promise((resolve, reject) => {
            console.log(`Adding \"${key}\" with value: \"${value}\"...`);
            menv("add", key, value);
            resolve();
        })
    },
    get: function ({ key = "" }) {
        return new Promise((resolve, reject) => {
            menv("get", key);
            resolve();
        })
    },
    edit: function ({ key = "", value = "", confirmation = false }) {
        return new Promise((resolve, reject) => {
            if(confirmation) {
                console.log(`Updating key \"${key}\" to \"${value}\"...`);
                menv("edit", key, value);
            }
            else {
                console.log("edit process not confirmed");
            }

            resolve();
        })
    },
    delete: function ({ key = "", confirmation = false }) {
        return new Promise((resolve, reject) => {
            if(confirmation) {
                console.log(`Deleting key \"${key}\"...`);
                menv("delete", key);
            }
            else {
                console.log("delete process not confirmed");
            }

            resolve();
        })
    },
    list: function () {
        return new Promise((resolve, reject) => {
            menv("list");
            resolve();
        })
    }
}; 

async function proceedOptionsAction (options) {
    try {
        if(options.help) {
            console.log(`menv helps you manage your keys on your environment file.\n\nusage: menv <command> [<key>] [<value>]\n\navailable commands:\n\n --init\t\tinitializes a new .env file\n --help\t\tshows this guide on using menv\n --list\t\tlists the keys and values inside the .env file\n --add\t\tadds a new key inside the .env file\n --get\t\tdisplays the selected key inside the .env file\n --edit\t\tupdates the selected key inside the .env file\n --delete\tdeletes the selected key inside the .env file`);
        }
        else if(options.init) {
            await actions.init(options);
        }
        else if(options.add) {
            await actions.add(options);
        }
        else if(options.get) {
            await actions.get(options);
        }
        else if(options.edit) {
            await actions.edit(options);
        }
        else if(options.delete) {
            await actions.delete(options);
        }
        else if(options.list) {
            await actions.list(options);
        }

        return;
    }
    catch (err) {
        return err;
    }
}

export async function cli(args) {
    try {
        let options = parseArgumentsIntoOptions(args);
        options = await promptForMissingOptions(options);
        await proceedOptionsAction(options);
    }
    catch (err) {
        console.log(err);
    }
}