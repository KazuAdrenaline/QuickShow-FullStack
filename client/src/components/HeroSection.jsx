import React, { useState, useEffect } from "react";
import { ArrowRight, ClockIcon } from "lucide-react";
import demonImg from "../assets/demon.jpg";
import kaisenImg from "../assets/kaisen.jpg";
import chainsawImg from "../assets/chainsawmain.jpg";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";   // ⭐ THÊM

const HeroSection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();  // ⭐ HOOK DỊCH

  // ───────────────────────────────
  // DATA 3 SLIDES (DÙNG i18n KEY)
  // ───────────────────────────────
  const slides = [
    {
      bg: demonImg,
      title: t("hero.slide1.title"),
      genres: t("hero.slide1.genres"),
      year: "2019",
      episodes: t("hero.slide1.episodes"),
      desc: t("hero.slide1.desc"),
    },
    {
      bg: kaisenImg,
      title: t("hero.slide2.title"),
      genres: t("hero.slide2.genres"),
      year: "2020",
      episodes: t("hero.slide2.episodes"),
      desc: t("hero.slide2.desc"),
    },
    {
      bg: chainsawImg,
      title: t("hero.slide3.title"),
      genres: t("hero.slide3.genres"),
      year: "2022",
      episodes: t("hero.slide3.episodes"),
      desc: t("hero.slide3.desc"),
    },
  ];

  const [index, setIndex] = useState(0);

  // ───────────────────────────────
  // AUTO SLIDE (6s)
  // ───────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const current = slides[index];

  return (
    <div
      className="relative flex flex-col items-start justify-center gap-6
      px-6 md:px-16 lg:px-36 bg-cover bg-center h-screen transition-all duration-700"
      style={{ backgroundImage: `url(${current.bg})` }}
    >
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 max-w-3xl">
        {/* Title */}
        <h1 className="text-5xl md:text-[70px] leading-tight font-semibold text-white mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
          {current.title}
        </h1>

        {/* Genre + Year */}
        <div className="flex items-center gap-6 text-white mb-3 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
          <span>{current.genres}</span>
          <span className="flex items-center gap-2">
            {current.year}
            <ClockIcon className="w-5 h-5" /> {current.episodes}
          </span>
        </div>

        {/* Description */}
        <p className="max-w-lg text-white mb-6 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
          {current.desc}
        </p>

        {/* Button */}
        <button
          onClick={() => navigate("/movies")}
          className="flex items-center gap-2 px-7 py-3 text-sm bg-primary 
          hover:bg-primary-dull transition rounded-full font-medium cursor-pointer 
          text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]"
        >
          {t("hero.explore")}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default HeroSection;
