import { Router } from "express";
const companyrouter = Router();
  

import * as controller from '../Controllers/CompanyController.js'

companyrouter.route('/register').post(controller.companyregister);
companyrouter.route('/verifyOTP').post(controller.verifyOTP);
companyrouter.route("/login").post(controller.login)

companyrouter.route("/addrole").post(controller.addRole)
companyrouter.route('/getuser/:email').get(controller.getUser)
companyrouter.route('/getroles/:companyId').get(controller.getallcompanyRoles)

companyrouter.route('/deleteroles/:id').delete(controller.deleteRole)



 export default companyrouter;