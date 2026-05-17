import { MollieService } from 'src/mollie/mollie.service';
import { Body, Controller, Logger, Post } from '@nestjs/common';

@Controller('mollie')
export class MollieController {
    logger = new Logger(this.constructor.name);

    constructor(private readonly mollieService: MollieService) {}

    @Post('payment-status-webhook')
    acceptWebhook(@Body() body: { id: string }) {
        this.mollieService.processWebhook(body.id);
    }

    @Post('retry-payment')
    getPaymentLink(@Body() body: { userId: number }) {
        return this.mollieService.retryPayment(body.userId);
    }

    @Post('create-payment')
    createPayment(@Body() body: { userId: number }) {
        return this.mollieService.startPayment(body.userId);
    }

    @Post('get-entry-fee-status')
    getEntryFee(@Body() body: { userId: number }) {
        return this.mollieService.getEntryFeeStatus(body.userId);
    }
}
