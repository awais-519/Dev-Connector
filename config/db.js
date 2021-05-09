const mangoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');


const connectDb = async () =>{
    try
    {
        await mangoose.connect(db);
        console.log('Mango db connected');
 
    }
    catch(err)
    {
        console.error(err);
        //EXIT PROCESS WITH FAILURE
        process.exit(1);
    }
} 

//EXPORTING THE FUNCTION SO THAT TO IMPORT LATER ON
module.exports  = connectDb;      