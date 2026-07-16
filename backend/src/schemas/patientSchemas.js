const { z } = require('zod');

const patientSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  age: z.number().int().min(0).max(130),
  gender: z.enum(['Male', 'Female', 'Other']),
  phone: z.string().trim().min(1, 'Phone is required'),
  address: z.string().trim().optional().default(''),
  notes: z.string().trim().optional().default(''),
});

module.exports = { patientSchema };