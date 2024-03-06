import { Router } from "express";
const companyrouter = Router();
  

import * as controller from '../Controllers/CompanyController.js'

companyrouter.route('/register').post(controller.companyregister);
companyrouter.route('/verifyotp').post(controller.verifyOTP);
companyrouter.route("/login").post(controller.login)

companyrouter.route("/addrole").post(controller.addRole)




 export default companyrouter;