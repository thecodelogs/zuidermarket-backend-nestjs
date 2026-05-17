import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserAdminController } from './user-admin/user-admin.controller';
import { UserSearchController } from './user-search/user-search.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
    ],
    controllers: [UserController, UserAdminController, UserSearchController],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule {}
