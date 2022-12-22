import { Business, BusinessModel } from "../models/business.js";

export async function checkBusinessExists(businessName: string): Promise<boolean> {
    const b = await BusinessModel.findOne({ name: { "$regex": new RegExp(businessName, 'i') } });

    return !!b;
}

export async function createBusiness(business: Business) {
    return await BusinessModel.create(business);
}