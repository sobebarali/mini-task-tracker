import mongoose, { type Document, Schema } from "mongoose";

export interface IUser extends Document {
	name: string;
	email: string;
	password: string;
	createdAt: Date;
}

const userSchema = new Schema<IUser>(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			maxlength: 255,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
			maxlength: 255,
		},
		password: {
			type: String,
			required: true,
			select: false,
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
	},
	{
		timestamps: false,
	},
);

// Create index on email for faster lookups
userSchema.index({ email: 1 });

export const User = mongoose.model<IUser>("User", userSchema);
