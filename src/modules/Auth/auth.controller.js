import { User } from "./../../../db/models/user.model.js"
import bcryptjs  from "bcryptjs"
import jwt from "jsonwebtoken"
import { catchError } from "./../../utils/catcherror.js"
import { sendEmail } from "./../../utils/sendEmail.js" 
import { signSchema } from "./auth.validation.js"

// hashsync, comparesync in (bycrptjs)  are ,,  blocking do not allow to run what afer it before it runs  //

export const signup = catchError(async (req, res, next) => {

    // /// data >> body
    // const { x } = req.query
    const { name, email, password, confirmPassword} = req.body


    // ///  check email

    const isUser = await User.findOne({ email })
    if (isUser) {
      //return res.json({success: false, message: "Email Must Be Unique"})
      return next(new Error("Email Must Be Unique"))
    }

   //console.log("Password: ", password)


    ///  hash password
    const hashPassword = bcryptjs.hashSync(password, parseInt(process.env.SALTROUNDS))
    // console.log("hashPassword: ", hashPassword)

    // create
    const user = await User.create({name, email, password: hashPassword})
    //console.log(user)

    // token 
    const token = jwt.sign({ email }, process.env.TOKENKEY)

    // SendEmail
    const isSuccess = await sendEmail({
      to: email,
      subject: "confirmation Email",
      html: `<a href = http://localhost:5000/auth/${token}> please click to confirm your account</a>"
    `})

    if(!isSuccess) return next(new Error("email is invalid"))

    // res
    return res.json({success: true, message: "User Created Successfully", results: user})
    // if (error.keyPattern.email) {
    // return res.json({success: false, message: "Email Must Be Unique"})
    //}
})


export const login = catchError(async (req, res, next) => {
  // data
  const { email, password } = req.body

 // check email
const user = await User.findOne({email, isConfirmed: false}).select("password")

if (!user) {
 //return res.json({success: false, message: "email not found"})
  return next(new Error("email not found"))
}


  // // check password
  // // compareSync(passwordfromuser, hashedpasswordfromdb)
  const match = await bcryptjs.compare(password, user.password) // true , false
   // true , false

  if (!match) {
  //   //return res.json({success: false, message: "password is wrong"})
    return next(new Error("password is wrong"))
  }


  // generate token  // token is stateless //
  const token = jwt.sign({id: user._id, email: user.email}, process.env.TOKENKEY)

  // response
  return res.json({success: true, token})
})


export const confirmEmail = catchError(async (req, res, next) => {
  // data >> token
  const { token } = req.params
  const payload = jwt.verify(token, process.env.TOKENKEY)
  const { email } = payload
  console.log("hi from confirm email")
  const user = await User.findOneAndUpdate({ email }, { isConfirmed: true}, { new: true })

  return res.json({success: true, results: user})
})

