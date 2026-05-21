import { z } from "zod";
import { SL_DISTRICTS } from "./constants";

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["attendee", "club"]),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const onboardingSchema = z.object({
  interests: z.array(z.string()).min(1, "Select at least one interest"),
  homeDistrict: z.enum(SL_DISTRICTS as unknown as [string, ...string[]]),
});

export const clubSchema = z.object({
  name: z.string().min(2, "Club name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  contact: z.string().min(1, "Contact information is required"),
  district: z.enum(SL_DISTRICTS as unknown as [string, ...string[]]),
});

export const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  mode: z.enum(["online", "physical"]),
  district: z.string().optional(),
  venue: z.string().optional(),
  onlineLink: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  startDatetime: z.string().min(1, "Start date is required"),
  endDatetime: z.string().min(1, "End date is required"),
  goLiveAt: z.string().min(1, "Go-live time is required"),
  interests: z.array(z.string()).min(1, "Select at least one interest"),
});

export const interestSchema = z.object({
  name: z.string().min(2, "Interest name must be at least 2 characters"),
});
