import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoController } from './todo.controller';
import { Todo } from './todo.entity';
import { TodoService } from './todo.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Todo]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
    ],
    controllers: [TodoController],
    providers: [TodoService],
    exports: [TodoService],
})
export class TodoModule {}
