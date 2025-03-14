-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2025. Már 14. 09:43
-- Kiszolgáló verziója: 10.4.28-MariaDB
-- PHP verzió: 8.1.17

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

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
(1, 3, 'Logged in', 'Logged in performed', '2025-03-05 12:05:12'),
(2, 8, 'Deposited funds', 'Deposited funds performed', '2025-03-05 12:05:12'),
(3, 1, 'Updated profile', 'Updated profile performed', '2025-03-05 12:05:12'),
(4, 6, 'Logged in', 'Logged in performed', '2025-03-05 12:05:12'),
(5, 9, 'Updated profile', 'Updated profile performed', '2025-03-05 12:05:12'),
(6, 10, 'Placed an order', 'Placed an order performed', '2025-03-05 12:05:12'),
(7, 1, 'Deposited funds', 'Deposited funds performed', '2025-03-05 12:05:12'),
(8, 2, 'Deposited funds', 'Deposited funds performed', '2025-03-05 12:05:12'),
(9, 6, 'Updated profile', 'Updated profile performed', '2025-03-05 12:05:12'),
(10, 6, 'Placed an order', 'Placed an order performed', '2025-03-05 12:05:12');

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
(30, 'Canadian Dollar / U.S. Dollar', 'forex', 'CAD/USD', 0.80000000, '');

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
(4, 4, '6011000000000004', 'Teszt2 User', '03/26', '2025-03-05 12:19:57');

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
(7, 2, 4, 'limit', 'buy', 10.00000000, 2750.00000000, 'open', '2025-03-05 12:19:57');

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
(11, 10, 1, 'sell', 1.14000000, 2526.34000000, '2025-03-05 12:05:12');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` enum('deposit','withdrawal') NOT NULL,
  `amount` decimal(15,2) NOT NULL,
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
(11, 10, 'withdrawal', 4643.09, '2025-03-05 12:05:12');

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
  `role` char(1) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `balance` decimal(15,2) DEFAULT 0.00,
  `avatar` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `users`
--

INSERT INTO `users` (`id`, `username`, `display_name`, `email`, `password`, `role`, `created_at`, `balance`, `avatar`) VALUES
(1, 'may', 'may', 'szell.adam-2020@keri.mako.hu', '1234Aa', 'A', '2024-11-22 08:14:38', 0.00, NULL),
(2, 'zsirke', 'zsirke', 'aranyosi.daniel-2020@keri.mako.hu', '1234Aa', 'A', '2025-02-04 08:34:40', 0.00, NULL),
(3, 'teszt', 'teszt', 'teszt@gmail.com', '1234Aa', 'U', '2025-02-11 10:36:56', 0.00, NULL),
(4, 'teszt2', 'teszt2', 'teszt2@gmail.com', '1234Aa', 'U', '2025-02-11 11:01:09', 0.00, NULL),
(5, 'bkovacs', 'Balázs Kovács', 'bkovacs@example.com', 'hashedpassword1', 'U', '2025-03-05 10:28:43', 41806.49, NULL),
(6, 'fszabo', 'Ferenc Szabó', 'fszabo@example.com', 'hashedpassword2', 'U', '2025-03-05 10:28:43', 5741.20, NULL),
(7, 'ktoth', 'Krisztina Tóth', 'ktoth@example.com', 'hashedpassword3', 'U', '2025-03-05 10:28:43', 23277.93, NULL),
(8, 'nhorvath', 'Nikolett Horváth', 'nhorvath@example.com', 'hashedpassword4', 'U', '2025-03-05 10:28:43', 41136.15, NULL),
(9, 'pgabor', 'Péter Gábor', 'pgabor@example.com', 'hashedpassword5', 'U', '2025-03-05 10:28:43', 32696.60, NULL),
(10, 'vegerszegi', 'Viktor Egerszegi', 'vegerszegi@example.com', 'hashedpassword6', 'U', '2025-03-05 10:28:43', 7685.60, NULL),
(11, 'kdobos', 'Károly Dobos', 'kdobos@example.com', 'hashedpassword7', 'U', '2025-03-05 10:28:43', 23012.11, NULL),
(12, 'zsuzsanagy', 'Zsuzsanna Nagy', 'zsuzsanagy@example.com', 'hashedpassword8', 'U', '2025-03-05 10:28:43', 20859.48, NULL),
(13, 'mlaszlo', 'Miklós László', 'mlaszlo@example.com', 'hashedpassword9', 'U', '2025-03-05 10:28:43', 45304.14, NULL),
(14, 'erikailles', 'Erika Illés', 'erikailles@example.com', 'hashedpassword10', 'U', '2025-03-05 10:28:43', 20919.45, NULL);

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
(11, 10, 9, 27.35000000, '2025-03-05 12:05:11', '2025-03-05 12:05:11');

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
(10, 10, 3, '2025-03-05 12:05:12');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

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
