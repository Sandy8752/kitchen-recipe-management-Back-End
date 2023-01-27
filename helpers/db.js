const mongoose = require("mongoose");

const dbConnect = async () => {
    mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      
    })
    .then(()=>console.log('Connected to db'))
    .catch((err)=> console.log("DB connection error",err));
}

// const dbConnect = async () => {
//     try {
//         await mongoose.connect(DB_URL);
//         console.log("Mongodb connection established");
//     } catch (error) {
//         console.log(error, "Mongodb connection error");
//     }
// };

module.exports = dbConnect;