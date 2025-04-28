-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2025. Már 05. 13:21
-- Kiszolgáló verziója: 10.4.28-MariaDB
-- PHP verzió: 8.1.17

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
-- CREATE DATABASE IF NOT EXISTS tradeblazer CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
-- USE tradeblazer;
--
-- Adatbázis: `tradeblazer`
--

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `activity_log`
--

CREATE TABLE `activity_log` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `action` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `activity_log`
--

INSERT INTO `activity_log` (`id`, `user_id`, `action`, `description`, `created_at`) VALUES
(1, 3, 'Logged in', 'User logged in', '2025-03-05 12:05:12'),
(2, 8, 'Deposited funds', 'User deposited funds', '2025-03-05 12:05:12'),
(3, 1, 'Updated profile', 'User updated their profile', '2025-03-05 12:05:12'),
(4, 6, 'Logged in', 'User logged in', '2025-03-05 12:05:12'),
(5, 9, 'Updated profile', 'User updated their profile', '2025-03-05 12:05:12'),
(6, 10, 'Placed an order', 'User placed an order', '2025-03-05 12:05:12'),
(7, 1, 'Deposited funds', 'User deposited funds', '2025-03-05 12:05:12'),
(8, 2, 'Deposited funds', 'User deposited funds', '2025-03-05 12:05:12'),
(9, 6, 'Updated profile', 'User updated their profile', '2025-03-05 12:05:12'),
(10, 6, 'Placed an order', 'User placed an order', '2025-03-05 12:05:12'),
(11, 15, 'Deposited funds', 'User deposited funds amounting to 8000.00 USD', '2025-03-05 15:31:00'),
(12, 16, 'Placed an order', 'User placed a sell order for 20 shares of MSFT', '2025-03-05 15:51:00'),
(13, 17, 'Bought crypto', 'User bought 10 XRP/USD', '2025-03-05 16:16:00'),
(14, 18, 'Sold assets', 'User sold 8 AAPL/USD', '2025-03-05 16:26:00'),
(15, 19, 'Bought stock', 'User bought 20 shares of AAPL', '2025-03-05 16:36:00'),
(16, 20, 'Bought a stock', 'User bought 1 share of Meta Platforms Inc', '2025-03-05 16:46:00'),
(17, 21, 'Sold forex', 'User sold 10 USD/JPY', '2025-03-05 16:57:00'),
(18, 22, 'Bought crypto', 'User bought 60 ADA/USD', '2025-03-05 17:21:00'),
(19, 23, 'Bought stocks', 'User bought 3 DJIA', '2025-03-05 17:29:00'),
(20, 24, 'Sold stocks', 'User sold 2 Netflix stocks', '2025-03-05 17:41:00'),
(21, 1, 'Logged in', 'User logged in', '2025-04-04 09:00:00'),
(22, 5, 'Deposited funds', 'User deposited funds amounting to 1500.00 USD', '2025-04-04 09:02:00'),
(23, 10, 'Updated profile', 'User updated their profile', '2025-04-04 09:03:00'),
(24, 14, 'Placed an order', 'User placed an order for 50 shares of NVDA', '2025-04-04 09:05:00'),
(25, 8, 'Logged in', 'User logged in', '2025-04-04 09:06:00'),
(26, 7, 'Bought crypto', 'User bought 5 ETH/USD', '2025-04-04 09:07:00'),
(27, 6, 'Sold assets', 'User sold 20 shares of TSLA', '2025-04-04 09:10:00'),
(28, 24, 'Bought stock', 'User bought 10 shares of DIS', '2025-04-04 09:11:00'),
(29, 12, 'Logged in', 'User logged in', '2025-04-04 09:13:00'),
(30, 16, 'Updated profile', 'User updated their profile', '2025-04-04 09:15:00'),
(31, 2, 'Sold forex', 'User sold 50 USD/EUR', '2025-04-04 09:16:00'),
(32, 22, 'Deposited funds', 'User deposited funds amounting to 2000.00 USD', '2025-04-04 09:18:00'),
(33, 21, 'Updated profile', 'User updated their profile', '2025-04-04 09:19:00'),
(34, 11, 'Bought crypto', 'User bought 10 BTC/USD', '2025-04-04 09:20:00'),
(35, 3, 'Placed an order', 'User placed a limit order for XRP', '2025-04-04 09:21:00'),
(36, 2, 'Logged in', 'User logged in', '2025-04-05 08:00:00'),
(37, 3, 'Deposited funds', 'User deposited funds amounting to 1500.00 USD', '2025-04-05 08:05:00'),
(38, 4, 'Updated profile', 'User updated their profile', '2025-04-05 08:10:00'),
(39, 5, 'Placed an order', 'User placed an order', '2025-04-05 08:15:00'),
(40, 6, 'Logged in', 'User logged in', '2025-04-05 08:20:00'),
(41, 7, 'Deposited funds', 'User deposited funds', '2025-04-05 08:25:00'),
(42, 8, 'Updated profile', 'User updated their profile', '2025-04-05 08:30:00'),
(43, 9, 'Placed an order', 'User placed an order', '2025-04-05 08:35:00'),
(44, 10, 'Sold assets', 'User sold 5 shares of Tesla', '2025-04-05 08:40:00'),
(45, 15, 'Bought crypto', 'User bought 20 ETH/USD', '2025-04-05 08:45:00'),
(46, 16, 'Logged out', 'User logged out', '2025-04-05 08:50:00'),
(47, 17, 'Bought stock', 'User bought 8 shares of Amazon', '2025-04-05 08:55:00'),
(48, 18, 'Logged in', 'User logged in', '2025-04-05 09:00:00'),
(49, 19, 'Sold crypto', 'User sold 10 BTC/USD', '2025-04-05 09:05:00'),
(50, 20, 'Deposited funds', 'User deposited funds', '2025-04-05 09:10:00'),
(51, 21, 'Updated profile', 'User updated their profile', '2025-04-05 09:15:00'),
(52, 22, 'Logged in', 'User logged in', '2025-04-05 09:20:00'),
(53, 23, 'Sold assets', 'User sold 3 stocks of Apple', '2025-04-05 09:25:00'),
(54, 24, 'Bought crypto', 'User bought 50 DOGE/USD', '2025-04-05 09:30:00'),
(55, 25, 'Logged out', 'User logged out', '2025-04-05 09:35:00'),
(56, 26, 'Logged in', 'User logged in', '2025-04-05 09:40:00'),
(57, 27, 'Bought stock', 'User bought 10 shares of Microsoft', '2025-04-05 09:45:00'),
(58, 28, 'Deposited funds', 'User deposited funds', '2025-04-05 09:50:00'),
(59, 29, 'Updated profile', 'User updated their profile', '2025-04-05 09:55:00'),
(60, 30, 'Placed an order', 'User placed a market order for AAPL', '2025-04-05 10:00:00'),
(61, 31, 'Sold assets', 'User sold 7 shares of Google', '2025-04-05 10:05:00'),
(62, 32, 'Bought crypto', 'User bought 30 ADA/USD', '2025-04-05 10:10:00'),
(63, 33, 'Logged in', 'User logged in', '2025-04-05 10:15:00'),
(64, 34, 'Deposited funds', 'User deposited funds', '2025-04-05 10:20:00'),
(65, 35, 'Updated profile', 'User updated their profile', '2025-04-05 10:25:00'),
(66, 36, 'Placed an order', 'User placed an order', '2025-04-05 10:30:00'),
(67, 37, 'Logged out', 'User logged out', '2025-04-05 10:35:00'),
(68, 38, 'Logged in', 'User logged in', '2025-04-05 10:40:00'),
(69, 39, 'Bought stock', 'User bought 15 shares of Netflix', '2025-04-05 10:45:00'),
(70, 40, 'Deposited funds', 'User deposited funds', '2025-04-05 10:50:00'),
(71, 41, 'Updated profile', 'User updated their profile', '2025-04-05 10:55:00'),
(72, 42, 'Logged in', 'User logged in', '2025-04-05 11:00:00'),
(73, 43, 'Sold forex', 'User sold 200 USD/EUR', '2025-04-05 11:05:00'),
(74, 1, 'Bought stocks', 'User bought 20 shares of Meta', '2025-04-05 11:10:00'),
(75, 2, 'Logged out', 'User logged out', '2025-04-05 11:15:00'),
(76, 3, 'Logged in', 'User logged in', '2025-04-05 11:20:00'),
(77, 4, 'Deposited funds', 'User deposited 3000.00 USD', '2025-04-05 11:25:00'),
(78, 5, 'Placed an order', 'User placed a limit order for Tesla', '2025-04-05 11:30:00'),
(79, 6, 'Updated profile', 'User updated their profile', '2025-04-05 11:35:00'),
(80, 7, 'Logged in', 'User logged in', '2025-04-05 11:40:00'),
(81, 8, 'Sold stock', 'User sold 5 shares of Nvidia', '2025-04-05 11:45:00'),
(82, 9, 'Bought crypto', 'User bought 1000 DOGE/USD', '2025-04-05 11:50:00'),
(83, 10, 'Placed an order', 'User placed an order', '2025-04-05 11:55:00'),
(84, 15, 'Logged out', 'User logged out', '2025-04-05 12:00:00'),
(85, 16, 'Logged in', 'User logged in', '2025-04-05 12:05:00');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `assets`
--

