import { Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Crud, CrudController } from '@nestjsx/crud';
import { Notification } from './notification.entity';
import { NotificationService } from './notification.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@UseGuards(AuthGuard())
@Crud({
    model: {
        type: Notification,
    },
})
@ApiBearerAuth()
@Controller('notification')
export class NotificationController implements CrudController<Notification> {
    constructor(public service: NotificationService) {}
}
