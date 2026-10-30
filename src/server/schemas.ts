import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['inspector', 'supervisor', 'admin']).default('inspector'),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createInspectionSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long'),
  domain: z.enum(['manufacturing', 'safety', 'infrastructure', 'document']),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  notes: z.string().optional(),
  imageUrl: z.string().optional(),
  profileId: z.string().optional(),
});

export const createProfileSchema = z.object({
  name: z.string().min(3, 'Profile name must be at least 3 characters'),
  domain: z.enum(['manufacturing', 'safety', 'infrastructure', 'document']),
  description: z.string().optional().default(''),
  custom_rules: z
    .object({
      sensitivity: z.enum(['standard', 'high', 'ultra']).default('high'),
      focus_areas: z.array(z.string()).default([]),
      min_confidence: z.number().min(0).max(100).default(70),
      require_remediation: z.boolean().default(true),
      custom_prompt: z.string().optional(),
    })
    .default({
      sensitivity: 'high',
      focus_areas: [],
      min_confidence: 70,
      require_remediation: true,
    }),
});
