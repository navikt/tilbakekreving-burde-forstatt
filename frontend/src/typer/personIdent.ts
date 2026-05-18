import { z } from 'zod';

export const personIdentSchema = z
    .string()
    .regex(/^\d{11}$/, 'Fødselsnummer eller D-nummer må være 11 siffer')
    .min(1, 'Ident cannot be empty');

export type PersonIdent = z.infer<typeof personIdentSchema>;
