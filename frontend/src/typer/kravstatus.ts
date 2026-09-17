import { z } from 'zod';

export const kravstatusSchema = z.object({
    eksternFagsystemId: z.string().min(1, { message: 'Ekstern fagsystem id er påkrevd' }),
});

export type KravstatusFormData = z.infer<typeof kravstatusSchema>;

export type Kravstatustype = 'bortfalt' | 'sperr';
