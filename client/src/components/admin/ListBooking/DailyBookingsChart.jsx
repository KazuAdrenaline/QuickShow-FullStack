const DailyBookingsChart = () => {
  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700">
      <h2 className="text-xl font-semibold text-gray-100 mb-4">
        Daily Bookings
      </h2>

      <div className="w-full h-[300px] flex items-center justify-center text-gray-400 text-sm">
        Chưa có dữ liệu biểu đồ
      </div>
    </div>
  );
};

export default DailyBookingsChart;
