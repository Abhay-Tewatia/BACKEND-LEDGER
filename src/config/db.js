const mongoose = require("mongoose");



function connectToDB() {
    mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("server is connected to the database");
    })
    .catch(err =>{
        console.log("Error connecting to database", err);
        process.exit(1);
    })
}

module.exports = connectToDB;