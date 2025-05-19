import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import DateModal from '../Modal/DateModal';

interface ServiceCardProps {
  title: string;
  price: string;
  duration: string;
  description?: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ title, price, duration, description }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-lg">
      <div className="p-6 bg-gradient-to-r from-pink-100 to-pink-200">
        <h3 className="text-xl font-semibold text-pink-800 mb-2">{title}</h3>
        
        <div className="flex justify-between items-center mb-4">
          <p className="text-lg font-bold text-pink-700">{price}</p>
          <div className="flex items-center text-pink-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{duration}</span>
          </div>
        </div>
        
        {description && (
          <p className="text-pink-600 mb-4">{description}</p>
        )}
        
        <button 
          onClick={openModal}
          className="w-full py-2 px-4 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors duration-300 flex items-center justify-center"
        >
          <Calendar className="mr-2 h-5 w-5" />
          Agendar
        </button>
      </div>

      {isModalOpen && (
        <DateModal 
          isOpen={isModalOpen} 
          onClose={closeModal} 
          serviceName={title}
        />
      )}
    </div>
  );
};

export default ServiceCard;
