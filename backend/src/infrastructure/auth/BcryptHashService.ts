import * as bcrypt from 'bcryptjs';
import {IHashService} from '../../domain/services/IHashService';

export class BcryptHashService implements IHashService {
    async hash(plain: string): Promise<string> {
        return bcrypt.hash(plain, 10);
    }

    async compare(plain: string, hashed: string): Promise<boolean> {
        return bcrypt.compare(plain, hashed);
    }
}
