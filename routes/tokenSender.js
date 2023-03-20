const nodemailer = require("nodemailer")
const dotenv = require("dotenv")
dotenv.config();

const sendMail = async (to, subject, message) =>{
    const transporter = nodemailer.createTransport({
        service : "hotmail",
        auth : {
            user : "anonymousjusticeke@outlook.com",
            pass : "justice2023"
        }
    })

    const options = {
        from : "anonymousjusticeke@outlook.com", 
        to, 
        subject, 
        text: message,
    }

    transporter.sendMail(options, (error, info) =>{
        if(error) console.log(error)
        else console.log(info)
    })

}
sendMail("trevorokwirri@gmail.com", `Welcome Message","Welcome to Anonymous Justice` )