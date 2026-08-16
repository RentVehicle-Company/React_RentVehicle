import React from 'react'
import { useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { FaCar, FaRegUser } from 'react-icons/fa';
import { BsFuelPump } from 'react-icons/bs';
import { CiLocationOn } from 'react-icons/ci';
import { FaLocationDot } from 'react-icons/fa6';

const CarCard = () => {
    const currency = import.meta.env.VITE_CURRENCY;
    const navigate = useNavigate();

  return (
    <div 
      // onClick={}   use for view detail car
      className='group rounded-xl overflow-hidden shadow-lg hover:-translate-y-1 transition-all duration-100 cursor-pointer'
    >
      <div className='relative h-48 overflow-hidden'>
        <img src={assets.car_image1} alt="can image1"
          className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
         />

         <p className='absolute top-4 left-4 bg-primary/90 text-white text-xs px-2.5 py-1 rounded-full'>Available</p>
      
        <div className='absolute bottom-0 right-0 bg-black/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg'>
          <span className='font-semibold'>
            <p>{currency}100<span className='text-sm text-white/80'> / day</span></p>
          </span>
        </div>  
      </div>

      <div className='p-4 sm:p-5'>
        <div className='flex justify-between items-start mb-2'>
          <div>
            {/*  {car.brand} {car.model} */}
            <h3 className='text-lg font-medium'>BMW M3</h3>
            {/* {car.category} ● {car.year} */}
            <p className='text-muted-foreground text-sm'>Car ● 2024</p>
          </div>
        </div>

        <div className='mt-4 grid grid-cols-2 gap-y-2 text-gray-600'>
          <div className='flex items-center text-sm text-muted-foreground'>
            <div className='h-4 mr-2'><FaRegUser/></div>
            {/* {car.seating_capacity} */}
            <span>4 Seats</span>
          </div>

          <div className='flex items-center text-sm text-muted-foreground'>
            <div className='h-4 mr-2'><BsFuelPump/></div>
            {/* {assets.fuel_icon} */}
            <span>Petrol</span>
          </div>
          <div className='flex items-center text-sm text-muted-foreground'>
            <div className='h-4 mr-2'><FaCar/></div>
            {/* {assets.car_icon} */}
            <span>Semi Automatic</span>
          </div>
          <div className='flex items-center text-sm text-muted-foreground'>
            <div className='h-4 mr-2'><FaLocationDot/></div>
            {/* {assets.location_icon} */}
            <span>Phnom Penh</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CarCard
