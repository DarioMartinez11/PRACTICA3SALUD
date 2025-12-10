-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: appsalud_db
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `basculas`
--

DROP TABLE IF EXISTS `basculas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `basculas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `paciente_id` int NOT NULL,
  `peso` decimal(5,2) NOT NULL,
  `altura` decimal(5,2) NOT NULL,
  `fecha_registro` datetime NOT NULL,
  `notas` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `idx_paciente` (`paciente_id`),
  KEY `idx_fecha` (`fecha_registro`),
  CONSTRAINT `basculas_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `basculas`
--

LOCK TABLES `basculas` WRITE;
/*!40000 ALTER TABLE `basculas` DISABLE KEYS */;
/*!40000 ALTER TABLE `basculas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pacientes`
--

DROP TABLE IF EXISTS `pacientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pacientes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int DEFAULT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellidos` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_nacimiento` date NOT NULL,
  `dni` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` text COLLATE utf8mb4_unicode_ci,
  `genero` enum('masculino','femenino','otro','M','F') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `altura` decimal(5,2) DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `dni` (`dni`),
  KEY `usuario_id` (`usuario_id`),
  KEY `idx_nombre` (`nombre`),
  KEY `idx_apellidos` (`apellidos`),
  KEY `idx_dni` (`dni`),
  CONSTRAINT `pacientes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pacientes`
--

LOCK TABLES `pacientes` WRITE;
/*!40000 ALTER TABLE `pacientes` DISABLE KEYS */;
INSERT INTO `pacientes` VALUES (4,1,'Dario','Martinez','2025-12-24','45382222P',NULL,NULL,NULL,NULL,NULL,'2025-12-10 17:25:42','2025-12-10 18:20:32'),(5,1,'Alicia','Vila','2005-12-24','45382292P','32131232321','dariomvila@gmail.com','CALLE SS','F',129.00,'2025-12-10 18:36:17','2025-12-10 18:42:50');
/*!40000 ALTER TABLE `pacientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `termometros`
--

DROP TABLE IF EXISTS `termometros`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `termometros` (
  `id` int NOT NULL AUTO_INCREMENT,
  `paciente_id` int NOT NULL,
  `temperatura` decimal(4,2) NOT NULL,
  `fecha_registro` datetime NOT NULL,
  `unidad` enum('celsius','fahrenheit') COLLATE utf8mb4_unicode_ci DEFAULT 'celsius',
  `sintomas` text COLLATE utf8mb4_unicode_ci,
  `notas` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `idx_paciente` (`paciente_id`),
  KEY `idx_fecha` (`fecha_registro`),
  CONSTRAINT `termometros_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `termometros`
--

LOCK TABLES `termometros` WRITE;
/*!40000 ALTER TABLE `termometros` DISABLE KEYS */;
/*!40000 ALTER TABLE `termometros` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tokens_csrf`
--

DROP TABLE IF EXISTS `tokens_csrf`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tokens_csrf` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expira_en` timestamp NOT NULL,
  `usado` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_token` (`token`),
  KEY `idx_token` (`token`),
  KEY `idx_usuario` (`usuario_id`),
  CONSTRAINT `tokens_csrf_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tokens_csrf`
--

LOCK TABLES `tokens_csrf` WRITE;
/*!40000 ALTER TABLE `tokens_csrf` DISABLE KEYS */;
/*!40000 ALTER TABLE `tokens_csrf` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol` enum('admin','medico','paciente') COLLATE utf8mb4_unicode_ci DEFAULT 'paciente',
  `activo` tinyint(1) DEFAULT '1',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ultimo_login` timestamp NULL DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_rol` (`rol`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'dariomvila@gmail.com','$2b$10$HeIIOrxUx9fJVX/C/c2n4.cEhe6qBliXqAOkVV0vss/aIoauLk17u','Dario','paciente',1,'2025-12-09 17:21:25',NULL,NULL);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-10 19:52:02