CREATE TABLE `assets` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` enum('stock','forex','crypto') NOT NULL,
  `symbol` varchar(50) NOT NULL,
  `price` decimal(15,8) NOT NULL,
  `exchange` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `assets`
--

INSERT INTO `assets` (`id`, `name`, `type`, `symbol`, `price`, `exchange`) VALUES
(1, 'Bitcoin / U.S. Dollar', 'crypto', 'BTCUSD', 98306.00000000, ''),
(2, 'Ethereum / U.S. Dollar', 'crypto', 'ETHUSD', 2693.66000000, ''),
(3, 'Apple Inc', 'stock', 'AAPL', 228.01000000, 'NASDAQ'),
(4, 'Google', 'stock', 'GOOG', 2800.00000000, 'NASDAQ'),
(5, 'EUR/USD', 'forex', 'EUR/USD', 1.05000000, ''),
(6, 'NASDAQ Composite Index', 'stock', 'NASDAQ', 15000.00000000, 'NASDAQ'),
(7, 'Tesla Inc', 'stock', 'TSLA', 800.00000000, 'NASDAQ'),
(8, 'Amazon.com Inc', 'stock', 'AMZN', 3200.00000000, 'NASDAQ'),
(9, 'Microsoft Corp', 'stock', 'MSFT', 340.00000000, 'NASDAQ'),
(10, 'GBP/USD', 'forex', 'GBP/USD', 1.30000000, ''),
(11, 'Litecoin / U.S. Dollar', 'crypto', 'LTCUSD', 150.00000000, ''),
(12, 'Ripple / U.S. Dollar', 'crypto', 'XRPUSD', 0.75000000, ''),
(13, 'Cardano / U.S. Dollar', 'crypto', 'ADAUSD', 0.50000000, ''),
(14, 'S&P 500 Index', 'stock', 'SPX', 4500.00000000, 'NYSE'),
(15, 'Dow Jones Industrial Average', 'stock', 'DJIA', 35000.00000000, 'NYSE'),
(16, 'Netflix Inc', 'stock', 'NFLX', 450.00000000, 'NASDAQ'),
(17, 'JPMorgan Chase & Co', 'stock', 'JPM', 180.00000000, 'NYSE'),
(18, 'USD/JPY', 'forex', 'USD/JPY', 150.00000000, ''),
(19, 'Solana / U.S. Dollar', 'crypto', 'SOLUSD', 120.00000000, ''),
(20, 'Meta Platforms Inc', 'stock', 'META', 350.00000000, 'NASDAQ'),
(21, 'AUD/USD', 'forex', 'AUD/USD', 0.75000000, ''),
(22, 'Nvidia Corp', 'stock', 'NVDA', 1000.00000000, 'NASDAQ'),
(23, 'Dogecoin / U.S. Dollar', 'crypto', 'DOGEUSD', 0.20000000, ''),
(24, 'Chevron Corp', 'stock', 'CVX', 180.00000000, 'NYSE'),
(25, 'EUR/JPY', 'forex', 'EUR/JPY', 160.00000000, ''),
(26, 'Coinbase Global Inc', 'stock', 'COIN', 250.00000000, 'NASDAQ'),
(27, 'Swiss Franc / U.S. Dollar', 'forex', 'CHF/USD', 1.10000000, ''),
(28, 'Polygon / U.S. Dollar', 'crypto', 'MATICUSD', 1.20000000, ''),
(29, 'Walt Disney Co', 'stock', 'DIS', 120.00000000, 'NYSE'),
(30, 'Canadian Dollar / U.S. Dollar', 'forex', 'CAD/USD', 0.80000000, ''),
(31, 'Palantir Technologies', 'stock', 'PLTR', 20.00000000, 'NYSE'),
(32, 'Dropbox Inc', 'stock', 'DBX', 30.00000000, 'NASDAQ'),
(33, 'Zynga Inc', 'stock', 'ZNGA', 10.00000000, 'NASDAQ'),
(34, 'Okta Inc', 'stock', 'OKTA', 200.00000000, 'NYSE'),
(35, 'Square Inc', 'stock', 'SQ', 250.00000000, 'NYSE'),
(36, 'Sony Corporation', 'stock', 'SONY', 100.00000000, 'NYSE'),
(37, 'Slack Technologies', 'stock', 'WORK', 40.00000000, 'NYSE'),
(38, 'Shopify Inc', 'stock', 'SHOP', 1200.00000000, 'NYSE'),
(39, 'Uber Technologies', 'stock', 'UBER', 60.00000000, 'NYSE'),
(40, 'Visa Inc', 'stock', 'V', 220.00000000, 'NYSE'),
(41, 'Walmart Inc', 'stock', 'WMT', 140.00000000, 'NYSE'),
(42, 'Zoom Video', 'stock', 'ZM', 400.00000000, 'NASDAQ'),
(43, 'Pfizer Inc', 'stock', 'PFE', 50.00000000, 'NYSE'),
(44, 'Starbucks Corp', 'stock', 'SBUX', 110.00000000, 'NASDAQ'),
(45, 'Twitter Inc', 'stock', 'TWTR', 60.00000000, 'NYSE');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `credit_cards`
--

CREATE TABLE `credit_cards` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `card_number` varchar(16) NOT NULL,
  `card_holder` varchar(100) NOT NULL,
  `expiry_date` varchar(5) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `credit_cards`
--

INSERT INTO `credit_cards` (`id`, `user_id`, `card_number`, `card_holder`, `expiry_date`, `created_at`) VALUES
(1, 1, '4111111111111111', 'Zsirke József', '12/26', '2025-03-05 12:19:57'),
(2, 2, '5500000000000004', 'Horváth Kristóf', '05/25', '2025-03-05 12:19:57'),
(3, 3, '3400000000000009', 'Teszt User', '09/27', '2025-03-05 12:19:57'),
(4, 4, '6011000000000004', 'Teszt2 User', '03/26', '2025-03-05 12:19:57'),
(5, 5, '4111222233334444', 'Balázs Kovács', '08/27', '2025-03-05 15:22:30'),
(6, 6, '5105105105105100', 'Ferenc Szabó', '11/26', '2025-03-05 15:25:14'),
(7, 15, '6011111111111117', 'Dobroslav Vorak', '07/28', '2025-03-05 15:33:20'),
(8, 16, '30000000000004', 'Martina Németh', '01/29', '2025-03-05 15:42:00'),
(9, 17, '3088000000000009', 'Ferenc Balázs', '06/26', '2025-03-05 15:53:00'),
(10, 18, '3530111333300000', 'Julianna Kovács', '02/28', '2025-03-05 16:07:00'),
(11, 19, '3566002020360505', 'László Zoltán', '05/27', '2025-03-05 16:18:00'),
(12, 20, '6331101999990016', 'Béla Zsolt', '10/28', '2025-03-05 16:32:00'),
(13, 21, '6759649826438453', 'Anna Mária', '11/29', '2025-03-05 16:48:00'),
(14, 22, '6762765826438453', 'Kristóf Németh', '04/30', '2025-03-05 17:05:00'),
(15, 23, '5412758111111234', 'Zoltán Mihály', '03/28', '2025-03-05 17:20:00'),
(16, 24, '4916100000000000', 'Erik Balázs', '09/28', '2025-03-05 17:35:00');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `earnings_calendar`
--

CREATE TABLE `earnings_calendar` (
  `id` int(11) NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `symbol` varchar(50) NOT NULL,
  `earnings_date` date NOT NULL,
  `earnings_time` enum('before_open','after_close','during_market') NOT NULL,
  `forecast_eps` decimal(10,2) DEFAULT NULL,
  `actual_eps` decimal(10,2) DEFAULT NULL,
  `revenue` decimal(15,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `asset_id` int(11) NOT NULL,
  `order_type` enum('market','limit') NOT NULL,
  `trade_type` enum('buy','sell') NOT NULL,
  `quantity` decimal(15,8) NOT NULL,
  `price` decimal(15,8) DEFAULT NULL,
  `status` enum('open','closed','canceled') DEFAULT 'open',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `asset_id`, `order_type`, `trade_type`, `quantity`, `price`, `status`, `created_at`) VALUES
(1, 1, 3, 'limit', 'buy', 100.00000000, 150.00000000, 'open', '2024-11-22 08:14:38'),
(2, 1, 1, 'market', 'buy', 0.50000000, NULL, 'open', '2025-03-05 12:19:57'),
(3, 2, 3, 'limit', 'sell', 50.00000000, 230.00000000, 'open', '2025-03-05 12:19:57'),
(4, 3, 2, 'market', 'buy', 2.00000000, NULL, 'open', '2025-03-05 12:19:57'),
(5, 4, 5, 'limit', 'sell', 10000.00000000, 1.06000000, 'open', '2025-03-05 12:19:57'),
(6, 1, 6, 'market', 'buy', 5.00000000, NULL, 'open', '2025-03-05 12:19:57'),
(7, 2, 4, 'limit', 'buy', 10.00000000, 2750.00000000, 'open', '2025-03-05 12:19:57'),
(8, 15, 2, 'market', 'buy', 1.50000000, NULL, 'open', '2025-03-05 15:36:30'),
(9, 16, 9, 'limit', 'sell', 20.00000000, 360.00000000, 'open', '2025-03-05 15:50:00'),
(10, 17, 5, 'market', 'buy', 2.00000000, NULL, 'open', '2025-03-05 16:10:00'),
(11, 18, 7, 'market', 'buy', 5.00000000, NULL, 'open', '2025-03-05 16:20:00'),
(12, 19, 12, 'limit', 'sell', 15.00000000, 0.85000000, 'open', '2025-03-05 16:30:00'),
(13, 20, 10, 'market', 'buy', 3.00000000, NULL, 'open', '2025-03-05 16:40:00'),
(14, 21, 19, 'market', 'buy', 2.50000000, NULL, 'open', '2025-03-05 16:55:00'),
(15, 22, 14, 'limit', 'sell', 4.00000000, 4700.00000000, 'open', '2025-03-05 17:15:00'),
(16, 23, 11, 'limit', 'sell', 10.00000000, 160.00000000, 'open', '2025-03-05 17:25:00'),
(17, 24, 6, 'market', 'buy', 1.20000000, NULL, 'open', '2025-03-05 17:35:00'),
(18, 3, 8, 'market', 'buy', 1.00000000, NULL, 'open', '2025-04-04 09:22:00'),
(19, 4, 5, 'limit', 'sell', 5.00000000, 1.07500000, 'open', '2025-04-04 09:23:00'),
(20, 5, 6, 'market', 'buy', 12.00000000, NULL, 'open', '2025-04-04 09:24:00'),
(21, 6, 7, 'limit', 'sell', 7.00000000, 900.00000000, 'open', '2025-04-04 09:25:00'),
(22, 7, 2, 'market', 'buy', 3.00000000, NULL, 'open', '2025-04-04 09:26:00'),
(23, 8, 9, 'limit', 'sell', 9.00000000, 355.00000000, 'open', '2025-04-04 09:27:00'),
(24, 9, 10, 'market', 'buy', 2.00000000, NULL, 'open', '2025-04-04 09:28:00'),
(25, 10, 11, 'limit', 'buy', 10.00000000, 145.00000000, 'open', '2025-04-04 09:29:00'),
(26, 11, 14, 'market', 'buy', 1.00000000, NULL, 'open', '2025-04-04 12:30:00'),
(27, 12, 15, 'limit', 'sell', 4.00000000, 36000.00000000, 'open', '2025-04-04 12:31:00'),
(28, 13, 16, 'market', 'buy', 7.00000000, NULL, 'open', '2025-04-04 12:33:00'),
(29, 14, 17, 'limit', 'sell', 15.00000000, 500.00000000, 'open', '2025-04-04 12:34:00'),
(30, 15, 18, 'market', 'buy', 6.00000000, NULL, 'open', '2025-04-04 12:35:00'),
(31, 16, 19, 'market', 'sell', 11.00000000, 135.00000000, 'open', '2025-04-04 12:37:00'),
(32, 17, 20, 'limit', 'buy', 9.00000000, 325.00000000, 'open', '2025-04-04 12:38:00');
-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `trades`
--

CREATE TABLE `trades` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `asset_id` int(11) NOT NULL,
  `trade_type` enum('buy','sell') NOT NULL,
  `quantity` decimal(15,8) NOT NULL,
  `price` decimal(15,8) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `trades`
--

INSERT INTO `trades` (`id`, `user_id`, `asset_id`, `trade_type`, `quantity`, `price`, `created_at`) VALUES
(1, 1, 1, 'sell', 1.00000000, 35000.00000000, '2024-11-22 08:14:38'),
(2, 1, 3, 'sell', 6.09000000, 392.01000000, '2025-03-05 12:05:12'),
(3, 2, 1, 'sell', 1.25000000, 2664.86000000, '2025-03-05 12:05:12'),
(4, 3, 1, 'sell', 3.59000000, 4610.00000000, '2025-03-05 12:05:12'),
(5, 4, 4, 'sell', 4.04000000, 3679.12000000, '2025-03-05 12:05:12'),
(6, 5, 8, 'buy', 3.11000000, 3708.90000000, '2025-03-05 12:05:12'),
(7, 6, 8, 'buy', 2.96000000, 4182.28000000, '2025-03-05 12:05:12'),
(8, 7, 11, 'buy', 8.29000000, 2599.94000000, '2025-03-05 12:05:12'),
(9, 8, 5, 'sell', 2.29000000, 4190.45000000, '2025-03-05 12:05:12'),
(10, 9, 11, 'buy', 8.00000000, 2761.97000000, '2025-03-05 12:05:12'),
(11, 10, 1, 'sell', 1.14000000, 2526.34000000, '2025-03-05 12:05:12'),
(12, 15, 11, 'buy', 5.00000000, 140.00000000, '2025-03-05 15:32:12'),
(13, 16, 8, 'sell', 1.50000000, 3300.00000000, '2025-03-05 15:55:00'),
(14, 17, 12, 'buy', 10.00000000, 0.80000000, '2025-03-05 16:15:00'),
(15, 18, 2, 'sell', 8.00000000, 2700.00000000, '2025-03-05 16:25:30'),
(16, 19, 3, 'buy', 20.00000000, 230.50000000, '2025-03-05 16:35:00'),
(17, 20, 20, 'buy', 1.00000000, 350.00000000, '2025-03-05 16:45:12'),
(18, 21, 18, 'sell', 10.00000000, 155.00000000, '2025-03-05 16:56:10'),
(19, 22, 13, 'buy', 60.00000000, 0.60000000, '2025-03-05 17:20:00'),
(20, 23, 14, 'buy', 3.50000000, 4500.00000000, '2025-03-05 17:28:00'),
(21, 24, 16, 'sell', 2.00000000, 480.00000000, '2025-03-05 17:40:00'),
(22, 2, 3, 'buy', 25.00000000, 230.00000000, '2025-04-04 12:39:00'),
(23, 3, 4, 'sell', 11.00000000, 2800.00000000, '2025-04-04 12:40:00'),
(24, 4, 5, 'buy', 1000.00000000, 1.08000000, '2025-04-04 12:42:00'),
(25, 5, 6, 'sell', 50.00000000, 850.00000000, '2025-04-04 12:43:00'),
(26, 6, 7, 'buy', 9.00000000, 780.00000000, '2025-04-04 12:44:00'),
(27, 7, 8, 'sell', 3.00000000, 3400.00000000, '2025-04-04 12:45:00'),
(28, 8, 9, 'buy', 5.00000000, 320.00000000, '2025-04-04 12:46:00'),
(29, 9, 10, 'sell', 7.00000000, 1.30000000, '2025-04-04 12:47:00'),
(30, 10, 11, 'buy', 12.00000000, 145.00000000, '2025-04-04 12:49:00'),
(31, 11, 12, 'sell', 20.00000000, 0.77000000, '2025-04-04 12:50:00'),
(32, 12, 13, 'buy', 30.00000000, 0.51000000, '2025-04-04 12:51:00'),
(33, 13, 14, 'sell', 5.50000000, 4600.00000000, '2025-04-04 12:52:00'),
(34, 14, 15, 'buy', 40.00000000, 35000.00000000, '2025-04-04 12:54:00'),
(35, 15, 16, 'sell', 50.00000000, 490.00000000, '2025-04-04 12:55:00'),
(36, 16, 17, 'buy', 80.00000000, 190.00000000, '2025-04-04 12:56:00');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` enum('deposit','withdrawal') NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `method` varchar(50) DEFAULT NULL, -- Added payment method column
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `transactions`
--

