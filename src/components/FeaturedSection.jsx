import React from 'react'
import Title from './Title'
import CarCard from "./vehicles/CarCard";


const FeaturedSection = () => {
  return (
    <div className='flex flex-col items-center py-24 px-6 md:px-16 lg:px-24 xl:px-32'>
      <div>
        <Title
            title="Featured Vehicles"
            subTitle="Explore our selection o premium vehicles available for your next adventure."
        />
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-18'>
        <div>
            <CarCard/>
        </div>
      </div>
    </div>
  )
}

export default FeaturedSection
