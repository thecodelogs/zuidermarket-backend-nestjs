import { MigrationInterface, QueryRunner } from 'typeorm';

export class BaselineSchema1710000000000 implements MigrationInterface {
    name = 'BaselineSchema1710000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`team\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`name\` varchar(191) NOT NULL,
                \`hasMarketDuty\` tinyint NOT NULL DEFAULT 1,
                \`test\` tinyint NOT NULL DEFAULT 0,
                UNIQUE INDEX \`UQ_team_name\` (\`name\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        await queryRunner.query(`
            CREATE TABLE \`event\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`start\` datetime NOT NULL,
                \`daypart\` enum ('morning', 'afternoon') NOT NULL DEFAULT 'morning',
                \`isHoliday\` tinyint NULL,
                \`isActive\` tinyint NOT NULL DEFAULT 1,
                \`note\` varchar(255) NULL,
                \`teamId\` int NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        await queryRunner.query(`
            CREATE TABLE \`user\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`email\` varchar(191) NOT NULL,
                \`password\` varchar(255) NOT NULL,
                \`isActive\` tinyint NOT NULL DEFAULT 0,
                \`teamId\` int NULL,
                \`roles\` text NOT NULL,
                \`firstName\` varchar(255) NOT NULL,
                \`lastName\` varchar(255) NOT NULL,
                \`lastNamePrefix\` varchar(255) NULL,
                \`phone\` varchar(255) NULL,
                \`phoneSecondary\` varchar(255) NULL,
                \`emailSecondary\` varchar(255) NULL,
                \`language\` enum ('en', 'nl') NOT NULL DEFAULT 'nl',
                \`employmentStatus\` enum ('new', 'active', 'exempt', 'on_hold', 'deceased', 'terminated') NOT NULL DEFAULT 'new',
                \`memberCardNumber\` varchar(255) NULL,
                \`memberCardNumberSecondary\` varchar(255) NULL,
                \`dateOfBirth\` datetime NULL,
                \`gender\` enum ('male', 'female', 'other') NOT NULL DEFAULT 'other',
                \`carryingCapacity\` enum ('low', 'medium', 'high') NULL DEFAULT 'medium',
                \`prefersOverlappingShift\` tinyint NULL DEFAULT 0,
                \`address\` varchar(255) NULL,
                \`postcode\` varchar(255) NULL,
                \`city\` varchar(255) NULL,
                \`nationality\` varchar(255) NULL,
                \`disabilities\` text NULL,
                \`specialties\` text NULL,
                \`noteByMember\` text NULL,
                \`noteByMarketLead\` text NULL,
                \`hasMarketDuty\` tinyint NOT NULL DEFAULT 1,
                \`hasPaidEntryFee\` tinyint NOT NULL DEFAULT 0,
                \`paymentId\` varchar(255) NULL,
                \`emailOptout\` tinyint NOT NULL DEFAULT 0,
                \`memberSince\` datetime NULL,
                \`memberUntil\` datetime NULL,
                \`rsvpScore\` int NOT NULL DEFAULT 0,
                \`absent\` tinyint NOT NULL DEFAULT 0,
                \`absentSince\` datetime NOT NULL,
                UNIQUE INDEX \`UQ_user_email\` (\`email\`),
                INDEX \`IDX_user_memberCardNumber\` (\`memberCardNumber\`),
                INDEX \`IDX_user_memberCardNumberSecondary\` (\`memberCardNumberSecondary\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        await queryRunner.query(`
            CREATE TABLE \`rsvp\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`response\` enum ('unknown', 'yes', 'no') NOT NULL DEFAULT 'unknown',
                \`eventId\` int NOT NULL,
                \`userId\` int NOT NULL,
                \`attended\` enum ('unknown', 'yes', 'no') NOT NULL DEFAULT 'unknown',
                \`overlappingShift\` tinyint NOT NULL DEFAULT 0,
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        await queryRunner.query(`
            CREATE TABLE \`todo\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`body\` varchar(255) NOT NULL,
                \`completed\` tinyint NULL DEFAULT 0,
                \`deadline\` datetime NULL,
                \`priority\` int NULL,
                \`assigneeId\` int NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        await queryRunner.query(`
            CREATE TABLE \`feedback\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`answers\` longtext NOT NULL,
                \`eventId\` int NULL,
                \`userId\` int NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        await queryRunner.query(`
            CREATE TABLE \`event_registration\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`priority\` int NOT NULL DEFAULT 1,
                \`teamId\` int NULL,
                \`eventId\` int NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        await queryRunner.query(`
            CREATE TABLE \`audit_log_line\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`action\` varchar(255) NOT NULL,
                \`resource\` varchar(255) NOT NULL,
                \`body\` longtext NOT NULL,
                \`userId\` int NULL,
                \`email\` varchar(255) NULL,
                \`roles\` text NULL,
                INDEX \`IDX_audit_log_line_action\` (\`action\`),
                INDEX \`IDX_audit_log_line_resource\` (\`resource\`),
                INDEX \`IDX_audit_log_line_userId\` (\`userId\`),
                INDEX \`IDX_audit_log_line_email\` (\`email\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        await queryRunner.query(`
            CREATE TABLE \`notification\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`title\` varchar(255) NOT NULL,
                \`body\` varchar(255) NOT NULL,
                \`link\` text NOT NULL,
                \`scheduledFor\` datetime NULL,
                \`recipientId\` int NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        await queryRunner.query(`
            CREATE TABLE \`event_message\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`subject\` varchar(255) NULL,
                \`body\` longtext NOT NULL,
                \`sentByUserId\` int NULL,
                \`eventId\` int NULL,
                \`recipientGroup\` enum ('0', '1', '2', '3') NULL DEFAULT '0',
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        await queryRunner.query(`
            CREATE TABLE \`staff_message\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`subject\` varchar(255) NULL,
                \`body\` longtext NOT NULL,
                \`sentByUserId\` int NULL,
                \`recipientGroups\` text NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        await queryRunner.query(`ALTER TABLE \`event\` ADD CONSTRAINT \`FK_event_team\` FOREIGN KEY (\`teamId\`) REFERENCES \`team\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD CONSTRAINT \`FK_user_team\` FOREIGN KEY (\`teamId\`) REFERENCES \`team\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`rsvp\` ADD CONSTRAINT \`FK_rsvp_event\` FOREIGN KEY (\`eventId\`) REFERENCES \`event\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`rsvp\` ADD CONSTRAINT \`FK_rsvp_user\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`todo\` ADD CONSTRAINT \`FK_todo_assignee\` FOREIGN KEY (\`assigneeId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`feedback\` ADD CONSTRAINT \`FK_feedback_event\` FOREIGN KEY (\`eventId\`) REFERENCES \`event\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`feedback\` ADD CONSTRAINT \`FK_feedback_user\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`event_registration\` ADD CONSTRAINT \`FK_event_registration_team\` FOREIGN KEY (\`teamId\`) REFERENCES \`team\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`event_registration\` ADD CONSTRAINT \`FK_event_registration_event\` FOREIGN KEY (\`eventId\`) REFERENCES \`event\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`audit_log_line\` ADD CONSTRAINT \`FK_audit_log_line_user\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`notification\` ADD CONSTRAINT \`FK_notification_recipient\` FOREIGN KEY (\`recipientId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`event_message\` ADD CONSTRAINT \`FK_event_message_user\` FOREIGN KEY (\`sentByUserId\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`event_message\` ADD CONSTRAINT \`FK_event_message_event\` FOREIGN KEY (\`eventId\`) REFERENCES \`event\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`staff_message\` ADD CONSTRAINT \`FK_staff_message_user\` FOREIGN KEY (\`sentByUserId\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`staff_message\` DROP FOREIGN KEY \`FK_staff_message_user\``);
        await queryRunner.query(`ALTER TABLE \`event_message\` DROP FOREIGN KEY \`FK_event_message_event\``);
        await queryRunner.query(`ALTER TABLE \`event_message\` DROP FOREIGN KEY \`FK_event_message_user\``);
        await queryRunner.query(`ALTER TABLE \`notification\` DROP FOREIGN KEY \`FK_notification_recipient\``);
        await queryRunner.query(`ALTER TABLE \`audit_log_line\` DROP FOREIGN KEY \`FK_audit_log_line_user\``);
        await queryRunner.query(`ALTER TABLE \`event_registration\` DROP FOREIGN KEY \`FK_event_registration_event\``);
        await queryRunner.query(`ALTER TABLE \`event_registration\` DROP FOREIGN KEY \`FK_event_registration_team\``);
        await queryRunner.query(`ALTER TABLE \`feedback\` DROP FOREIGN KEY \`FK_feedback_user\``);
        await queryRunner.query(`ALTER TABLE \`feedback\` DROP FOREIGN KEY \`FK_feedback_event\``);
        await queryRunner.query(`ALTER TABLE \`todo\` DROP FOREIGN KEY \`FK_todo_assignee\``);
        await queryRunner.query(`ALTER TABLE \`rsvp\` DROP FOREIGN KEY \`FK_rsvp_user\``);
        await queryRunner.query(`ALTER TABLE \`rsvp\` DROP FOREIGN KEY \`FK_rsvp_event\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_user_team\``);
        await queryRunner.query(`ALTER TABLE \`event\` DROP FOREIGN KEY \`FK_event_team\``);

        await queryRunner.query(`DROP TABLE \`staff_message\``);
        await queryRunner.query(`DROP TABLE \`event_message\``);
        await queryRunner.query(`DROP TABLE \`notification\``);
        await queryRunner.query(`DROP TABLE \`audit_log_line\``);
        await queryRunner.query(`DROP TABLE \`event_registration\``);
        await queryRunner.query(`DROP TABLE \`feedback\``);
        await queryRunner.query(`DROP TABLE \`todo\``);
        await queryRunner.query(`DROP TABLE \`rsvp\``);
        await queryRunner.query(`DROP TABLE \`user\``);
        await queryRunner.query(`DROP TABLE \`event\``);
        await queryRunner.query(`DROP TABLE \`team\``);
    }
}
