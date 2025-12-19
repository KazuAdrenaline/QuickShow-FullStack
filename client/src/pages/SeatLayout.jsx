import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../components/Loading";
import { ClockIcon } from "lucide-react";
import isoTimeFormat from "../lib/isoTimeFormat";
import BlurCircle from "../components/BlurCircle";
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import { useTranslation } from "react-i18next";
import i18n from "../i18n"; // để force rerender khi đổi ngôn ngữ

const SeatLayout = () => {
  const { t } = useTranslation();   
  const navigate = useNavigate();

  const groupRows = [["A", "B"], ["C", "D"], ["E", "F"], ["G", "H"], ["I", "J"]];

  const { id, date } = useParams();
  const { axios, getToken, user } = useAppContext();

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [movieSchedule, setMovieSchedule] = useState(null);
  const [showDetail, setShowDetail] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState([]);

  // FETCH SHOWTIMES
  const fetchMovieShowtimes = async () => {
    try {
      const { data } = await axios.get(`/api/show/${id}`);
      if (data.success) setMovieSchedule(data);
    } catch {}
  };

  // FETCH SHOW DETAIL + OCCUPIED SEATS
  const fetchShowDetail = async (showId) => {
    try {
      const { data } = await axios.get(`/api/show/detail/${showId}`);
      if (data.success) {
        setShowDetail(data.show);
        fetchOccupiedSeats(showId);
      }
    } catch {}
  };

  const fetchOccupiedSeats = async (showId) => {
    try {
      const { data } = await axios.get(`/api/booking/seats/${showId}`);
      if (data.success) setOccupiedSeats(data.occupiedSeats);
    } catch {}
  };

  // CLICK SEAT
  const handleSeatClick = (seatId) => {
    if (!selectedTime) return toast.error(t("seat.need_time"));
    if (occupiedSeats.includes(seatId))
      return toast.error(t("seat.already_booked"));

    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((s) => s !== seatId)
        : [...prev, seatId]
    );
  };

  // RENDER ROWS
  const renderSeats = (row, count = 9) => (
    <div key={row} className="flex gap-2 mt-2">
      {Array.from({ length: count }, (_, i) => {
        const seatId = `${row}${i + 1}`;
        return (
          <button
            key={seatId}
            onClick={() => handleSeatClick(seatId)}
            className={`h-8 w-8 rounded border border-primary/60
              ${selectedSeats.includes(seatId) ? "bg-primary text-white" : ""}
              ${occupiedSeats.includes(seatId) ? "opacity-50" : ""}
            `}
          >
            {seatId}
          </button>
        );
      })}
    </div>
  );

  // PAY STRIPE
  const payWithStripe = async () => {
    try {
      if (!user) return toast.error(t("seat.login_first"));
      if (!selectedSeats.length || !selectedTime)
        return toast.error(t("seat.need_seats"));

      const token = await getToken();
      const { data } = await axios.post(
        "/api/booking/create",
        { showId: selectedTime.showId, selectedSeats },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) window.location.href = data.url;
      else toast.error(data.message);
    } catch {
      toast.error(t("seat.stripe_failed"));
    }
  };

  // PAY SEPAY
  const payWithSePay = async () => {
    try {
      if (!user) return toast.error(t("seat.login_first"));
      if (!selectedSeats.length || !selectedTime)
        return toast.error(t("seat.need_seats"));

      const token = await getToken();
      const { data } = await axios.post(
        "/api/sepay/create",
        { showId: selectedTime.showId, selectedSeats },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!data.success) return toast.error(data.message);

      const { checkoutURL, fields } = data;
      const form = document.createElement("form");
      form.method = "POST";
      form.action = checkoutURL;

      Object.keys(fields).forEach((key) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = fields[key];
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch {
      toast.error(t("seat.sepay_failed"));
    }
  };

  useEffect(() => {
    fetchMovieShowtimes();
  }, []);

  const ticketPrice = showDetail?.showPrice || 0;
  const totalPrice = ticketPrice * selectedSeats.length;

  // FORCE RE-RENDER WHEN LANGUAGE CHANGES
  return movieSchedule ? (
    <div key={i18n.language} className="flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-30 md:pt-50">

      {/* LEFT */}
      <div className="w-60 bg-primary/10 border border-primary/20 rounded-lg py-10 h-max md:sticky md:top-30">
        <p className="text-lg font-semibold px-6">
          {t("seat.available_timings")}
        </p>

        <div className="mt-5 space-y-1">
          {movieSchedule.dateTime[date]?.map((item) => (
            <div
              key={item.time}
              onClick={() => {
                setSelectedTime(item);
                fetchShowDetail(item.showId);
                setSelectedSeats([]);
              }}
              className={`flex items-center gap-2 px-6 py-2 w-max rounded-r-md cursor-pointer 
                ${
                  selectedTime?.showId === item.showId
                    ? "bg-primary text-white"
                    : "hover:bg-primary/20"
                }
              `}
            >
              <ClockIcon className="w-4 h-4" />
              <p>{isoTimeFormat(item.time)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex-1 flex flex-col items-center max-md:mt-16 relative">
        <BlurCircle top="-100px" left="-100px" />
        <BlurCircle bottom="0" right="0" />

        <h1 className="text-2xl font-semibold mb-4">
          {t("seat.select_seat")}
        </h1>

        <img src={assets.screenImage} alt="screen" />
        <p className="text-gray-400 text-sm mb-6">
          {t("seat.screen_side")}
        </p>

        <div className="flex flex-col items-center mt-10 text-xs text-gray-300">
          <div className="grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-2 mb-6">
            {groupRows[0].map((row) => renderSeats(row))}
          </div>

          <div className="grid grid-cols-2 gap-11">
            {groupRows.slice(1).map((group, idx) => (
              <div key={idx}>{group.map((row) => renderSeats(row))}</div>
            ))}
          </div>
        </div>

        {showDetail && (
          <>
            <p className="text-lg font-semibold mt-10">
              {t("seat.price_per_seat")}:{" "}
              <span className="text-primary">
                {ticketPrice.toLocaleString("vi-VN")}đ
              </span>
            </p>

            <p className="text-lg font-semibold mt-2 mb-4">
              {t("seat.total")}:{" "}
              <span className="text-primary">
                {totalPrice.toLocaleString("vi-VN")}đ
              </span>
            </p>
          </>
        )}

        <div className="flex gap-4 mt-4">
          <button
            onClick={payWithStripe}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full"
          >
            {t("seat.pay_stripe")}
          </button>

          <button
            onClick={payWithSePay}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full"
          >
            {t("seat.pay_sepay")}
          </button>
        </div>
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default SeatLayout;
