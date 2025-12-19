import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BlurCircle from "../components/BlurCircle";
import { Heart, PlayCircleIcon, StarIcon } from "lucide-react";
import timeFormat from "../lib/timeFormat";
import DateSelect from "../components/DateSelect";
import MovieCard from "../components/MovieCard";
import Loading from "../components/Loading";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import CommentSection from "../components/CommentSection.jsx";
import { useTranslation } from "react-i18next";   // ⭐ THÊM

const MovieDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [show, setShow] = useState(null);

  // ⭐ Hook dịch
  const { t } = useTranslation();

  const {
    shows,
    axios,
    getToken,
    user,
    fetchFavoriteMovies,
    favoriteMovies,
    image_base_url,
  } = useAppContext();

  const getShow = async () => {
    try {
      const { data } = await axios.get(`/api/show/${id}`);
      if (data.success) setShow(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleFavorite = async () => {
    try {
      if (!user) return toast.error(t("movie.login_first"));

      const { data } = await axios.post(
        "/api/user/update-favorite",
        { movieId: id },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (data.success) {
        await fetchFavoriteMovies();
        toast.success(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getShow();
  }, [id]);

  return show ? (
    <div className="px-6 md:px-16 lg:px-40 pt-30 md:pt-50">

      {/* TOP SECTION */}
      <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
        <img
          src={image_base_url + show.movie.poster_path}
          alt=""
          className="max-md:mx-auto rounded-xl h-104 max-w-70 object-cover"
        />

        <div className="relative flex flex-col gap-3">
          <BlurCircle top="-100px" left="-100px" />

          <p className="text-primary">{t("movie.language")}</p>

          <h1 className="text-4xl font-semibold max-w-96 text-balance">
            {show.movie.title}
          </h1>

          <div className="flex items-center gap-2 text-gray-300">
            <StarIcon className="w-5 h-5 text-primary fill-primary" />
            {show.movie.vote_average.toFixed(1)} {t("movie.user_rating")}
          </div>

          <p className="text-gray-400 mt-2 text-sm leading-tight max-w-xl">
            {show.movie.overview}
          </p>

          <p>
            {timeFormat(show.movie.runtime)} •{" "}
            {show.movie.genres.map((g) => g.name).join(", ")} •{" "}
            {show.movie.release_date.split("-")[0]}
          </p>

          {/* BUTTONS */}
          <div className="flex items-center flex-wrap gap-4 mt-4">
            <button className="flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-gray-900 transition rounded-md font-medium cursor-pointer active:scale-95">
              <PlayCircleIcon className="w-5 h-5" />
              {t("movie.watch_trailer")}
            </button>

            <a
              href="#dateSelect"
              className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer active:scale-95"
            >
              {t("movie.buy_tickets")}
            </a>

            <button
              onClick={handleFavorite}
              className="bg-gray-700 p-2.5 rounded-full transition cursor-pointer active:scale-95"
            >
              <Heart
                className={`w-5 h-5 ${
                  favoriteMovies.find((movie) => movie._id === id)
                    ? "fill-primary text-primary"
                    : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* CAST */}
      <p className="text-lg font-medium mt-20">{t("movie.favorite_cast")}</p>
      <div className="overflow-x-auto no-scrollbar mt-8 pb-4">
        <div className="flex items-center gap-4 w-max px-4">
          {show.movie.casts.slice(0, 12).map((cast, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <img
                src={image_base_url + cast.profile_path}
                alt=""
                className="rounded-full h-20 md:h-20 aspect-square object-cover"
              />
              <p className="font-medium text-xs mt-3">{cast.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SHOWTIME */}
      <DateSelect dateTime={show.dateTime} id={id} />

      {/* COMMENT SECTION */}
      <div className="mt-20">
        <h2 className="text-xl font-semibold mb-4">{t("comment.title")}</h2>
        <CommentSection movieId={id} />
      </div>

      {/* YOU MAY ALSO LIKE */}
      <p className="text-lg font-medium mt-20 mb-8">{t("movie.may_like")}</p>
      <div className="flex flex-wrap max-sm:justify-center gap-8">
        {shows.slice(0, 4).map((movie, index) => (
          <MovieCard key={index} movie={movie} />
        ))}
      </div>

      {/* SHOW MORE */}
      <div className="flex justify-center mt-20">
        <button
          onClick={() => {
            navigate("/movies");
            scrollTo(0, 0);
          }}
          className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer"
        >
          {t("movie.show_more")}
        </button>
      </div>

    </div>
  ) : (
    <Loading />
  );
};

export default MovieDetails;
