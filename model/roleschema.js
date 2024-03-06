import mongoose from "mongoose";


const roleSchema = new mongoose.Schema({
    name: String,
    minCTC: String,
    maxCTC: String,
    location: String,
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'company'
    }

  });

const rolemodel = mongoose.model('Role',roleSchema);
export default rolemodel