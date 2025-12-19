import { ArrowRight } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import BlurCircle from "./BlurCircle";
import MovieCard from "./MovieCard";
import { useAppContext } from "../context/AppContext";
import { useTranslation } from "react-i18next";

const FeaturedSection = () => {
  const navigate = useNavigate();
  const { shows } = useAppContext();
  const { t } = useTranslation();

  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-44 overflow-hidden">
      <div className="relative flex items-center justify-between pt-20 pb-10">
        <BlurCircle top="0" right="-80px" />

        {/* NOW SHOWING */}
        <p className="text-gray-300 font-medium text-lg">
          {t("featured.now_showing")}
        </p>

        {/* VIEW ALL */}
        <button
          onClick={() => navigate("/movies")}
          className="group flex items-center gap-2 text-sm text-gray-300 cursor-pointer"
        >
          {t("featured.view_all")}
          <ArrowRight className="group-hover:translate-x-0.5 transition w-4.5 h-4.5" />
        </button>
      </div>

      <div className="flex flex-wrap max-sm:justify-center gap-8 mt-8">
        {shows.slice(0, 6).map((show) => (
          <MovieCard key={show._id} movie={show} />
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
          {t("featured.show_more")}
        </button>
      </div>
    </div>
  );
};

export default FeaturedSection;
