import arg from 'arg';
import inquirer from 'inquirer';

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

        let questions = [], confirmation = yes_to_all;
    
        if(options.init) {
            if(!yes_to_all) {
                questions.push({
                    name: "confirm",
                    type: "confirm",
                    message: "Creating .env in a bit, do you want to change the file name?"
                });
    
                const { confirm = false } = await inquirer.prompt([
                    {
                        name: "confirm",
                        type: "confirm",
                        message: "Creating .env in a bit, do you want to change the file name?"
                    }
                ]);
    
                if(confirm) {
                    const { filename = "" } = await inquirer.prompt([
                        {
                            name: "filename",
                            message: "Indicate desired filename for your environment file:"
                        }
                    ]);
    
                    key = filename !== "" ? filename : DEFAULT_FILENAME;
                }
                else {
                    key = DEFAULT_FILENAME;
                }
            }
        }
        else if(options.add) {
            if(key === "") {
                questions.push({
                    name: "key",
                    message: "Provide a key for your new environment variable:"
                });

                const { variable_name = "" } = await inquirer.prompt([
                    {
                        name: "variable_name",
                        message: "Provide a key for your new environment variable:"
                    }
                ]);
                
                key = variable_name;
            }
    
            if(value === "") {
                const { variable_value = "" } = await inquirer.prompt([
                    {
                        name: "variable_value",
                        message: `Provide a value for ${key}:`
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
    
            if(value === "") {
                const { variable_value = "" } = await inquirer.prompt([
                    {
                        name: "variable_value",
                        message: `Provide a new value for ${key}:`
                    }
                ]);

                value = variable_value;
            }

            if(!yes_to_all) {
                const { confirm = "" } = await inquirer.prompt([
                    {
                        name: "confirm",
                        type: "confirm",
                        message: "Are you sure you want to edit " + key + "?",
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

            if(!yes_to_all) {
                const { confirm = "" } = await inquirer.prompt([
                    {
                        name: "confirm",
                        type: "confirm",
                        message: "Are you sure you want to delete " + key + "?",
                    }
                ]);

                confirmation = confirm;
            }
        }
    
        return { ...options, key, value, confirmation };
    }
    catch (err) {
        return err;
    }
}

// actions - // TODO: To be moved to another file

const menv = {
    init: function ({ key = "" }) {
        return new Promise((resolve, reject) => {
            console.log(`init ${key}`);
            resolve();
        })
    },
    add: function ({ key = "", value = "" }) {
        return new Promise((resolve, reject) => {
            console.log(`add ${key} with value: ${value}`);
            resolve();
        })
    },
    get: function ({ key = "" }) {
        return new Promise((resolve, reject) => {
            console.log(`get ${key}`);
            resolve();
        })
    },
    edit: function ({ key = "", value = "", confirmation = false }) {
        return new Promise((resolve, reject) => {
            if(confirmation) {
                console.log(`update ${key} to ${value}`);
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
                console.log(`delete ${key}`);
            }
            else {
                console.log("delete process not confirmed");
            }

            resolve();
        })
    }
}; 

async function proceedOptionsAction (options) {
    try {
        if(options.help) {
            console.log("show help");
        }
        else if(options.init) {
            await menv.init(options);
        }
        else if(options.add) {
            await menv.add(options);
        }
        else if(options.get) {
            await menv.get(options);
        }
        else if(options.edit) {
            await menv.edit(options);
        }
        else if(options.delete) {
            await menv.delete(options);
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
        // console.log(options);
    }
    catch (err) {
        console.log(err);
    }
}