INSERT INTO `transactions` (`id`, `user_id`, `type`, `amount`, `created_at`) VALUES
(1, 1, 'deposit', 5000.00, '2024-11-22 08:14:38'),
(2, 1, 'withdrawal', 2580.13, '2025-03-05 12:05:12'),
(3, 2, 'withdrawal', 4014.43, '2025-03-05 12:05:12'),
(4, 3, 'withdrawal', 3143.47, '2025-03-05 12:05:12'),
(5, 4, 'deposit', 6965.21, '2025-03-05 12:05:12'),
(6, 5, 'deposit', 7194.70, '2025-03-05 12:05:12'),
(7, 6, 'withdrawal', 6878.48, '2025-03-05 12:05:12'),
(8, 7, 'withdrawal', 1221.25, '2025-03-05 12:05:12'),
(9, 8, 'withdrawal', 620.16, '2025-03-05 12:05:12'),
(10, 9, 'withdrawal', 465.51, '2025-03-05 12:05:12'),
(11, 10, 'withdrawal', 4643.09, '2025-03-05 12:05:12'),
(12, 15, 'deposit', 8000.00, '2025-03-05 15:30:00'),
(13, 16, 'withdrawal', 3500.00, '2025-03-05 15:45:00'),
(14, 17, 'deposit', 5600.00, '2025-03-05 16:00:00'),
(15, 18, 'deposit', 4000.00, '2025-03-05 16:10:00'),
(16, 19, 'withdrawal', 2500.00, '2025-03-05 16:25:00'),
(17, 20, 'deposit', 10000.00, '2025-03-05 16:35:00'),
(18, 21, 'withdrawal', 1200.00, '2025-03-05 16:50:00'),
(19, 22, 'deposit', 4500.00, '2025-03-05 17:10:00'),
(20, 23, 'deposit', 9000.00, '2025-03-05 17:20:00'),
(21, 24, 'withdrawal', 2000.00, '2025-03-05 17:30:00'),
(22, 1, 'withdrawal', 3000.00, '2025-04-04 09:00:00'),
(23, 3, 'deposit', 4000.00, '2025-04-04 09:02:00'),
(24, 5, 'withdrawal', 2500.00, '2025-04-04 09:03:00'),
(25, 7, 'deposit', 6000.00, '2025-04-04 09:04:00'),
(26, 9, 'withdrawal', 800.00, '2025-04-04 09:05:00'),
(27, 11, 'deposit', 1500.00, '2025-04-04 09:06:00'),
(28, 13, 'withdrawal', 1200.00, '2025-04-04 09:07:00'),
(29, 15, 'deposit', 1800.00, '2025-04-04 09:08:00'),
(30, 17, 'withdrawal', 950.00, '2025-04-04 09:09:00'),
(31, 19, 'deposit', 2200.00, '2025-04-04 09:10:00'),
(32, 21, 'withdrawal', 1300.00, '2025-04-04 09:11:00'),
(33, 23, 'deposit', 2000.00, '2025-04-04 09:12:00'),
(34, 2, 'withdrawal', 1500.00, '2025-04-04 12:00:00'),
(35, 4, 'deposit', 2500.00, '2025-04-04 12:02:00'),
(36, 6, 'withdrawal', 1000.00, '2025-04-04 12:03:00');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `display_name` varchar(100) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `type` char(1) DEFAULT 'U',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `balance` decimal(15,2) DEFAULT 0.00,
  `avatar` varchar(200) DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `address` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Add these columns to your existing users table
