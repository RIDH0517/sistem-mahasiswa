-- ============================================================
-- SiAkademik - Migration & Seeder
-- Database : db_akademik
-- Cara pakai: import file ini via phpMyAdmin, atau
--   mysql -u root < database/migration_seeder.sql
-- Akun demo : admin / admin123 (password disimpan SHA-256)
-- ============================================================

CREATE DATABASE IF NOT EXISTS `db_akademik` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `db_akademik`;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `mahasiswa`;
DROP TABLE IF EXISTS `prodi`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `nama_lengkap` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `prodi` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `kode_prodi` varchar(10) NOT NULL,
  `nama_prodi` varchar(100) NOT NULL,
  `jenjang` varchar(5) DEFAULT 'S1',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `kode_prodi` (`kode_prodi`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `mahasiswa` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nim` varchar(15) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `jenis_kelamin` enum('L','P') NOT NULL,
  `angkatan` year(4) NOT NULL,
  `prodi_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `nim` (`nim`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_mahasiswa_prodi` (`prodi_id`),
  CONSTRAINT `fk_mahasiswa_prodi` FOREIGN KEY (`prodi_id`) REFERENCES `prodi` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data users
INSERT INTO `users` (`id`, `username`, `nama_lengkap`, `email`, `password_hash`, `updated_at`) VALUES
(1, 'admin', 'Administrator Akademik', 'admin@akademik.ac.id', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', '2026-11-17 01:57:34');

-- Data prodi
INSERT INTO `prodi` (`id`, `kode_prodi`, `nama_prodi`, `jenjang`, `created_at`) VALUES
(1, 'PTE', 'Pendidikan Teknik Elektro', 'S1', '2026-11-16 23:56:14'),
(2, 'PTIK', 'Pendidikan Teknik Informatika dan Komputer', 'S1', '2026-11-16 23:56:14'),
(3, 'TE', 'Teknik Elektro', 'S1', '2026-11-16 23:56:14'),
(4, 'TEKKOM', 'Teknik Komputer', 'S1', '2026-11-16 23:56:14');

-- Data mahasiswa
INSERT INTO `mahasiswa` (`id`, `nim`, `nama`, `email`, `jenis_kelamin`, `angkatan`, `prodi_id`, `created_at`) VALUES
(1, '5301424001', 'Ahmad ', 'ahmad.saputra1@students.ac.id', 'L', 2023, 1, '2026-11-16 23:56:14'),
(2, '5302424002', 'Budi Saputra', 'budi.saputra2@students.ac.id', 'P', 2024, 2, '2026-11-16 23:56:14'),
(3, '5303424003', 'Citra Saputra', 'citra.saputra3@students.ac.id', 'L', 2025, 3, '2026-11-16 23:56:14'),
(4, '5304424004', 'Dewi Saputra', 'dewi.saputra4@students.ac.id', 'P', 2022, 4, '2026-11-16 23:56:14'),
(5, '5301424005', 'Eko Saputra', 'eko.saputra5@students.ac.id', 'L', 2023, 1, '2026-11-16 23:56:14'),
(6, '5302424006', 'Fajar Saputra', 'fajar.saputra6@students.ac.id', 'P', 2024, 2, '2026-11-16 23:56:14'),
(7, '5303424007', 'Gita Saputra', 'gita.saputra7@students.ac.id', 'L', 2025, 3, '2026-11-16 23:56:14'),
(8, '5304424008', 'Hendra Saputra', 'hendra.saputra8@students.ac.id', 'P', 2022, 4, '2026-11-16 23:56:14'),
(9, '5301424009', 'Indah Saputra', 'indah.saputra9@students.ac.id', 'L', 2023, 1, '2026-11-16 23:56:14'),
(10, '5302424010', 'Joko Saputra', 'joko.saputra10@students.ac.id', 'P', 2024, 2, '2026-11-16 23:56:14'),
(11, '5303424011', 'Ahmad Pratama', 'ahmad.pratama11@students.ac.id', 'L', 2025, 3, '2026-11-16 23:56:14'),
(12, '5304424012', 'Budi Pratama', 'budi.pratama12@students.ac.id', 'P', 2022, 4, '2026-11-16 23:56:14'),
(13, '5301424013', 'Citra Pratama', 'citra.pratama13@students.ac.id', 'L', 2023, 1, '2026-11-16 23:56:14'),
(14, '5302424014', 'Dewi Pratama', 'dewi.pratama14@students.ac.id', 'P', 2024, 2, '2026-11-16 23:56:14'),
(15, '5303424015', 'Eko Pratama', 'eko.pratama15@students.ac.id', 'L', 2025, 3, '2026-11-16 23:56:14'),
(16, '5304424016', 'Fajar Pratama', 'fajar.pratama16@students.ac.id', 'P', 2022, 4, '2026-11-16 23:56:14'),
(17, '5301424017', 'Gita Pratama', 'gita.pratama17@students.ac.id', 'L', 2023, 1, '2026-11-16 23:56:14'),
(18, '5302424018', 'Hendra Pratama', 'hendra.pratama18@students.ac.id', 'P', 2024, 2, '2026-11-16 23:56:14'),
(19, '5303424019', 'Indah Pratama', 'indah.pratama19@students.ac.id', 'L', 2025, 3, '2026-11-16 23:56:14'),
(20, '5304424020', 'Joko Pratama', 'joko.pratama20@students.ac.id', 'P', 2022, 4, '2026-11-16 23:56:14'),
(21, '5301424021', 'Ahmad Wijaya', 'ahmad.wijaya21@students.ac.id', 'L', 2023, 1, '2026-11-16 23:56:14'),
(22, '5302424022', 'Budi Wijaya', 'budi.wijaya22@students.ac.id', 'P', 2024, 2, '2026-11-16 23:56:14'),
(23, '5303424023', 'Citra Wijaya', 'citra.wijaya23@students.ac.id', 'L', 2025, 3, '2026-11-16 23:56:14'),
(24, '5304424024', 'Dewi Wijaya', 'dewi.wijaya24@students.ac.id', 'P', 2022, 4, '2026-11-16 23:56:14'),
(25, '5301424025', 'Eko Wijaya', 'eko.wijaya25@students.ac.id', 'L', 2023, 1, '2026-11-16 23:56:14'),
(26, '5302424026', 'Fajar Wijaya', 'fajar.wijaya26@students.ac.id', 'P', 2024, 2, '2026-11-16 23:56:14'),
(27, '5303424027', 'Gita Wijaya', 'gita.wijaya27@students.ac.id', 'L', 2025, 3, '2026-11-16 23:56:14'),
(28, '5304424028', 'Hendra Wijaya', 'hendra.wijaya28@students.ac.id', 'P', 2022, 4, '2026-11-16 23:56:14'),
(29, '5301424029', 'Indah Wijaya', 'indah.wijaya29@students.ac.id', 'L', 2023, 1, '2026-11-16 23:56:14'),
(30, '5302424030', 'Joko Wijaya', 'joko.wijaya30@students.ac.id', 'P', 2024, 2, '2026-11-16 23:56:14'),
(31, '5303424031', 'Ahmad Kusuma', 'ahmad.kusuma31@students.ac.id', 'L', 2025, 3, '2026-11-16 23:56:14'),
(32, '5304424032', 'Budi Kusuma', 'budi.kusuma32@students.ac.id', 'P', 2022, 4, '2026-11-16 23:56:14'),
(33, '5301424033', 'Citra Kusuma', 'citra.kusuma33@students.ac.id', 'L', 2023, 1, '2026-11-16 23:56:14'),
(34, '5302424034', 'Dewi Kusuma', 'dewi.kusuma34@students.ac.id', 'P', 2024, 2, '2026-11-16 23:56:14'),
(35, '5303424035', 'Eko Kusuma', 'eko.kusuma35@students.ac.id', 'L', 2025, 3, '2026-11-16 23:56:14'),
(36, '5304424036', 'Fajar Kusuma', 'fajar.kusuma36@students.ac.id', 'P', 2022, 4, '2026-11-16 23:56:14'),
(37, '5301424037', 'Gita Kusuma', 'gita.kusuma37@students.ac.id', 'L', 2023, 1, '2026-11-16 23:56:14'),
(38, '5302424038', 'Hendra Kusuma', 'hendra.kusuma38@students.ac.id', 'P', 2024, 2, '2026-11-16 23:56:14'),
(39, '5303424039', 'Indah Kusuma', 'indah.kusuma39@students.ac.id', 'L', 2025, 3, '2026-11-16 23:56:14'),
(40, '5304424040', 'Joko Kusuma', 'joko.kusuma40@students.ac.id', 'P', 2022, 4, '2026-11-16 23:56:14'),
(41, '5301424041', 'Ahmad Hidayat', 'ahmad.hidayat41@students.ac.id', 'L', 2023, 1, '2026-11-16 23:56:14'),
(42, '5302424042', 'Budi Hidayat', 'budi.hidayat42@students.ac.id', 'P', 2024, 2, '2026-11-16 23:56:14'),
(43, '5303424043', 'Citra Hidayat', 'citra.hidayat43@students.ac.id', 'L', 2025, 3, '2026-11-16 23:56:14'),
(44, '5304424044', 'Dewi Hidayat', 'dewi.hidayat44@students.ac.id', 'P', 2022, 4, '2026-11-16 23:56:14'),
(45, '5301424045', 'Eko Hidayat', 'eko.hidayat45@students.ac.id', 'L', 2023, 1, '2026-11-16 23:56:14'),
(46, '5302424046', 'Fajar Hidayat', 'fajar.hidayat46@students.ac.id', 'P', 2024, 2, '2026-11-16 23:56:14'),
(47, '5303424047', 'Gita Hidayat', 'gita.hidayat47@students.ac.id', 'L', 2025, 3, '2026-11-16 23:56:14'),
(48, '5304424048', 'Hendra Hidayat', 'hendra.hidayat48@students.ac.id', 'P', 2022, 4, '2026-11-16 23:56:14'),
(49, '5301424049', 'Indah Hidayat', 'indah.hidayat49@students.ac.id', 'L', 2023, 1, '2026-11-16 23:56:14'),
(50, '5302424050', 'Joko Hidayat', 'joko.hidayat50@students.ac.id', 'P', 2024, 2, '2026-11-16 23:56:14'),
(51, '5303424051', 'Ahmad Nugroho', 'ahmad.nugroho51@students.ac.id', 'L', 2025, 3, '2026-11-16 23:56:14'),
(52, '5304424052', 'Budi Nugroho', 'budi.nugroho52@students.ac.id', 'P', 2022, 4, '2026-11-16 23:56:14'),
(53, '5301424053', 'Citra Nugroho', 'citra.nugroho53@students.ac.id', 'L', 2023, 1, '2026-11-16 23:56:14'),
(54, '5302424054', 'Dewi Nugroho', 'dewi.nugroho54@students.ac.id', 'P', 2024, 2, '2026-11-16 23:56:14'),
(55, '5303424055', 'Eko Nugroho', 'eko.nugroho55@students.ac.id', 'L', 2025, 3, '2026-11-16 23:56:14'),
(56, '5304424056', 'Fajar Nugroho', 'fajar.nugroho56@students.ac.id', 'P', 2022, 4, '2026-11-16 23:56:14'),
(57, '5301424057', 'Gita Nugroho', 'gita.nugroho57@students.ac.id', 'L', 2023, 1, '2026-11-16 23:56:14'),
(58, '5302424058', 'Hendra Nugroho', 'hendra.nugroho58@students.ac.id', 'P', 2024, 2, '2026-11-16 23:56:14'),
(59, '5303424059', 'Indah Nugroho', 'indah.nugroho59@students.ac.id', 'L', 2025, 3, '2026-11-16 23:56:14'),
(60, '5304424060', 'Joko Nugroho', 'joko.nugroho60@students.ac.id', 'P', 2022, 4, '2026-11-16 23:56:14'),
(61, '5301424061', 'Ahmad Santoso', 'ahmad.santoso61@students.ac.id', 'L', 2023, 1, '2026-11-16 23:56:14'),
(62, '5302424062', 'Budi Santoso', 'budi.santoso62@students.ac.id', 'P', 2024, 2, '2026-11-16 23:56:14'),
(63, '5303424063', 'Citra Santoso', 'citra.santoso63@students.ac.id', 'L', 2025, 3, '2026-11-16 23:56:14'),
(64, '5304424064', 'Dewi Santoso', 'dewi.santoso64@students.ac.id', 'P', 2022, 4, '2026-11-16 23:56:14'),
(65, '5301424065', 'Eko Santoso', 'eko.santoso65@students.ac.id', 'L', 2023, 1, '2026-11-16 23:56:14'),
(66, '5302424066', 'Fajar Santoso', 'fajar.santoso66@students.ac.id', 'P', 2024, 2, '2026-11-16 23:56:14'),
(67, '5303424067', 'Gita Santoso', 'gita.santoso67@students.ac.id', 'L', 2025, 3, '2026-11-16 23:56:14'),
(68, '5304424068', 'Hendra Santoso', 'hendra.santoso68@students.ac.id', 'P', 2022, 4, '2026-11-16 23:56:14'),
(69, '5301424069', 'Indah Santoso', 'indah.santoso69@students.ac.id', 'L', 2023, 1, '2026-11-16 23:56:14'),
(70, '5302424070', 'Joko Santoso', 'joko.santoso70@students.ac.id', 'P', 2024, 2, '2026-11-16 23:56:14'),
(71, '5303424071', 'Ahmad Lestari', 'ahmad.lestari71@students.ac.id', 'L', 2025, 3, '2026-11-16 23:56:14'),
(72, '5304424072', 'Budi Lestari', 'budi.lestari72@students.ac.id', 'P', 2022, 4, '2026-11-16 23:56:14'),
(73, '5301424073', 'Citra Lestari', 'citra.lestari73@students.ac.id', 'L', 2023, 1, '2026-11-16 23:56:14'),
(74, '5302424074', 'Dewi Lestari', 'dewi.lestari74@students.ac.id', 'P', 2024, 2, '2026-11-16 23:56:14'),
(75, '5303424075', 'Eko Lestari', 'eko.lestari75@students.ac.id', 'L', 2025, 3, '2026-11-16 23:56:14'),
(76, '5304424076', 'Fajar Lestari', 'fajar.lestari76@students.ac.id', 'P', 2022, 4, '2026-11-16 23:56:14'),
(77, '5301424077', 'Gita Lestari', 'gita.lestari77@students.ac.id', 'L', 2023, 1, '2026-11-16 23:56:14'),
(78, '5302424078', 'Hendra Lestari', 'hendra.lestari78@students.ac.id', 'P', 2024, 2, '2026-11-16 23:56:14'),
(79, '5303424079', 'Indah Lestari', 'indah.lestari79@students.ac.id', 'L', 2025, 3, '2026-11-16 23:56:14'),
(80, '5304424080', 'Joko Lestari', 'joko.lestari80@students.ac.id', 'P', 2022, 4, '2026-11-16 23:56:14'),
(81, '5301424081', 'Ahmad Setiawan', 'ahmad.setiawan81@students.ac.id', 'L', 2023, 1, '2026-11-16 23:56:14'),
(82, '5302424082', 'Budi Setiawan', 'budi.setiawan82@students.ac.id', 'P', 2024, 2, '2026-11-16 23:56:14'),
(83, '5303424083', 'Citra Setiawan', 'citra.setiawan83@students.ac.id', 'L', 2025, 3, '2026-11-16 23:56:14'),
(84, '5304424084', 'Dewi Setiawan', 'dewi.setiawan84@students.ac.id', 'P', 2022, 4, '2026-11-16 23:56:14'),
(85, '5301424085', 'Eko Setiawan', 'eko.setiawan85@students.ac.id', 'L', 2023, 1, '2026-11-16 23:56:14'),
(86, '5302424086', 'Fajar Setiawan', 'fajar.setiawan86@students.ac.id', 'P', 2024, 2, '2026-11-16 23:56:14'),
(87, '5303424087', 'Gita Setiawan', 'gita.setiawan87@students.ac.id', 'L', 2025, 3, '2026-11-16 23:56:14'),
(88, '5304424088', 'Hendra Setiawan', 'hendra.setiawan88@students.ac.id', 'P', 2022, 4, '2026-11-16 23:56:14'),
(89, '5301424089', 'Indah Setiawan', 'indah.setiawan89@students.ac.id', 'L', 2023, 1, '2026-11-16 23:56:14'),
(90, '5302424090', 'Joko Setiawan', 'joko.setiawan90@students.ac.id', 'P', 2024, 2, '2026-11-16 23:56:14'),
(91, '5303424091', 'Ahmad Rahmawati', 'ahmad.rahmawati91@students.ac.id', 'L', 2025, 3, '2026-11-16 23:56:14'),
(92, '5304424092', 'Budi Rahmawati', 'budi.rahmawati92@students.ac.id', 'P', 2022, 4, '2026-11-16 23:56:14'),
(93, '5301424093', 'Citra Rahmawati', 'citra.rahmawati93@students.ac.id', 'L', 2023, 1, '2026-11-16 23:56:14'),
(94, '5302424094', 'Dewi Rahmawati', 'dewi.rahmawati94@students.ac.id', 'P', 2024, 2, '2026-11-16 23:56:14'),
(95, '5303424095', 'Eko Rahmawati', 'eko.rahmawati95@students.ac.id', 'L', 2025, 3, '2026-11-16 23:56:14'),
(96, '5304424096', 'Fajar Rahmawati', 'fajar.rahmawati96@students.ac.id', 'P', 2022, 4, '2026-11-16 23:56:14'),
(97, '5301424097', 'Gita Rahmawati', 'gita.rahmawati97@students.ac.id', 'L', 2023, 1, '2026-11-16 23:56:14'),
(98, '5302424098', 'Hendra Rahmawati', 'hendra.rahmawati98@students.ac.id', 'P', 2024, 2, '2026-11-16 23:56:14'),
(99, '5303424099', 'Indah Rahmawati', 'indah.rahmawati99@students.ac.id', 'L', 2025, 3, '2026-11-16 23:56:14'),
(100, '5304424100', 'Joko Rahmawati', 'joko.rahmawati100@students.ac.id', 'P', 2022, 4, '2026-11-16 23:56:14');

