import arg from 'arg';

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
            "-i" : "--init",
            "-h" : "--help",
            "-l" : "--list",
            "-a" : "--add",
            "-g" : "--get",
            "-e" : "--edit",
            "-d" : "--delete"
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
        key: args._[0],
        value: args._[1],
    };
}

export function cli(args) {
    let options = parseArgumentsIntoOptions(args);
    console.log(options);
}