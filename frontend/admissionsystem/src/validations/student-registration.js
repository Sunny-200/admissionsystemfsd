import { z } from "zod";

export const basicInfoSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: "First name must be at least 2 characters" })
    .max(50, { message: "First name must not exceed 50 characters" }),
  lastName: z
    .string()
    .min(2, { message: "Last name must be at least 2 characters" })
    .max(50, { message: "Last name must not exceed 50 characters" }),
  email: z
    .string()
    .email({ message: "Invalid email address" }),
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, { message: "Phone number must be 10 digits" }),
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
  gender: z
    .enum(["Male", "Female", "Other"], {
      message: "Please select a valid gender",
    }),
  address: z
    .string()
    .min(5, { message: "Address must be at least 5 characters" })
    .max(100, { message: "Address must not exceed 100 characters" }),
  city: z
    .string()
    .min(2, { message: "City must be at least 2 characters" })
    .max(50, { message: "City must not exceed 50 characters" }),
  state: z
    .string()
    .min(2, { message: "State must be at least 2 characters" })
    .max(50, { message: "State must not exceed 50 characters" }),
  zipCode: z
    .string()
    .regex(/^[0-9]{6}$/, { message: "Zip code must be 6 digits" }),
});

export const academicInfoSchema = z.object({
  highSchoolName: z
    .string()
    .min(3, { message: "High school name must be at least 3 characters" })
    .max(100, { message: "High school name must not exceed 100 characters" }),
  highSchoolBoard: z
    .enum(["CBSE", "ICSE", "State Board", "International", "Other"], {
      message: "Please select a valid board",
    }),
  passingYear: z
    .string()
    .refine(
      (year) => {
        const currentYear = new Date().getFullYear();
        const passYear = parseInt(year);
        return passYear >= currentYear - 5 && passYear <= currentYear;
      },
      { message: "Passing year must be within the last 5 years" }
    ),
  cgpa: z
    .string()
    .refine(
      (cgpa) => {
        const score = parseFloat(cgpa);
        return score >= 0 && score <= 10;
      },
      { message: "CGPA must be between 0 and 10" }
    ),
  subjects: z
    .array(z.string())
    .min(3, { message: "Please select at least 3 subjects" })
    .max(6, { message: "Please select at most 6 subjects" }),
  preferredStream: z
    .enum(["Science", "Commerce", "Arts", "Others"], {
      message: "Please select a valid stream",
    }),
  achievements: z
    .string()
    .max(500, { message: "Achievements must not exceed 500 characters" })
    .optional(),
});
