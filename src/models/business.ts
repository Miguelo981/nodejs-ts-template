import { model, Schema } from "mongoose";

export interface Business {
    name: string;
    address: string;
    city: string;
    province?: string;
    phones: string[];
    cnae: string;
    mission: string;
    creationDate: Date;
    url: string;
}

export const BusinessSchema = new Schema({
    name: { type: String, unique: true },
    address: String,
    city: String,
    province: { type: String, required: false },
    phones: [String],
    cnae: String,
    mission: String,
    creationDate: Date,
    url: String,
}, { timestamps: true });

BusinessSchema.index({ date: -1 });
export const BusinessModel = model('Business', BusinessSchema);