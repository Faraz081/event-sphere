import { boothTrafficData } from "@/data/mockData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from "recharts";


const BoothTrafficChart = () => {
  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <h3 className="font-display text-foreground text-lg mb-4">
        Booth Traffic Over Time
      </h3>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={boothTrafficData}>
          <CartesianGrid stroke="#2A2E38" strokeDasharray="3 3" />
          <XAxis dataKey="day" stroke="#8B8F9B" />
          <YAxis stroke="#8B8F9B" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1C1F27",
              border: "1px solid #2A2E38",
            }}
          />
          <Line
            type="monotone"
            dataKey="visitors"
            stroke="#C9A227"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BoothTrafficChart;