import React, { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CoinChart from "./CoinChart";
import './App.css';
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
  const [rangeDays, setRangeDays] = useState(null);
  const [stats, setStats] = useState(null);
  const [minPrice, setMinPrice] = useState(null);
  const [maxPrice, setMaxPrice] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [timeInterval, setTimeInterval] = useState("daily");
  

  const getFilteredData = () => {
    if (!data[selectedCoin]) return [];


    return data[selectedCoin].filter((d) => {
      const dt = new Date(d.date);
      dt.setHours(0, 0, 0, 0);

      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      if (start) start.setHours(0, 0, 0, 0);
      if (end) end.setHours(0, 0, 0, 0);

      const dateInRange =
        (start ? dt >= start : true) && (end ? dt <= end : true);

      const priceInRange =
        (minPrice === null || d.price >= minPrice) &&
        (maxPrice === null || d.price <= maxPrice);

      return dateInRange && priceInRange;
    });
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const coinColors = {
    BTC: "#f7931a33",
    ETH: "#3c3c3d33",
    LITECOIN: "#bebebe33",
    SOLANA: "#00FFA333",
    ETC: "#6993ff33",
    ELROND: "#00c2a833",
    AAVE: "#b6509e33",
  };

  const coins = ["BTC", "ETH", "LITECOIN", "SOLANA", "ETC", "ELROND", "AAVE"];
  const fetchCoinData = async (coin, period = null, start = startDate, end = endDate) => {
    console.log("Fetching data:", { coin, period, start, end, minPrice, maxPrice });
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:5224/api/CryptoDashboard/DataFiltered`,
        {
          params: {
            coinName: coin,
            period: period,
            startDate: start ? formatDate(start) : null,
            endDate: end ? formatDate(end) : null,
            minPrice: minPrice || null,
            maxPrice: maxPrice || null,
            sortColumn: "date",
            sortOrder: "asc",
          },
        }
      );
      console.log("API response:", res.data); 
      setFilteredData(res.data);

      const coinData = Array.isArray(res.data) ? res.data : [];
      const formattedCoinData = coinData.map((d) => ({
        ...d,
        date: formatDate(d.date),
      }));

      setData((prev) => ({ ...prev, [coin]: formattedCoinData }));

      if (formattedCoinData.length > 0) {
        setStats(calculateStats(formattedCoinData));
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
    let totalDiff = 0;
    let lowestPrice = coinData[0].price;
    let highestPrice = coinData[0].price;

    coinData.forEach((d) => {
      const diff = Math.abs(d.open - d.price);
      totalDiff += diff;
      if (d.price < lowestPrice) lowestPrice = d.price;
      if (d.price > highestPrice) highestPrice = d.price;
    });
    const averageDiff = totalDiff / coinData.length;
    return { averageDiff, lowestPrice, highestPrice };
  };

  const handleCoinClick = (coin) => {
    setSelectedCoin(coin);
    fetchCoinData(coin, rangeDays);
  };

  useEffect(() => {
    if (selectedCoin) {
      fetchCoinData(selectedCoin, rangeDays, startDate, endDate);
    }
  }, [selectedCoin, rangeDays, startDate, endDate, minPrice, maxPrice]);

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
                borderRadius: "15px",
                cursor: "pointer",
                textAlign: "center",
                padding: "20px",
                backgroundColor: coinColors[coin],
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                }}
              >
                <img src={coinLogos[coin]} alt={coin} width="40" height="40" />
                <h2>{coin}</h2>
              </div>
              <p
                style={{ color: "#555", fontSize: "14px", margin: "10px 0" }}
              >
                Click for price and detailed statistical information.
              </p>
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
            className="back-btn"
          >
            Back
          </button>

          <h2>{selectedCoin} Details</h2>

          <div
            style={{ marginBottom: "20px", display: "flex", gap: "20px",fontFamily: "Cursive",fontSize: "20px" }}
          >
            <div>
              <label>Start Date: </label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                dateFormat="yyyy-MM-dd"
              />
            </div>
            <div>
              <label>End Date: </label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                dateFormat="yyyy-MM-dd"
              />
            </div>
          </div>

          <div style={{ marginBottom: "50px", display: "flex", gap: "20px",fontFamily: "Cursive",fontSize: "20px" }}>
            <div>
              <label>  Min Price : </label>
              <input
                type="number"
                value={minPrice || ""}
                onChange={(e) => setMinPrice(Number(e.target.value))}
              />
            </div>
            <div>
              <label> Max Price   : </label>
              <input
                type="number"
                value={maxPrice || ""}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
              />
            </div>
          </div>
              
          {stats && (
            
            <div style={{ marginBottom: "50px" ,fontFamily: "Cursive",fontSize: "20px"}}>
              
              <p>Highest average difference: {stats.averageDiff.toFixed(2)}</p>
              <p>Lowest price:    {stats.lowestPrice}</p>
              <p>highest price:   {stats.highestPrice}</p>
            </div>
          )}
          
          <div style={{ marginBottom: "20px", display: "flex", gap: "10px", justifyContent: "left" }}>
            {["7","30","90"].map((d) => (
              <button
                key={d}
                onClick={() => {
                  const days = Number(d);
                  const today = endDate ? new Date(endDate) : new Date();
                  const newStartDate = new Date(today);
                  newStartDate.setDate(today.getDate() - days);
                  setStartDate(newStartDate);
                  setRangeDays(d);

                  if (selectedCoin) {
                    fetchCoinData(selectedCoin, d, newStartDate, today);
                  }
                }}
                className={`range-btn ${rangeDays === d ? 'selected' : ''}`}
              >
                {`${d} Day`}
              </button>
            ))}
          </div>

          {loading ? (
            <h1>Loading...</h1>
          ) : data[selectedCoin] && data[selectedCoin].length > 0 ? (
            <>
              <CoinChart data={filteredData} />
              <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                {["daily", "weekly", "monthly"].map((interval) => (
                  <button
                    key={interval}
                    onClick={() =>
                                  {
                                    setTimeInterval(interval);
                                    fetchCoinData(selectedCoin,interval,startDate,endDate)
                                  }
                                    
                            } 
                    className={`interval-btn ${timeInterval === interval ? 'selected' : ''}`}
                  >
                    {interval.charAt(0).toUpperCase() + interval.slice(1)}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <h3>No data to display</h3>
          )}
        </div>
      )}
    </div>
  );
}
export default App;
