import mongoose, { type Document, Schema } from "mongoose";
import { mockRedis } from "../redis-mock";

// Mock User Interface
export interface IUser extends Document {
	name: string;
	email: string;
	password: string;
	createdAt: Date;
}

// Mock Task Status
export enum TaskStatus {
	PENDING = "pending",
	COMPLETED = "completed",
}

// Mock Task Interface
export interface ITask extends Document {
	title: string;
	description?: string;
	status: TaskStatus;
	dueDate?: Date;
	owner: mongoose.Types.ObjectId;
	createdAt: Date;
}

// Mock User Schema (will be connected to MongoDB Memory Server)
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

export const User = mongoose.model<IUser>("User", userSchema);

// Mock Task Schema (will be connected to MongoDB Memory Server)
const taskSchema = new Schema<ITask>(
	{
		title: {
			type: String,
			required: true,
			trim: true,
			maxlength: 500,
		},
		description: {
			type: String,
			trim: true,
			maxlength: 2000,
		},
		status: {
			type: String,
			enum: Object.values(TaskStatus),
			default: TaskStatus.PENDING,
		},
		dueDate: {
			type: Date,
		},
		owner: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
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

taskSchema.index({ owner: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ owner: 1, status: 1 });

export const Task = mongoose.model<ITask>("Task", taskSchema);

// Mock database connection (will be controlled by test setup)
export const db = mongoose.connection;

// Mock Redis (use redis-mock)
export const redis = mockRedis;
