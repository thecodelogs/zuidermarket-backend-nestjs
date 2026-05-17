import SMTPTransport = require('nodemailer/lib/smtp-transport');

export interface IMailConfig {
    from: string;
    smtpTransportOptions: SMTPTransport.Options;
}
