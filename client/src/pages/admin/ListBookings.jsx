import React, { useEffect, useState } from "react";
import { Search, Eye } from "lucide-react";

import Loading from "../../components/Loading";
import Title from "../../components/admin/Title";
import BlurCircle from "../../components/BlurCircle";
import { dateFormat } from "../../lib/dateFormat";
import { useAppContext } from "../../context/AppContext";

// Charts
import DailyBookingsChart from "../../components/admin/ListBooking/DailyBookingsChart";
import StatusDistributionChart from "../../components/admin/ListBooking/StatusDistributionChart";

const ListBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY;
  const { axios, getToken, user } = useAppContext();

  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");

  // CHART DATA
  const [daily, setDaily] = useState([]);
  const [statusData, setStatusData] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  /* ===================== FETCH ALL BOOKINGS ===================== */
  const getAllBookings = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/admin/all-bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setBookings(data.bookings || []);
      }
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  /* ===================== FETCH CHARTS ===================== */
  const getCharts = async () => {
    try {
      const token = await getToken();

      const d = await axios.get("/api/admin/bookings-chart/daily", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (d.data.success) setDaily(d.data.data);

      const s = await axios.get("/api/admin/bookings-chart/status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (s.data.success) setStatusData(s.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (user) {
      getAllBookings();
      getCharts();
    }
  }, [user]);

  /* ===================== SEARCH FILTER ===================== */
  const filtered = bookings.filter((b) => {
    const u = (b.user?.name || "").toLowerCase();
    const m = (b.show?.movie?.title || "").toLowerCase();
    return (
      u.includes(search.toLowerCase()) ||
      m.includes(search.toLowerCase())
    );
  });

  /* ===================== BADGE COLORS ===================== */
  const badge = (paid) =>
    paid
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";

  /* ===================== UI ===================== */
  return !isLoading ? (
    <div className="flex-1 relative z-10 overflow-auto">
      <Title text1="Danh sách" text2="Đơn đặt vé" />
      <BlurCircle top="20px" left="-10%" />

      <main className="max-w-7xl mx-auto py-8 px-4 lg:px-8">

        {/* BIỂU ĐỒ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <DailyBookingsChart title="Lượt đặt vé theo ngày" data={daily} />
          <StatusDistributionChart
            title="Tỉ lệ trạng thái thanh toán"
            data={statusData}
          />
        </div>

        {/* TÌM KIẾM */}
        <div className="flex justify-end mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm đơn đặt vé..."
              className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2
              focus:outline-none focus:ring-2 focus:ring-primary w-72"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>

        {/* BẢNG */}
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">
            Bảng đơn đặt vé
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="bg-primary/20 text-white text-left">
                  <th className="p-3 min-w-[150px]">Khách hàng</th>
                  <th className="p-3 min-w-[260px]">Phim</th>
                  <th className="p-3 min-w-[160px]">Giờ chiếu</th>
                  <th className="p-3 min-w-[90px]">Ghế</th>
                  <th className="p-3 min-w-[100px]">Tổng tiền</th>
                  <th className="p-3 min-w-[110px]">Trạng thái</th>
                  <th className="p-3 text-center min-w-[80px]">Hành động</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-700">
                {filtered.map((item, index) => {
                  const userName = item.user?.name || "Không rõ";
                  const movieTitle = item.show?.movie?.title || "Không có";
                  const showTime = item.show?.showDateTime
                    ? dateFormat(item.show.showDateTime)
                    : "N/A";
                  const seats = Array.isArray(item.bookedSeats)
                    ? item.bookedSeats.join(", ")
                    : "N/A";

                  return (
                    <tr
                      key={index}
                      className="hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="p-3 text-gray-200 font-medium">
                        {userName}
                      </td>

                      <td className="p-3 text-gray-300 truncate max-w-[260px]">
                        {movieTitle}
                      </td>

                      <td className="p-3 text-gray-300">{showTime}</td>
                      <td className="p-3 text-gray-300">{seats}</td>

                      <td className="p-3 font-semibold text-gray-100">
                        {currency} {item.amount}
                      </td>

                      <td className="p-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${badge(
                            item.isPaid
                          )}`}
                        >
                          {item.isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <button className="text-indigo-400 hover:text-indigo-300">
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  ) : (
    <Loading />
  );
};

export default ListBookings;