ALTER TABLE users 
ADD COLUMN verification_status ENUM('verification_needed', 'verified') DEFAULT 'verification_needed',
ADD COLUMN verification_token VARCHAR(255),
ADD COLUMN token_expiry TIMESTAMP;


--
-- A tábla adatainak kiíratása `users`
--

INSERT INTO `users` (`id`, `username`, `display_name`, `email`, `password`, `type`, `created_at`, `balance`, `avatar`, `full_name`, `address`) VALUES
(1, 'may', 'may', 'szell.adam-2020@keri.mako.hu', '1234Aa', 'A', '2024-11-22 08:14:38', 0.00, NULL, 'Adam Szell', 'Kossuth Lajos utca 1., Budapest, Hungary'),
(2, 'zsirke', 'zsirke', 'aranyosi.daniel-2020@keri.mako.hu', '1234Aa', 'A', '2025-02-04 08:34:40', 0.00, NULL, 'Daniel Aranyosi', 'Széchenyi István tér 2., Szeged, Hungary'),
(3, 'teszt', 'teszt', 'teszt@gmail.com', '1234Aa', 'U', '2025-02-11 10:36:56', 0.00, NULL, 'Teszt User', 'Petőfi Sándor utca 3., Miskolc, Hungary'),
(4, 'teszt2', 'teszt2', 'teszt2@gmail.com', '1234Aa', 'U', '2025-02-11 11:01:09', 0.00, NULL, 'Teszt2 User', 'Rákóczi Ferenc utca 4., Pécs, Hungary'),
(5, 'bkovacs', 'Balázs Kovács', 'bkovacs@example.com', 'hashedpassword1', 'U', '2025-03-05 10:28:43', 41806.49, NULL, 'Balázs Kovács', 'Andrássy út 5., Debrecen, Hungary'),
(6, 'fszabo', 'Ferenc Szabó', 'fszabo@example.com', 'hashedpassword2', 'U', '2025-03-05 10:28:43', 5741.20, NULL, 'Ferenc Szabó', 'József Attila utca 6., Győr, Hungary'),
(7, 'ktoth', 'Krisztina Tóth', 'ktoth@example.com', 'hashedpassword3', 'U', '2025-03-05 10:28:43', 23277.93, NULL, 'Krisztina Tóth', 'Bartók Béla út 7., Nyíregyháza, Hungary'),
(8, 'nhorvath', 'Nikolett Horváth', 'nhorvath@example.com', 'hashedpassword4', 'U', '2025-03-05 10:28:43', 41136.15, NULL, 'Nikolett Horváth', 'Ady Endre út 8., Kecskemét, Hungary'),
(9, 'pgabor', 'Péter Gábor', 'pgabor@example.com', 'hashedpassword5', 'U', '2025-03-05 10:28:43', 32696.60, NULL, 'Péter Gábor', 'Deák Ferenc utca 9., Székesfehérvár, Hungary'),
(10, 'vegerszegi', 'Viktor Egerszegi', 'vegerszegi@example.com', 'hashedpassword6', 'U', '2025-03-05 10:28:43', 7685.60, NULL, 'Viktor Egerszegi', 'Szabolcs vezér utca 10., Zalaegerszeg, Hungary'),
(11, 'kdobos', 'Károly Dobos', 'kdobos@example.com', 'hashedpassword7', 'U', '2025-03-05 10:28:43', 23012.11, NULL, 'Károly Dobos', 'Kodály Zoltán utca 11., Eger, Hungary'),
(12, 'zsuzsanagy', 'Zsuzsanna Nagy', 'zsuzsanagy@example.com', 'hashedpassword8', 'U', '2025-03-05 10:28:43', 20859.48, NULL, 'Zsuzsanna Nagy', 'Bajcsy-Zsilinszky út 12., Szombathely, Hungary'),
(13, 'mlaszlo', 'Miklós László', 'mlaszlo@example.com', 'hashedpassword9', 'U', '2025-03-05 10:28:43', 45304.14, NULL, 'Miklós László', 'Dózsa György út 13., Sopron, Hungary'),
(14, 'erikailles', 'Erika Illés', 'erikailles@example.com', 'hashedpassword10', 'U', '2025-03-05 10:28:43', 20919.45, NULL, 'Erika Illés', 'Kossuth tér 14., Szolnok, Hungary'),
(15, 'dvorak', 'Dobroslav Vorak', 'dvorak@example.com', 'hashedpassword11', 'U', '2025-03-05 15:20:20', 15000.00, NULL, 'Dobroslav Vorak', 'Bartók Béla út 15., Kaposvár, Hungary'),
(16, 'mnemeth', 'Martina Németh', 'mnemeth@example.com', 'hashedpassword12', 'U', '2025-03-05 15:30:35', 23000.00, NULL, 'Martina Németh', 'Szent István király út 16., Szekszárd, Hungary'),
(17, 'fbalazs', 'Ferenc Balázs', 'fbalazs@example.com', 'hashedpassword13', 'U', '2025-03-05 15:45:50', 17500.00, NULL, 'Ferenc Balázs', 'Béke tér 17., Hódmezővásárhely, Hungary'),
(18, 'jkovacs', 'Julianna Kovács', 'jkovacs@example.com', 'hashedpassword14', 'U', '2025-03-05 16:00:00', 18435.00, NULL, 'Julianna Kovács', 'Villányi út 18., Baja, Hungary'),
(19, 'laszloz', 'László Zoltán', 'laszloz@example.com', 'hashedpassword15', 'U', '2025-03-05 16:15:15', 11200.00, NULL, 'László Zoltán', 'Táncsics Mihály utca 19., Salgótarján, Hungary'),
(20, 'bela', 'Béla Zsolt', 'bela@example.com', 'hashedpassword16', 'U', '2025-03-05 16:30:00', 50000.00, NULL, 'Béla Zsolt', 'Bocskai utca 20., Veszprém, Hungary'),
(21, 'annam', 'Anna Mária', 'annam@example.com', 'hashedpassword17', 'U', '2025-03-05 16:45:00', 6200.00, NULL, 'Anna Mária', 'Király utca 21., Szigetvár, Hungary'),
(22, 'kriszt', 'Kristóf Németh', 'kriszt@example.com', 'hashedpassword18', 'U', '2025-03-05 17:00:00', 18450.00, NULL, 'Kristóf Németh', 'Rákóczi út 22., Cegléd, Hungary'),
(23, 'zoltanm', 'Zoltán Mihály', 'zoltanm@example.com', 'hashedpassword19', 'U', '2025-03-05 17:15:15', 10500.00, NULL, 'Zoltán Mihály', 'Köztársaság tér 23., Békéscsaba, Hungary'),
(24, 'erikb', 'Erik Balázs', 'erikb@example.com', 'hashedpassword20', 'U', '2025-03-05 17:30:00', 12000.00, NULL, 'Erik Balázs', 'Október huszonharmadika utca 24., Tatabánya, Hungary'),
(25, 'johndoe', 'John Doe', 'johndoe@example.com', 'hashedpassword21', 'U', '2025-04-04 09:00:00', 1000.00, NULL, 'John Doe', 'Németvölgyi út 25., Szentes, Hungary'),
(26, 'janesmith', 'Jane Smith', 'janesmith@example.com', 'hashedpassword22', 'U', '2025-04-04 09:02:00', 2000.00, NULL, 'Jane Smith', 'Bajza József utca 26., Balassagyarmat, Hungary'),
(27, 'bobbuilder', 'Bob Builder', 'bobbuilder@example.com', 'hashedpassword23', 'U', '2025-04-04 09:03:00', 3000.00, NULL, 'Bob Builder', 'Ferencesek tere 27., Sátoraljaújhely, Hungary'),
(28, 'alicespring', 'Alice Spring', 'alicespring@example.com', 'hashedpassword24', 'U', '2025-04-04 09:04:00', 4000.00, NULL, 'Alice Spring', 'Mátyás király utca 28., Pápa, Hungary'),
(29, 'charlesbabbage', 'Charles Babbage', 'charlesbabbage@example.com', 'hashedpassword25', 'U', '2025-04-04 09:05:00', 5000.00, NULL, 'Charles Babbage', 'Kossuth utca 29., Gödöllő, Hungary'),
(30, 'ada', 'Ada Lovelace', 'ada@example.com', 'hashedpassword26', 'U', '2025-04-04 09:06:00', 6000.00, NULL, 'Ada Lovelace', 'Erzsébet körút 30., Szarvas, Hungary'),
(31, 'tim', 'Tim Berners-Lee', 'tim@example.com', 'hashedpassword27', 'U', '2025-04-04 09:07:00', 7000.00, NULL, 'Tim Berners-Lee', 'Kazinczy utca 31., Komló, Hungary'),
(32, 'linus', 'Linus Torvalds', 'linus@example.com', 'hashedpassword28', 'U', '2025-04-04 09:08:00', 8000.00, NULL, 'Linus Torvalds', 'Damjanich utca 32., Budaörs, Hungary'),
(33, 'billg', 'Bill Gates', 'billg@example.com', 'hashedpassword29', 'U', '2025-04-04 09:09:00', 9000.00, NULL, 'Bill Gates', 'Hunyadi út 33., Körmend, Hungary'),
(34, 'steve', 'Steve Jobs', 'steve@example.com', 'hashedpassword30', 'U', '2025-04-04 09:10:00', 10000.00, NULL, 'Steve Jobs', 'Polgármesteri tér 34., Jászberény, Hungary'),
(35, 'larry', 'Larry Page', 'larry@example.com', 'hashedpassword31', 'U', '2025-04-04 09:11:00', 11000.00, NULL, 'Larry Page', 'Széchenyi tér 35., Villány, Hungary'),
(36, 'sergey', 'Sergey Brin', 'sergey@example.com', 'hashedpassword32', 'U', '2025-04-04 09:12:00', 12000.00, NULL, 'Sergey Brin', 'Mártírok út 36., Sárospatak, Hungary'),
(37, 'mark', 'Mark Zuckerberg', 'mark@example.com', 'hashedpassword33', 'U', '2025-04-04 09:13:00', 13000.00, NULL, 'Mark Zuckerberg', 'Hollósy utca 37., Dunaharaszti, Hungary'),
(38, 'jeff', 'Jeff Bezos', 'jeff@example.com', 'hashedpassword34', 'U', '2025-04-04 09:14:00', 14000.00, NULL, 'Jeff Bezos', 'Kinizsi út 38., Siófok, Hungary'),
(39, 'elon', 'Elon Musk', 'elon@example.com', 'hashedpassword35', 'U', '2025-04-04 09:15:00', 15000.00, NULL, 'Elon Musk', 'Béke utca 39., Balatonfüred, Hungary'),
(40, 'jack', 'Jack Ma', 'jack@example.com', 'hashedpassword36', 'U', '2025-04-04 09:16:00', 16000.00, NULL, 'Jack Ma', 'Szent Imre tér 40., Dunaújváros, Hungary'),
(41, 'warren', 'Warren Buffet', 'warren@example.com', 'hashedpassword37', 'U', '2025-04-04 09:17:00', 17000.00, NULL, 'Warren Buffet', 'Szent István út 41., Békés, Hungary'),
(42, 'richard', 'Richard Branson', 'richard@example.com', 'hashedpassword38', 'U', '2025-04-04 09:18:00', 18000.00, NULL, 'Richard Branson', 'Magyar utca 42., Szekszárd, Hungary'),
(43, 'satya', 'Satya Nadella', 'satya@example.com', 'hashedpassword39', 'U', '2025-04-04 09:19:00', 19000.00, NULL, 'Satya Nadella', 'Tisza Lajos körút 43., Szeged, Hungary');
-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `user_assets`
--

