import mongoose, { type Document, Schema } from "mongoose";

export enum TaskStatus {
	PENDING = "pending",
	COMPLETED = "completed",
}

export interface ITask extends Document {
	title: string;
	description?: string;
	status: TaskStatus;
	dueDate?: Date;
	owner: mongoose.Types.ObjectId;
	createdAt: Date;
}

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

// Create indexes for faster lookups
taskSchema.index({ owner: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ owner: 1, status: 1 });

export const Task = mongoose.model<ITask>("Task", taskSchema);
