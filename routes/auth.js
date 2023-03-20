const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

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
// sendMail("trevorokwirri@gmail.com", `Welcome Message","Welcome to Anonymous Justice` )

//REGISTER
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'username, email, and password are required' });
  }

  if (password.trim() === '') {
    return res.status(400).json({ message: 'Password must not be empty' });
  }
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: CryptoJS.SHA512(
      req.body.password,
    ).toString(),
  });
  try {
    const savedUser = await newUser.save();
    const verificationToken = jwt.sign(
      { newUser},
      "justice@2023",
      {
        expiresIn: "3h",
      }
    );
    sendMail(savedUser.email, "Welcome Message",`Your email verification link is http://127.0.0.1:3000/auth/verify/${verificationToken}`)
    res.status(201).json(savedUser);
  } catch (err) {
    console.log(err)
    res.status(500).json(err);
  }
});

//LOGIN

router.post('/login', async (req, res) => {
    try{
        const user = await User.findOne(
            {
                email: req.body.email
            }
        );
        // console.log(CryptoJS.SHA512(req.body.password).toString())
        // !user && res.status(401).json("Wrong User Name");
        if(user.password === CryptoJS.SHA512(req.body.password).toString()){
          const accessToken = jwt.sign(
            {
              id: user._id,
              isAdmin: user.isAdmin,
            },
            process.env.JWT_SEC 
             ,
            );
            // console.log("HI")
        const { password, ...others } = user._doc;  
        res.status(200).json({...others, accessToken});
        console.log("HI")
        } else {
          res.status(401).json("Wrong Password");
        }
    }catch(err){
      console.log(err)
        res.status(500).json(err);
    }

});
router.post("/verification", async (req, res) => {
  try {
    const user = await User.findOne({email: req.body.email})
    console.log(user);
    const verificationToken = jwt.sign(
      { user },
      "justice@2023",
      {
        expiresIn: "3h",
      }
    );
    if(user.isVerified){
      return res.send("User already verified")
    }
    sendMail(user.email, "Welcome Message",`Your email verification link is http://127.0.0.1:3000/auth/verify/${verificationToken}
    It expires in 3 hours`)      
    res.send("Verification email sent successfully");
  } catch (err) {
    console.log(err)
    res.status(500).json("Error: " + err);
  }
});
router.get("/verify/:token", async (req, res) => {
  try {
     jwt.verify(req.params.token, "justice@2023", (err, user) => {
      if (err) {res.status(403).json("Token is not valid!")}
      else {
        console.log(user)
        // res.send(user);
        if(user.user.isVerified == false){
          const somefunc = async () => {
          await User.findByIdAndUpdate(user.user._id, {...user, isVerified: true})
          user = await User.findById(user.user._id)
          res.send("User verification succesfull")
          }
          somefunc()
        }
      };
    });
    // console.log(user._id.toString())
    // const verificationToken = jwt.sign(
    //   { user},
    //   "justice@2023",
    //   {
    //     expiresIn: "2h",
    //   }
    // );
    // sendMail("trevorokwirri@gmail.com", "Welcome Message",`Your email verification link is http://127.0.0.1:3000/${verificationToken}
    // It expires in 3 hours`)      
    // res.send("Verification email sent successfully");
  } catch (err) {
    console.log(err)
    res.status(500).json("Error: " + err);
  }
});
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
    return res.status(201).send(user)
  } catch (err){
    res.status(404).json({"Error": err})
  }
})
module.exports = router;
