import { Router } from "express";
const studentrouter = Router();
  
import * as controller from "../Controllers/StudentController.js"


studentrouter.route('/register').post(controller.studentregister);
studentrouter.route('/verifyotp').post(controller.verifyOTP);
studentrouter.route("/login").post(controller.login)





 export default studentrouter;