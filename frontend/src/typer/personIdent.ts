import { z } from 'zod';

export const personIdentSchema = z
    .string()
    .regex(/^\d{11}$/, 'Fødselsnummer eller D-nummer må være 11 siffer')
    .nonempty('Ident cannot be empty');

export type PersonIdent = z.infer<typeof personIdentSchema>;
