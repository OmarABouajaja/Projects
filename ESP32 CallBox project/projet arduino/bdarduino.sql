-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Dec 11, 2023 at 11:56 AM
-- Server version: 8.2.0
-- PHP Version: 8.2.13

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `bdarduino`
--
CREATE DATABASE IF NOT EXISTS `bdarduino` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `bdarduino`;

-- --------------------------------------------------------

--
-- Table structure for table `logistique`
--

DROP TABLE IF EXISTS `logistique`;
CREATE TABLE IF NOT EXISTS `logistique` (
  `id` int NOT NULL AUTO_INCREMENT,
  `temps` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ID_machine` varchar(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `logistique`
--

INSERT INTO `logistique` (`id`, `temps`, `ID_machine`) VALUES
(1, '2023-12-11 11:48:29', 'test'),
(2, '2023-12-11 11:52:19', 'test1'),
(3, '2023-12-11 11:53:09', 'test2');

-- --------------------------------------------------------

--
-- Table structure for table `pivot`
--

DROP TABLE IF EXISTS `pivot`;
CREATE TABLE IF NOT EXISTS `pivot` (
  `id` int NOT NULL AUTO_INCREMENT,
  `temps` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ID_machine` varchar(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `pivot`
--

INSERT INTO `pivot` (`id`, `temps`, `ID_machine`) VALUES
(1, '2023-12-11 11:47:11', ''),
(2, '2023-12-11 11:48:29', 'test');

-- --------------------------------------------------------

--
-- Table structure for table `qualité`
--

DROP TABLE IF EXISTS `qualité`;
CREATE TABLE IF NOT EXISTS `qualité` (
  `id` int NOT NULL AUTO_INCREMENT,
  `temps` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ID_machine` varchar(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `qualité`
--

INSERT INTO `qualité` (`id`, `temps`, `ID_machine`) VALUES
(1, '2023-12-11 11:48:29', 'test');

-- --------------------------------------------------------

--
-- Table structure for table `tecnicien`
--

DROP TABLE IF EXISTS `tecnicien`;
CREATE TABLE IF NOT EXISTS `tecnicien` (
  `id` int NOT NULL AUTO_INCREMENT,
  `temps` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ID_machine` varchar(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `tecnicien`
--

INSERT INTO `tecnicien` (`id`, `temps`, `ID_machine`) VALUES
(1, '2023-12-11 11:48:29', 'test');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
