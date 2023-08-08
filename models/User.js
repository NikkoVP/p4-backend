import { Schema,model } from "mongoose";

const UserSchema = new Schema({

  username: String,
  password: String,
  name: String

});

const User = model("User", UserSchema);

export default User;