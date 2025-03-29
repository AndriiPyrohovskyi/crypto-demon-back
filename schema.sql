-- MySQL Script generated by MySQL Workbench
-- Sat Mar 29 16:37:32 2025
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema crypto-demon
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema crypto-demon
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `crypto-demon` DEFAULT CHARACTER SET utf8 ;
USE `crypto-demon` ;

-- -----------------------------------------------------
-- Table `crypto-demon`.`Users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `crypto-demon`.`Users` (
  `user_uid` INT NOT NULL,
  `user_nickname` VARCHAR(45) NULL,
  `user_email` VARCHAR(45) NULL,
  `user_balance` VARCHAR(45) NULL,
  `user_createdAt` VARCHAR(45) NULL,
  `user_avatarUrl` VARCHAR(45) NULL,
  `user_role` VARCHAR(45) NULL,
  `user_lastLogin` VARCHAR(45) NULL,
  PRIMARY KEY (`user_uid`),
  UNIQUE INDEX `user_id_UNIQUE` (`user_uid` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `crypto-demon`.`Currency`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `crypto-demon`.`Currency` (
  `currency_id` INT NOT NULL,
  `currency_logoUrl` VARCHAR(45) NULL,
  `currency_name` VARCHAR(45) NULL,
  PRIMARY KEY (`currency_id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `crypto-demon`.`Transactions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `crypto-demon`.`Transactions` (
  `transaction_id` INT NOT NULL AUTO_INCREMENT,
  `transaction_time` DATETIME NULL,
  `transaction_value` VARCHAR(45) NULL,
  `transaction_price` VARCHAR(45) NULL,
  `transaction_fee` VARCHAR(45) NULL,
  PRIMARY KEY (`transaction_id`),
  CONSTRAINT `user_sender_uid`
    FOREIGN KEY ()
    REFERENCES `crypto-demon`.`Users` ()
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `user_recipient_uid`
    FOREIGN KEY ()
    REFERENCES `crypto-demon`.`Users` ()
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `currency_first_id`
    FOREIGN KEY ()
    REFERENCES `crypto-demon`.`Currency` ()
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `currency_second_id`
    FOREIGN KEY ()
    REFERENCES `crypto-demon`.`Currency` ()
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `crypto-demon`.`Exchanges`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `crypto-demon`.`Exchanges` (
  `exchange_id` INT NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`exchange_id`),
  CONSTRAINT `transaction1`
    FOREIGN KEY ()
    REFERENCES `crypto-demon`.`Transactions` ()
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `transaction2`
    FOREIGN KEY ()
    REFERENCES `crypto-demon`.`Transactions` ()
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `crypto-demon`.`Trades`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `crypto-demon`.`Trades` (
  `trade_id` INT NOT NULL AUTO_INCREMENT,
  `trade_margin` VARCHAR(45) NULL,
  `trade_BuySell` VARCHAR(45) NULL,
  `trade_leverage` VARCHAR(45) NULL,
  `trade_value` VARCHAR(45) NULL,
  `trade_boughtAtPrice` VARCHAR(45) NULL,
  `trade_liquidationPrice` VARCHAR(45) NULL,
  `trade_status` VARCHAR(45) NULL,
  `trade_fixedUserProfit` VARCHAR(45) NULL,
  `trade_fixedCompanyProfit` VARCHAR(45) NULL,
  PRIMARY KEY (`trade_id`),
  CONSTRAINT `user_uid`
    FOREIGN KEY ()
    REFERENCES `crypto-demon`.`Users` ()
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `currency_id`
    FOREIGN KEY ()
    REFERENCES `crypto-demon`.`Currency` ()
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
