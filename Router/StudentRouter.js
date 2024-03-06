import { Router } from "express";
const studentrouter = Router();
  
import * as controller from "../Controllers/StudentController.js"


studentrouter.route('/register').post(controller.studentregister);
studentrouter.route('/verifyOTP').post(controller.verifyOTP);
studentrouter.route("/login").post(controller.login)

studentrouter.route("/applyrole").post(controller.applyRole)



 export default studentrouter;