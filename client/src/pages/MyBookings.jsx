import React, { useEffect, useState } from "react";
import Loading from "../components/Loading";
import BlurCircle from "../components/BlurCircle";
import timeFormat from "../lib/timeFormat";
import { dateFormat } from "../lib/dateFormat";
import { useAppContext } from "../context/AppContext";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const MyBookings = () => {
  const { t } = useTranslation();
  const currency = import.meta.env.VITE_CURRENCY;

  const { axios, getToken, user, image_base_url } = useAppContext();

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const location = useLocation();

  /* ========================================================
        SHOW PAYMENT STATUS
  ======================================================== */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get("payment");

    if (!status) return;

    if (status === "success") toast.success(t("booking.payment_success"));
    if (status === "error") toast.error(t("booking.payment_failed"));
    if (status === "cancel") toast(t("booking.payment_cancelled"));
  }, [location.search]);

  /* ========================================================
        FETCH MY BOOKINGS
  ======================================================== */
  const getMyBookings = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/user/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) setBookings(data.bookings);
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) getMyBookings();
  }, [user]);

  /* ========================================================
        RETRY PAYMENT (SePay)
  ======================================================== */
  const retryPayment = async (booking) => {
    try {
      const token = await getToken();

      const { data } = await axios.post(
        "/api/sepay/create",
        {
          showId: booking.show._id,
          selectedSeats: booking.bookedSeats,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!data.success) return toast.error(t("booking.retry_failed"));

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
    } catch (err) {
      console.log(err);
      toast.error(t("booking.retry_failed"));
    }
  };

  /* ========================================================
        UI
  ======================================================== */
  return !isLoading ? (
    <div className="relative px-6 md:px-20 lg:px-56 pt-36 pb-24 min-h-[80vh] select-none">

      {/* FX */}
      <BlurCircle top="120px" left="120px" />
      <BlurCircle bottom="60px" left="520px" />

      {/* Title */}
      <h1 className="text-3xl font-bold mb-10 tracking-tight text-white drop-shadow">
        🎟 {t("booking.title")}
      </h1>

      {/* Empty */}
      {bookings.length === 0 && (
        <p className="text-gray-300 text-lg mt-10">
          {t("booking.no_bookings")}
        </p>
      )}

      {/* List */}
      {bookings.map((item, index) => (
        <div
          key={index}
          className="
            relative flex flex-col md:flex-row gap-6 mb-10
            rounded-2xl overflow-hidden
            bg-gradient-to-br from-[#111] to-[#000]
            border border-white/10 shadow-xl
            hover:shadow-2xl hover:scale-[1.01]
            transition-all duration-300
          "
        >
          {/* Poster */}
          <div className="w-full md:w-48 h-64 relative">
            <img
              src={image_base_url + item.show.movie.poster_path}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
          </div>

          {/* Ticket Info */}
          <div className="flex flex-col justify-between flex-1 px-6 py-5">

            {/* Top Info */}
            <div>
              <p className="text-2xl font-semibold text-white leading-tight">
                {item.show.movie.title}
              </p>

              <p className="text-gray-400 mt-1 text-sm">
                ⏱ {timeFormat(item.show.movie.runtime)}
              </p>

              <div className="mt-5 space-y-2">
                <p className="text-gray-300 text-sm">
                  <span className="font-medium text-white">🎬 Showtime:</span>{" "}
                  {dateFormat(item.show.showDateTime)}
                </p>
                <p className="text-gray-300 text-sm">
                  <span className="font-medium text-white">💺 Seats:</span>{" "}
                  {item.bookedSeats.join(", ")}
                </p>
                <p className="text-gray-300 text-sm">
                  <span className="font-medium text-white">🎫 Tickets:</span>{" "}
                  {item.bookedSeats.length}
                </p>
              </div>
            </div>

            {/* Price + Pay */}
            <div className="flex items-center justify-between mt-6">

              <p className="text-4xl font-bold text-primary drop-shadow-[0_0_12px_rgba(248,69,101,0.5)]">
                {currency}{item.amount}
              </p>

              {!item.isPaid ? (
                <button
                  onClick={() => retryPayment(item)}
                  className="
                    px-6 py-2 rounded-full text-sm font-semibold
                    bg-gradient-to-br from-primary to-primary/80 text-black
                    shadow-[0_0_15px_rgba(248,69,101,0.7)]
                    hover:shadow-[0_0_25px_rgba(248,69,101,0.9)]
                    transition-all duration-200
                  "
                >
                  {t("booking.pay_now")}
                </button>
              ) : (
                <span
                  className="
                    px-4 py-1.5 text-sm rounded-full font-semibold
                    bg-green-500/20 text-green-400
                    border border-green-500/30 backdrop-blur-md
                  "
                >
                  ✔ {t("booking.paid")}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <Loading />
  );
};

export default MyBookings;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          