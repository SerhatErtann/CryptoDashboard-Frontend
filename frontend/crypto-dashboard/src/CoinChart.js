import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

function CoinChart({ data }) {
  if (!data || data.length === 0) return <p>No data to display</p>;

  
  const angle = data.length > 15 ? -45 : 0;

 
  const formattedData = data.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString(), 
    price: d.price,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={formattedData}
        margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tick={{ angle: angle, textAnchor: angle === 0 ? "middle" : "end", fontSize: 15 }}
          interval="preserveStartEnd"
        />
        <YAxis domain={["auto", "auto"]} />
        <Tooltip />
        <Line type="monotone" dataKey="price" stroke="#8884d8" dot={true} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default CoinChart;