CREATE TABLE `user_assets` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `asset_id` int(11) NOT NULL,
  `quantity` decimal(15,8) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `user_assets`
--
INSERT INTO `user_assets` (`id`, `user_id`, `asset_id`, `quantity`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 2.00000000, '2024-11-22 08:14:38', '2024-11-22 08:14:38'),
(2, 1, 3, 44.13000000, '2025-03-05 12:05:11', '2025-03-05 12:05:11'),
(3, 2, 1, 4.49000000, '2025-03-05 12:05:11', '2025-03-05 12:05:11'),
(4, 3, 7, 38.46000000, '2025-03-05 12:05:11', '2025-03-05 12:05:11'),
(5, 4, 9, 48.33000000, '2025-03-05 12:05:11', '2025-03-05 12:05:11'),
(6, 5, 3, 36.72000000, '2025-03-05 12:05:11', '2025-03-05 12:05:11'),
(7, 6, 8, 8.35000000, '2025-03-05 12:05:11', '2025-03-05 12:05:11'),
(8, 7, 6, 18.19000000, '2025-03-05 12:05:11', '2025-03-05 12:05:11'),
(9, 8, 10, 30.72000000, '2025-03-05 12:05:11', '2025-03-05 12:05:11'),
(10, 9, 2, 2.29000000, '2025-03-05 12:05:11', '2025-03-05 12:05:11'),
(11, 10, 9, 27.35000000, '2025-03-05 12:05:11', '2025-03-05 12:05:11'),
(12, 15, 1, 5.00000000, '2025-04-04 09:00:00', '2025-04-04 09:00:00'),
(13, 16, 2, 3.00000000, '2025-04-04 09:02:00', '2025-04-04 09:02:00'),
(14, 17, 3, 2.50000000, '2025-04-04 09:03:00', '2025-04-04 09:03:00'),
(15, 18, 4, 1.80000000, '2025-04-04 09:04:00', '2025-04-04 09:04:00'),
(16, 19, 5, 10.00000000, '2025-04-04 09:05:00', '2025-04-04 09:05:00'),
(17, 20, 6, 7.20000000, '2025-04-04 09:06:00', '2025-04-04 09:06:00'),
(18, 21, 7, 6.50000000, '2025-04-04 09:07:00', '2025-04-04 09:07:00'),
(19, 22, 8, 4.80000000, '2025-04-04 09:08:00', '2025-04-04 09:08:00'),
(20, 23, 9, 5.50000000, '2025-04-04 09:09:00', '2025-04-04 09:09:00'),
(21, 24, 10, 9.00000000, '2025-04-04 09:10:00', '2025-04-04 09:10:00'),
(22, 2, 5, 20.00000000, '2025-04-05 10:00:00', '2025-04-05 10:00:00'),
(23, 3, 13, 15.00000000, '2025-04-05 10:05:00', '2025-04-05 10:05:00'),
(24, 4, 29, 25.00000000, '2025-04-05 10:10:00', '2025-04-05 10:10:00'),
(25, 5, 18, 45.00000000, '2025-04-05 10:15:00', '2025-04-05 10:15:00'),
(26, 6, 19, 13.00000000, '2025-04-05 10:20:00', '2025-04-05 10:20:00'),
(27, 7, 21, 34.00000000, '2025-04-05 10:25:00', '2025-04-05 10:25:00'),
(28, 8, 30, 9.00000000, '2025-04-05 10:30:00', '2025-04-05 10:30:00'),
(29, 9, 11, 8.00000000, '2025-04-05 10:35:00', '2025-04-05 10:35:00'),
(30, 10, 12, 17.00000000, '2025-04-05 10:40:00', '2025-04-05 10:40:00'),
(31, 15, 35, 7.00000000, '2025-04-05 10:45:00', '2025-04-05 10:45:00'),
(32, 16, 34, 50.00000000, '2025-04-05 10:50:00', '2025-04-05 10:50:00'),
(33, 17, 33, 24.00000000, '2025-04-05 10:55:00', '2025-04-05 10:55:00'),
(34, 18, 32, 11.00000000, '2025-04-05 11:00:00', '2025-04-05 11:00:00'),
(35, 19, 31, 3.00000000, '2025-04-05 11:05:00', '2025-04-05 11:05:00'),
(36, 20, 27, 19.00000000, '2025-04-05 11:10:00', '2025-04-05 11:10:00'),
(37, 21, 25, 14.00000000, '2025-04-05 11:15:00', '2025-04-05 11:15:00'),
(38, 22, 26, 28.00000000, '2025-04-05 11:20:00', '2025-04-05 11:20:00'),
(39, 23, 28, 2.00000000, '2025-04-05 11:25:00', '2025-04-05 11:25:00'),
(40, 24, 24, 16.00000000, '2025-04-05 11:30:00', '2025-04-05 11:30:00'),
(41, 25, 23, 12.00000000, '2025-04-05 11:35:00', '2025-04-05 11:35:00'),
(42, 26, 22, 10.00000000, '2025-04-05 11:40:00', '2025-04-05 11:40:00'),
(43, 27, 20, 27.00000000, '2025-04-05 11:45:00', '2025-04-05 11:45:00'),
(44, 28, 17, 38.00000000, '2025-04-05 11:50:00', '2025-04-05 11:50:00'),
(45, 29, 16, 20.00000000, '2025-04-05 11:55:00', '2025-04-05 11:55:00'),
(46, 30, 15, 6.00000000, '2025-04-05 12:00:00', '2025-04-05 12:00:00');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `watchlist`
--

