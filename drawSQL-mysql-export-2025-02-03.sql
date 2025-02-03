CREATE TABLE `Pump`(
    `PumpID` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `Model` TEXT NOT NULL,
    `Quantity` BIGINT NOT NULL COMMENT 'continuous',
    `PartNumber` BIGINT NOT NULL COMMENT 'discrete',
    `Brand` TEXT NOT NULL,
    `Manual` TEXT NOT NULL
);
CREATE TABLE `System`(
    `SystemID` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `SystemName` TEXT NOT NULL,
    `Aerator` TEXT NULL,
    `PumpID` BIGINT NULL COMMENT 'discrete',
    `Description` TEXT NOT NULL,
    `AdditionalComp` TEXT NULL,
    `Manufacturer` TEXT NOT NULL,
    `GPD` BIGINT NOT NULL COMMENT 'continuous',
    `Manual` TEXT NOT NULL
);
CREATE TABLE `MaintenanceLog`(
    `MaintenanceID` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `SystemID` BIGINT NULL COMMENT 'discrete',
    `ProjectID` BIGINT NULL COMMENT 'discrete',
    `Date` DATE NOT NULL,
    `Description` TEXT NOT NULL,
    `ScheduleID` BIGINT NULL COMMENT 'discrete'
);
CREATE TABLE `Project`(
    `ProjectID` BIGINT NOT NULL AUTO_INCREMENT,
    `ProjectName` TEXT NOT NULL,
    `Description` TEXT NOT NULL,
    `Funded` BINARY(16) NOT NULL,
    `StartDate` DATE NOT NULL,
    `EndDate` DATE NULL,
    PRIMARY KEY(`ProjectName`)
);
CREATE TABLE `Schedule`(
    `ScheduleID` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `Date` DATE NOT NULL,
    `Description` TEXT NOT NULL
);
ALTER TABLE
    `Project` ADD CONSTRAINT `project_projectid_foreign` FOREIGN KEY(`ProjectID`) REFERENCES `MaintenanceLog`(`ProjectID`);
ALTER TABLE
    `System` ADD CONSTRAINT `system_pumpid_foreign` FOREIGN KEY(`PumpID`) REFERENCES `Pump`(`PumpID`);
ALTER TABLE
    `MaintenanceLog` ADD CONSTRAINT `maintenancelog_systemid_foreign` FOREIGN KEY(`SystemID`) REFERENCES `System`(`SystemID`);
ALTER TABLE
    `MaintenanceLog` ADD CONSTRAINT `maintenancelog_scheduleid_foreign` FOREIGN KEY(`ScheduleID`) REFERENCES `Schedule`(`ScheduleID`);