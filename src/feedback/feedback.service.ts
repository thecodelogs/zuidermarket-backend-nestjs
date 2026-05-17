import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Feedback } from './feedback.entity';

@Injectable()
export class FeedbackService extends TypeOrmCrudService<Feedback> {
    constructor(@InjectRepository(Feedback) repo) {
        super(repo);
    }
}
