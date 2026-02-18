CREATE TABLE `alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`serviceId` int,
	`alertType` enum('vencimiento_7d','vencimiento_3d','vencimiento_hoy','pago_vencido') NOT NULL,
	`alertDate` timestamp NOT NULL,
	`message` text NOT NULL,
	`isSent` int NOT NULL DEFAULT 0,
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`document` varchar(100),
	`phone` varchar(50),
	`email` varchar(320),
	`address` text,
	`contactPerson` varchar(255),
	`notes` text,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoiceItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceId` int NOT NULL,
	`serviceId` int,
	`description` text NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`unitPrice` int NOT NULL,
	`totalPrice` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invoiceItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceNumber` varchar(100) NOT NULL,
	`clientId` int NOT NULL,
	`issueDate` timestamp NOT NULL,
	`dueDate` timestamp NOT NULL,
	`totalAmount` int NOT NULL,
	`status` enum('borrador','emitida','pagada','vencida','anulada') NOT NULL DEFAULT 'borrador',
	`pdfUrl` varchar(500),
	`pdfKey` varchar(500),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`serviceId` int,
	`amount` int NOT NULL,
	`paymentDate` timestamp NOT NULL,
	`dueDate` timestamp NOT NULL,
	`status` enum('pendiente','pagado','vencido') NOT NULL DEFAULT 'pendiente',
	`paymentMethod` varchar(100),
	`reference` varchar(255),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`serviceType` enum('hosting','dominio','correos','ssl','mantenimiento','otro') NOT NULL,
	`serviceName` varchar(255) NOT NULL,
	`platform` varchar(255),
	`startDate` timestamp NOT NULL,
	`renewalDate` timestamp NOT NULL,
	`billingCycle` enum('mensual','anual','otro') NOT NULL,
	`amount` int NOT NULL,
	`status` enum('activo','suspendido','cancelado') NOT NULL DEFAULT 'activo',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `services_id` PRIMARY KEY(`id`)
);
