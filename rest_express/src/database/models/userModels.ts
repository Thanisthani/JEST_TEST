import { model, Schema } from "mongoose";
import { IUser } from '../types/userType'

const userSchema: Schema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  refreshToken : {default: '',  type: String, required:false}
  
});

export default model<IUser>("User", userSchema);