import React, { useState } from 'react'
import { CgSearch } from 'react-icons/cg'
import { IoSearch } from 'react-icons/io5'
import { assets } from '../assets/assets'

const Hero = () => {
  const cityList = ['Phnom Penh','Seam Reap']
  const [pickupLocation,setPickupLocation] = useState('')

  return (
    <div className='h-screen flex flex-col items-center justify-center gap-14 text-center'>

      <h1 className='text-2xl md:text-3xl font-semibold'>Find & Rent Your Next Ride in Minutes</h1>

      <form action="" className='flex flex-col md:flex-row items-start md:items-center
        justify-between p-5 rounded-lg md:rounded-full w-full max-w-80 md:max-w-190
        bg-white shadow-[0px_8px_20px_rgba(0,0,0,0.1)]'>
            
            <div className='flex flex-col md:flex-row items-start md:items-center gap-10 min-md:ml-8'>
                <div className='flex flex-col text-start gap-2'>
                    <select name="" id="" required value={pickupLocation} onChange={(e)=>setPickupLocation(e.target.value)}>
                        <option value="">Pickup Location</option>
                        {cityList.map((city)=><option key={city} value={city}>{city}</option>)}
                    </select>

                    <p className='px-1 text-sm text-gray-500'>{pickupLocation ? pickupLocation : 'Please select location'}</p>
                </div>
                
                <div className='flex flex-col text-start gap-2'>
                    <label htmlFor="pickup-date">Pick-up Date</label>
                    <input type="date" id='pickup-date' min={new Date().toISOString().split('T')[0]} className='text-sm text-gray-500' required/>
                </div>

                <div className='flex flex-col text-start gap-2'>
                    <label htmlFor="return-date">Return Date</label>
                    <input type="date" id='return-date' className='text-sm text-gray-500' required/>
                </div>

            </div>
                <button className='flex items-center justify-center gap-1 px-9 py-3 max-sm:mt-4 bg-black hover:bg-gray-800 text-white rounded-full cursor-pointer'>
                    <IoSearch />
                    Search
                </button>
        </form>

        <img src={assets.main_car} alt="car" className='max-h-64' />


    </div>
  )
}

export default Hero
