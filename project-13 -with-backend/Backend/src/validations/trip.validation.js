import { z } from 'zod';

const baseTripSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(2, 'Title must be at least 2 characters')
    .max(100)
    .trim(),
  description: z.string().max(500).trim().optional().default(''),
  destination: z.string({ required_error: 'Destination is required' }).trim().min(1),
  startDate: z.coerce.date({ required_error: 'Start date is required' }),
  endDate: z.coerce.date({ required_error: 'End date is required' }),
  totalBudget: z.coerce.number().min(0).optional().default(0),
  currency: z.string().max(3).optional().default('USD'),
  status: z.enum(['planning', 'upcoming', 'ongoing', 'completed', 'cancelled']).optional().default('planning'),
  isPublic: z.boolean().optional().default(false),
  tags: z.array(z.string().trim()).optional().default([]),
});

export const createTripSchema = baseTripSchema.refine(
  (data) => data.endDate >= data.startDate,
  {
    message: 'End date must be after or equal to start date',
    path: ['endDate'],
  },
);

// For updates — don't use .partial() on refined schema (Zod v4 restriction)
// Instead use a separate optional schema without the date refinement
export const updateTripSchema = baseTripSchema.partial();