CREATE TABLE `watchlist` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `asset_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `watchlist`
--

INSERT INTO `watchlist` (`id`, `user_id`, `asset_id`, `created_at`) VALUES
(1, 1, 4, '2025-03-05 12:05:12'),
(2, 2, 6, '2025-03-05 12:05:12'),
(3, 3, 4, '2025-03-05 12:05:12'),
(4, 4, 10, '2025-03-05 12:05:12'),
(5, 5, 1, '2025-03-05 12:05:12'),
(6, 6, 10, '2025-03-05 12:05:12'),
(7, 7, 2, '2025-03-05 12:05:12'),
(8, 8, 5, '2025-03-05 12:05:12'),
(9, 9, 7, '2025-03-05 12:05:12'),
(10, 10, 3, '2025-03-05 12:05:12'),
(11, 11, 3, '2025-04-04 09:00:00'),
(12, 12, 4, '2025-04-04 09:02:00'),
(13, 13, 5, '2025-04-04 09:03:00'),
(14, 14, 6, '2025-04-04 09:04:00'),
(15, 15, 7, '2025-04-04 09:05:00'),
(16, 16, 8, '2025-04-04 09:06:00'),
(17, 17, 9, '2025-04-04 09:07:00'),
(18, 18, 10, '2025-04-04 09:08:00'),
(19, 1, 2, '2025-04-04 09:09:00'),
(20, 3, 5, '2025-04-04 09:10:00'),
(21, 2, 1, '2025-04-04 09:11:00'),
(22, 4, 8, '2025-04-04 09:12:00'),
(23, 5, 7, '2025-04-04 09:13:00'),
(24, 6, 9, '2025-04-04 09:14:00'),
(25, 10, 11, '2025-04-04 09:15:00');

ALTER TABLE `watchlist` 
ADD COLUMN `alert_price` decimal(20,8) DEFAULT NULL,
ADD COLUMN `alert_type` enum('above','below') DEFAULT NULL,
ADD COLUMN `alert_triggered` tinyint(1) DEFAULT 0;

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `activity_log`
--
ALTER TABLE `activity_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);


