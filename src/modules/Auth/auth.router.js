import { Router } from "express";
import { signup , login, confirmEmail} from "./auth.controller.js";
import { isValid } from "../../middleware/validation.middleware.js";
import { loginSchema, signSchema } from "./auth.validation.js";


const router = Router()


// SignUp
router.post('/signup', isValid(signSchema) ,signup)

// LogIn
router.post('/login', isValid(loginSchema) ,login)


// confirm email
router.get("/:token", confirmEmail)


export default router