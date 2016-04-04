DROP DATABASE IF EXISTS `p2p_assessment_db`;
CREATE DATABASE `p2p_assessment_db` DEFAULT CHARACTER SET utf8;
USE `p2p_assessment_db`;

-- MySQL Import

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `criteria`
--

DROP TABLE IF EXISTS `criteria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `criteria` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `topic` varchar(255) NOT NULL,
  `projectId` int(11) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `fk_project_idx` (`projectId`),
  CONSTRAINT `fk_c_project` FOREIGN KEY (`projectId`) REFERENCES `project` (`id`) ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `information`
--

DROP TABLE IF EXISTS `information`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `information` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `teammemberId` int(11) NOT NULL,
  `type` varchar(10) NOT NULL DEFAULT 'info',
  `text` text,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_i_teammember_idx` (`teammemberId`),
  CONSTRAINT `fk_i_teammember` FOREIGN KEY (`teammemberId`) REFERENCES `teammember` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `project`
--

DROP TABLE IF EXISTS `project`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `project` (
  `id` int(11) NOT NULL,
  `title` varchar(45) NOT NULL,
  `projectState` varchar(10) NOT NULL DEFAULT 'open',
  `criteriaTitle` varchar(45) DEFAULT 'P2P Assessment Kriterien',
  `isOpenRating` char(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rating`
--

DROP TABLE IF EXISTS `rating`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rating` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `criteriaId` int(11) DEFAULT NULL,
  `ref` int(11) NOT NULL,
  `refType` varchar(10) DEFAULT 'item' COMMENT '‘item’ = rating item\n‘reference’ = rating item reference',
  `description` varchar(255) DEFAULT '',
  `symbol` varchar(10) NOT NULL,
  `value` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `CriteriaIndex` (`criteriaId`,`ref`),
  CONSTRAINT `fk_r_criteria` FOREIGN KEY (`criteriaId`) REFERENCES `criteria` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `role` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(45) NOT NULL,
  `symbol` varchar(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `teammember`
--

DROP TABLE IF EXISTS `teammember`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `teammember` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(127) NOT NULL,
  `password` varchar(45) NOT NULL,
  `name` varchar(127) NOT NULL,
  `ratingState` varchar(10) NOT NULL DEFAULT 'open' COMMENT '‘open’\n‘closed’',
  `roleId` int(11) DEFAULT NULL,
  `projectId` int(11) DEFAULT '1',
  `isAdmin` char(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username_idx` (`username`),
  KEY `fk_project_idx` (`projectId`),
  KEY `fk_roleId_idx` (`roleId`),
  CONSTRAINT `fk_t_project` FOREIGN KEY (`projectId`) REFERENCES `project` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_t_role` FOREIGN KEY (`roleId`) REFERENCES `role` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `teammember_rating`
--

DROP TABLE IF EXISTS `teammember_rating`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `teammember_rating` (
  `userId` int(11) NOT NULL,
  `teammemberId` int(11) NOT NULL,
  `criteriaId` int(11) NOT NULL,
  `rating` int(11) DEFAULT NULL,
  `comment` varchar(127) DEFAULT NULL,
  PRIMARY KEY (`teammemberId`,`criteriaId`,`userId`),
  KEY `fk_user_idx` (`userId`),
  KEY `fk_tr_criteria_idx` (`criteriaId`),
  CONSTRAINT `fk_tr_criteria` FOREIGN KEY (`criteriaId`) REFERENCES `criteria` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_tr_teammember` FOREIGN KEY (`teammemberId`) REFERENCES `teammember` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_tr_user` FOREIGN KEY (`userId`) REFERENCES `teammember` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;


-- 
-- Insert Project & Admin User
--
INSERT INTO `project` (`id`, `title`) 
VALUES (1, '<Projekttitel>');

INSERT INTO `role` (`id`,`title`,`symbol`) 
VALUES (1,'Quality Manager','QM');

-- Passwort: p2pChef
INSERT INTO `teammember` (`id`,`username`,`password`,`name`,`roleId`,`projectId`,`isAdmin`)
VALUES (1,'Admin', '7912bb230046995154d08b75cf54955f', 'Admin (QM)', 1, 1, '1');
