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
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
          <XAxis dataKey="day" stroke="var(--color-muted)" />
          <YAxis stroke="var(--color-muted)" />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              color: "var(--color-foreground)",
            }}
          />
          <Line
            type="monotone"
            dataKey="visitors"
            stroke="var(--color-gold)"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BoothTrafficChart;
