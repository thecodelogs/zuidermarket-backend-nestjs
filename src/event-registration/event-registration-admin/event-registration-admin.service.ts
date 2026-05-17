import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { EventRegistration } from '../event-registration.entity';

@Injectable()
export class EventRegistrationAdminService extends TypeOrmCrudService<EventRegistration> {
    constructor(@InjectRepository(EventRegistration) repo) {
        super(repo);
    }
}
