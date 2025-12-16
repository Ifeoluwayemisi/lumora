import { z } from "zod";

export const signUpSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    role: z.enum(["CONSUMER", "MANUFACTURER"]),
    // Conditional fields (only required if role is MANUFACTURER)
    companyName: z.string().optional(),
    nafdacNumber: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.role === "MANUFACTURER") {
        return !!data.companyName && !!data.nafdacNumber;
      }
      return true;
    },
    {
      message: "Manufacturers must provide Company Name and NAFDAC Number",
      path: ["companyName"], // Points the error to this field
    }
  );

export type SignUpInput = z.infer<typeof signUpSchema>;
