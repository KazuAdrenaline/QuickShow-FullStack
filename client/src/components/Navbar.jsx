import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { MenuIcon, SearchIcon, TicketPlus, XIcon } from 'lucide-react'
import { useClerk, UserButton, useUser } from '@clerk/clerk-react'
import { useAppContext } from '../context/AppContext'

// i18n
import { useTranslation } from "react-i18next"

// Language switcher
import LanguageSwitcher from '../components/LanguageSwitcher'

const Navbar = () => {

  const [isOpen, setIsOpen] = useState(false)
  const { user } = useUser()
  const { openSignIn } = useClerk()
  const navigate = useNavigate()
  const { favoriteMovies } = useAppContext()

  const { t } = useTranslation();

  return (
    <div className='fixed top-0 left-0 z-50 w-full flex items-center justify-between px-6 md:px-16 lg:px-36 py-5'>
      
      {/* Logo */}
      <Link to='/' className='max-md:flex-1'>
        <img src={assets.logo} alt="logo" className='w-36 h-auto'/>
      </Link>

      {/* Menu responsive */}
      <div 
        className={`max-md:absolute max-md:top-0 max-md:left-0 max-md:font-medium max-md:text-lg 
        z-50 flex flex-col md:flex-row items-center max-md:justify-center gap-8 min-md:px-8 py-3 
        max-md:h-screen min-md:rounded-full backdrop-blur bg-black/70 md:bg-white/10 
        md:border border-gray-300/20 overflow-hidden transition-[width] duration-300 
        ${isOpen ? 'max-md:w-full' : 'max-md:w-0'}`}
      >

        <XIcon 
          className='md:hidden absolute top-6 right-6 w-6 h-6 cursor-pointer' 
          onClick={() => setIsOpen(!isOpen)}
        />

        <Link onClick={() => {scrollTo(0,0); setIsOpen(false)}} to='/'>{t("nav.home")}</Link>
        <Link onClick={() => {scrollTo(0,0); setIsOpen(false)}} to='/movies'>{t("nav.movies")}</Link>
        <Link onClick={() => {scrollTo(0,0); setIsOpen(false)}} to='/'>{t("nav.theaters")}</Link>
        <Link onClick={() => {scrollTo(0,0); setIsOpen(false)}} to='/'>{t("nav.releases")}</Link>

        {favoriteMovies.length > 0 && (
          <Link onClick={() => {scrollTo(0,0); setIsOpen(false)}} to='/favorite'>
            {t("nav.favorites")}
          </Link>
        )}
      </div>

      {/* Search + Login + Language */}
      <div className='flex items-center gap-6'>

        {/* Nút đổi ngôn ngữ */}
        <LanguageSwitcher />

        {/* Search icon */}
        <SearchIcon className='max-md:hidden w-6 h-6 cursor-pointer'/>

        {/* Login / User */}
        {!user ? (
          <button 
            onClick={openSignIn} 
            className='px-4 py-1 sm:px-7 sm:py-2 bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer'
          >
            {t("nav.login")}
          </button>
        ) : (
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Action 
                label={t("nav.mybookings")} 
                labelIcon={<TicketPlus width={15}/>} 
                onClick={() => navigate('/my-bookings')}
              />
            </UserButton.MenuItems>
          </UserButton>
        )}
      </div>

      {/* Hamburger menu */}
      <MenuIcon 
        className='max-md:ml-4 md:hidden w-8 h-8 cursor-pointer' 
        onClick={() => setIsOpen(!isOpen)}
      />
    </div>
  )
}

export default Navbar
