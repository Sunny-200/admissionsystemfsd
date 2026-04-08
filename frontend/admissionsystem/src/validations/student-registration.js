import { z } from "zod";

const optionalNonNegativeInt = z.preprocess(
  (value) => {
    if (value === "" || value === undefined || value === null) {
      return undefined;
    }
    return Number(value);
  },
  z
    .number({ message: "Value must be a number" })
    .int({ message: "Value must be an integer" })
    .nonnegative({ message: "Value must be 0 or more" })
    .optional()
);

export const basicInfoSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name must not exceed 100 characters" }),
  contactNumber: z
    .string()
    .regex(/^[0-9]{10}$/, { message: "Contact number must be 10 digits" }),
  dateOfBirth: z
    .string()
    .refine(
      (date) => {
        const birthDate = new Date(date);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        return age >= 16 && age <= 100;
      },
      { message: "Age must be between 16 and 100 years" }
    ),
  guardianName: z
    .string()
    .min(2, { message: "Guardian name must be at least 2 characters" })
    .max(100, { message: "Guardian name must not exceed 100 characters" }),
  guardianNumber: z
    .string()
    .regex(/^[0-9]{10}$/, { message: "Guardian number must be 10 digits" }),
  guardianEmail: z
    .string()
    .email({ message: "Invalid guardian email" }),
});

export const academicInfoSchema = z.object({
  aadharNumber: z
    .string()
    .regex(/^[0-9]{12}$/, { message: "Aadhar number must be 12 digits" }),
  religion: z
    .string()
    .min(1, { message: "Please select a religion" })
    .max(50, { message: "Religion must not exceed 50 characters" }),
  casteCategory: z
    .enum(["GENERAL", "GENERAL_EWS", "OBC_NCL", "SC", "ST"], {
      message: "Please select a valid caste category",
    }),
  branchAllotted: z
    .string()
    .min(2, { message: "Branch must be at least 2 characters" }),
  batchId: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"], {
    message: "Please select gender",
  }),
  isPwd: z.boolean({ message: "Please select PWD status" }),
  pwdDisabilityType: z
    .string()
    .max(100, { message: "PWD disability type must not exceed 100 characters" })
    .optional(),
  jeeMainRank: z.coerce
    .number({ message: "JEE Main rank is required" })
    .int({ message: "JEE Main rank must be an integer" })
    .nonnegative({ message: "JEE Main rank must be 0 or more" }),
  jeeMainCategoryRank: z.coerce
    .number({ message: "JEE Main category rank is required" })
    .int({ message: "JEE Main category rank must be an integer" })
    .nonnegative({ message: "JEE Main category rank must be 0 or more" }),
  jeeAdvancedRank: optionalNonNegativeInt,
  jeeAdvancedCategoryRank: optionalNonNegativeInt,
  seatAllotmentSource: z
    .enum(["JOSSA", "CSAB"], {
      message: "Please select a valid allotment source",
    }),
  bloodGroup: z
    .string()
    .min(1, { message: "Please select blood group" })
    .max(5, { message: "Blood group must not exceed 5 characters" }),
  permanentAddress: z
    .string()
    .min(5, { message: "Address must be at least 5 characters" })
    .max(200, { message: "Address must not exceed 200 characters" }),
  state: z
    .string()
    .min(1, { message: "Please select a state" })
    .max(50, { message: "State must not exceed 50 characters" }),
  remarksFromStudent: z
    .string()
    .max(500, { message: "Remarks must not exceed 500 characters" })
    .optional(),
}).superRefine((data, ctx) => {
  if (data.isPwd && (!data.pwdDisabilityType || !data.pwdDisabilityType.trim())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "PWD disability type is required when PWD is Yes",
      path: ["pwdDisabilityType"],
    });
  }
});
