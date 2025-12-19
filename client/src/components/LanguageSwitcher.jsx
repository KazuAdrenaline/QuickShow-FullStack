import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";

// IMPORT FLAG ASSETS
import vnFlag from "../assets/vn.png";
import gbFlag from "../assets/gb.png";

const languages = [
  { code: "vi", label: "Tiếng Việt (VN)", flag: vnFlag },
  { code: "en", label: "English (EN)", flag: gbFlag }
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang =
    languages.find((l) => l.code === i18n.language) || languages[0];

  const changeLang = (lng) => {
    i18n.changeLanguage(lng);

    // đổi font global
    if (lng === "vi") document.documentElement.classList.add("vi");
    else document.documentElement.classList.remove("vi");

    setOpen(false);
  };

  // Click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Button chính */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 text-white text-base hover:opacity-80 transition rounded-md"
      >
        <img src={currentLang.flag} className="w-6 h-6 rounded-sm" />
        <span className="font-medium text-base">
          {currentLang.code.toUpperCase()}
        </span>
        <ChevronDown
          size={18}
          className={`${open ? "rotate-180" : ""} transition`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg shadow-xl p-2 z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLang(lang.code)}
              className={`flex items-center justify-between w-full px-3 py-3 rounded-md text-base text-white hover:bg-white/10 transition ${
                i18n.language === lang.code ? "bg-white/10" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <img src={lang.flag} className="w-6 h-6 rounded-sm" />
                <span>{lang.label}</span>
              </div>

              {i18n.language === lang.code && (
                <span className="text-primary font-bold text-lg">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
