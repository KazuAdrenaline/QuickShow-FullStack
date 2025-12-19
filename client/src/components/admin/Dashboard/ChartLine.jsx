import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const ChartLine = ({ data }) => {
  return (
    <div className="bg-[#101827] p-5 rounded-xl border border-white/10 shadow-md">
      <h3 className="text-white mb-4 font-semibold text-lg">
        Sales Overview
      </h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#7b8fff"
              strokeWidth={3}
              dot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartLine;
