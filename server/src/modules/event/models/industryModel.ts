import { Schema, model, Document } from "mongoose";

export interface IIndustry extends Document {
  taxoid: number;               // LinkedIn Industry ID (from their taxonomy)
  name: string;             
  parentId: number;        // Parent category ID (if any)
  childrenIds: number[];   // Sub-industries
}

const IndustrySchema = new Schema<IIndustry>(
  {
    taxoid: {
      type: Number,
      required: true,
      unique: true, // ID from LinkedIn taxonomy
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    parentId: {
      type: Number,
      default: null,
    },
    childrenIds: {
      type: [Number],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const IndustryModel = model<IIndustry>("Industry", IndustrySchema);
