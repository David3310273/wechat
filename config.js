var config = require('./config/components');

//merge json object in components.json and params.json

config = Object.assign(config, require('./config/params'));

switch (process.env.NODE_ENV)
{
    case 'development': {
        //dev enviromental param configuration here, consist with the node config.
    }

    case 'test': {
        //test enviromental param configuration here
    }

    case 'production': {
        //pro enviromental param configuration here
    }

    default: {
        break;
    }
}

module.exports = config;

