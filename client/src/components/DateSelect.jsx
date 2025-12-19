import React, { useState } from 'react'
import BlurCircle from './BlurCircle'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from "react-i18next";

const DateSelect = ({ dateTime, id }) => {

  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [selected, setSelected] = useState(null);

  const onBookHandler = () => {
    if (!selected) {
      return toast(t("date.select_warning"));
    }
    navigate(`/movies/${id}/${selected}`);
    scrollTo(0, 0);
  };

  return (
    <div id='dateSelect' className='pt-30'>
      <div className='flex flex-col md:flex-row items-center justify-between gap-10 relative p-8 bg-primary/10 border border-primary/20 rounded-lg'>
        <BlurCircle top="-100px" left="-100px" />
        <BlurCircle top="100px" right="0px" />

        <div>
          <p className='text-lg font-semibold'>
            {t("date.choose")}
          </p>

          <div className='flex items-center gap-6 text-sm mt-5'>
            <ChevronLeftIcon width={28} />

         <span className='grid grid-cols-3 sm:grid-cols-4 md:flex flex-wrap md:max-w-xl gap-4'>
  {Object.keys(dateTime).map((date) => (
    <button
      onClick={() => setSelected(date)}
      key={date}
      className={`flex flex-col items-center justify-center 
      h-16 w-16 md:h-20 md:w-20 
      rounded-lg cursor-pointer transition-all
      ${selected === date 
        ? "bg-primary text-white shadow-lg scale-105" 
        : "border border-primary/70 hover:bg-primary/20"
      }`}
    >
      <span className="text-lg font-semibold">
        {new Date(date).getDate()}
      </span>

      <span className="text-sm opacity-80">
        {new Date(date).toLocaleDateString(
          i18n.language === "vi" ? "vi-VN" : "en-US",
          { month: "short" }
        )}
      </span>
    </button>
  ))}
</span>


            <ChevronRightIcon width={28} />
          </div>
        </div>

        <button
          onClick={onBookHandler}
          className='bg-primary text-white px-8 py-2 mt-6 rounded hover:bg-primary/90 transition-all cursor-pointer'
        >
          {t("date.book_now")}
        </button>
      </div>
    </div>
  )
}

export default DateSelect;
