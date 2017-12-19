var config = require('./config/components');

//merge json object in components.json and params.json

config = Object.assign(config, require('./config/params'));

switch (process.env.flag)
{
    case 'dev': {
        //dev enviromental param configuration here
    }

    case 'test': {
        //test enviromental param configuration here
    }

    case 'pro': {
        //pro enviromental param configuration here
    }

    default: {
        break;
    }
}

module.exports = config;

