const url=require('url');
var MongoClient = require('mongodb').MongoClient;
const settings=require('./settings');

const mongodbConnection = settings.mongodbServerUrl;
const mongoPathName = url.parse(String(mongodbConnection)).pathname;
const dbName = mongoPathName.substring(mongoPathName.lastIndexOf('/') + 1);

const RECONNECT_INTERVAL = 1000;
const CONNECT_OPTIONS = {
	reconnectTries: 3600,
	reconnectInterval: RECONNECT_INTERVAL,
	useNewUrlParser: true
};

const onClose = () => {
	console.log('MongoDB connection was closed');
};

const onReconnect = () => {
	console.log('MongoDB reconnected');
};

let db_connection=null;
const client = new MongoClient(mongodbConnection, {
    useNewUrlParser: true,
});

const createConn = async () => {
	console.log('getting connection')
    await client.connect();
    db_connection = client.db('test');
    console.log('got connection')
    return db_connection
};

class MongoService {
	
  // this is important, if you don't set it to false, your handler will never complete because the connection is open
  //context.callbackWaitsForEmptyEventLoop = false;
  async init(callback){
	  	callback(await createConn());
  }
};

module.exports=new MongoService();
