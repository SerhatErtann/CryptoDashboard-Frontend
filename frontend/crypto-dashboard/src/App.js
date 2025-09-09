import React, { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CoinChart from "./CoinChart";

import btcLogo from "./assets/icons/btc.png";
import ethLogo from "./assets/icons/etherium.png";
import ltcLogo from "./assets/icons/litecoin.png";
import solLogo from "./assets/icons/solana.jpeg";
import etcLogo from "./assets/icons/etheriumclassicccc.jpeg";
import elrondLogo from "./assets/icons/elrond.png";
import aaveLogo from "./assets/icons/aave.jpeg";

const coinLogos = {
  BTC: btcLogo,
  ETH: ethLogo,
  LITECOIN: ltcLogo,
  SOLANA: solLogo,
  ETC: etcLogo,
  ELROND: elrondLogo,
  AAVE: aaveLogo,
};

function App() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [rangeDays, setRangeDays] = useState("30"); 
  const [stats, setStats] = useState(null);

  const coins = ["BTC", "ETH", "LITECOIN", "SOLANA", "ETC", "ELROND", "AAVE"];

  const fetchCoinData = async (coin, period = "30") => {
    try {
      setLoading(true);
      const res = await axios.get(
  `http://localhost:5224/api/CryptoDashboard/DataFiltered`,
  {
    params: {
      coinName: coin,
      period: period, // string olarak gönder
      minPrice: null,
      maxPrice: null,
      sortColumn: "date", // backend JSON alanına uygun
      sortOrder: "asc",
    },
  }
);

console.log("Backendden gelen veri:", res.data);

      const coinData = Array.isArray(res.data) ? res.data : [];
      setData((prev) => ({ ...prev, [coin]: coinData }));

      if (coinData.length > 0) {
        const dates = coinData.map((d) => new Date(d.date));
        setStartDate(new Date(Math.min(...dates)));
        setEndDate(new Date(Math.max(...dates)));
        setStats(calculateStats(coinData));
      } else {
        setStats(null);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setData((prev) => ({ ...prev, [coin]: [] }));
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (coinData) => {
    if (!coinData || coinData.length === 0) return null;
    let highestAvgDiff = 0;
    let lowestPrice = coinData[0].price;
    let highestPrice = coinData[0].price;

    coinData.forEach((d) => {
      const diff = Math.abs(d.open - d.price);
      if (diff > highestAvgDiff) highestAvgDiff = diff;
      if (d.price < lowestPrice) lowestPrice = d.price;
      if (d.price > highestPrice) highestPrice = d.price;
    });

    return { highestAvgDiff, lowestPrice, highestPrice };
  };

  const handleCoinClick = (coin) => {
    setSelectedCoin(coin);
    fetchCoinData(coin, rangeDays);
  };

  useEffect(() => {
    if (selectedCoin && rangeDays) {
      fetchCoinData(selectedCoin, rangeDays);
    }
  }, [rangeDays, selectedCoin]);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Crypto Dashboard</h1>

      {!selectedCoin && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
          }}
        >
          {coins.map((coin) => (
            <div
              key={coin}
              onClick={() => handleCoinClick(coin)}
              style={{
                border: "1px solid #ddd",
                padding: "15px",
                borderRadius: "10px",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <img src={coinLogos[coin]} alt={coin} width="40" height="40" />
                <h2>{coin}</h2>
              </div>
              <p>Click to view details</p>
            </div>
          ))}
        </div>
      )}

      {selectedCoin && (
        <div>
          <button
            onClick={() => setSelectedCoin(null)}
            style={{
              marginBottom: "20px",
              padding: "10px 15px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Back
          </button>

          <h2>{selectedCoin} Details</h2>

          <div style={{ marginBottom: "20px", display: "flex", gap: "20px" }}>
            <div>
              <label>Start Date: </label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
              />
            </div>
            <div>
              <label>End Date: </label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
              />
            </div>
          </div>

          <div
            style={{
              marginBottom: "20px",
              display: "flex",
              gap: "10px",
              alignItems: "center",
            }}
          >
            {["7", "30", "90"].map((d) => (
              <button
                key={d}
                onClick={() => setRangeDays(d)}
                style={{
                  padding: "5px 10px",
                  backgroundColor: rangeDays === d ? "#8884d8" : "#fff",
                  border: "1px solid #8884d8",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                {d}
              </button>
            ))}
          </div>

          {stats && (
            <div style={{ marginBottom: "20px" }}>
              <p>En yüksek ortalama fark: {stats.highestAvgDiff}</p>
              <p>En düşük fiyat: {stats.lowestPrice}</p>
              <p>En yüksek fiyat: {stats.highestPrice}</p>
            </div>
          )}

          {loading ? (
            <h3>Loading...</h3>
          ) : data[selectedCoin] && data[selectedCoin].length > 0 ? (
            <CoinChart data={data[selectedCoin]} />
          ) : (
            <h3>No data to display</h3>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
