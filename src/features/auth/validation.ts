import * as Yup from "yup";

export const loginSchema = Yup.object({
  email: Yup.string().email("Enter a valid email").required("Email is required"),
  password: Yup.string().min(8, "At least 8 characters").required("Password is required"),
});

export const registerSchema = Yup.object({
  email: Yup.string().email("Enter a valid email").required("Email is required"),
  password: Yup.string().min(8, "At least 8 characters").required("Password is required"),
  first_name: Yup.string().required("First name is required"),
  last_name: Yup.string(),
  phone: Yup.string(),
  farm_name: Yup.string().required("Farm name is required"),
});

export const staffSchema = Yup.object({
  email: Yup.string().email("Enter a valid email").required("Email is required"),
  password: Yup.string().min(8, "At least 8 characters").required("Password is required"),
  first_name: Yup.string().required("First name is required"),
  last_name: Yup.string(),
  role: Yup.mixed<"WORKER" | "VETERINARIAN">()
    .oneOf(["WORKER", "VETERINARIAN"])
    .required("Role is required"),
});
