import {Schema, model} from 'mongoose';



interface User {
    _id: string;
    employeeId: string;
    name: string;
    email: string;
    password: string;
    role: string;
    status: string;
}

const userSchema = new Schema<User>({
    employeeId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    status: { type: String, required: true },
}, { timestamps: true });

const UserModel = model<User>('User', userSchema);

export default UserModel;

