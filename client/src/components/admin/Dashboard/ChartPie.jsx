import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#7b8fff", "#ff6b81", "#fbbc04", "#4ade80", "#ff8c00"];

const ChartPie = ({ data }) => {
  return (
    <div className="bg-[#101827] p-5 rounded-xl border border-white/10 shadow-md">
      <h3 className="text-white mb-4 font-semibold text-lg">
        Category Distribution
      </h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              outerRadius={90}
              innerRadius={50}
              paddingAngle={4}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartPie;