--
-- A tábla indexei `assets`
--
ALTER TABLE `assets`
  ADD PRIMARY KEY (`id`);

--
-- A tábla indexei `credit_cards`
--
ALTER TABLE `credit_cards`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- A tábla indexei `earnings_calendar`
--
ALTER TABLE `earnings_calendar`
  ADD PRIMARY KEY (`id`);

--
-- A tábla indexei `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `asset_id` (`asset_id`);

--
-- A tábla indexei `trades`
--
ALTER TABLE `trades`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `asset_id` (`asset_id`);

--
-- A tábla indexei `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- A tábla indexei `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- A tábla indexei `user_assets`
--
ALTER TABLE `user_assets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `asset_id` (`asset_id`);

--
-- A tábla indexei `watchlist`
--
ALTER TABLE `watchlist`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `asset_id` (`asset_id`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `activity_log`
--
ALTER TABLE `activity_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT a táblához `assets`
--
ALTER TABLE `assets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT a táblához `credit_cards`
--
ALTER TABLE `credit_cards`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT a táblához `earnings_calendar`
--
ALTER TABLE `earnings_calendar`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT a táblához `trades`
--
ALTER TABLE `trades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT a táblához `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT a táblához `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT a táblához `user_assets`
--
ALTER TABLE `user_assets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT a táblához `watchlist`
--
ALTER TABLE `watchlist`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `activity_log`
--
ALTER TABLE `activity_log`
  ADD CONSTRAINT `activity_log_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Megkötések a táblához `credit_cards`
--
ALTER TABLE `credit_cards`
  ADD CONSTRAINT `credit_cards_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Megkötések a táblához `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`);

--
-- Megkötések a táblához `trades`
--
ALTER TABLE `trades`
  ADD CONSTRAINT `trades_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `trades_ibfk_2` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`);

--
-- Megkötések a táblához `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Megkötések a táblához `user_assets`
--
ALTER TABLE `user_assets`
  ADD CONSTRAINT `user_assets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `user_assets_ibfk_2` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`);

--
-- Megkötések a táblához `watchlist`
--
ALTER TABLE `watchlist`
  ADD CONSTRAINT `watchlist_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `watchlist_ibfk_2` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
