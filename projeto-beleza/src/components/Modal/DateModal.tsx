import React, { useState, useEffect } from 'react';

interface DateModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName: string;
}

const DateModal: React.FC<DateModalProps> = ({ isOpen, onClose, serviceName }) => {
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  // Gerar datas disponíveis (hoje até 8 dias à frente)
  useEffect(() => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 8; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const formattedDate = date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      dates.push(formattedDate);
    }
    
    setAvailableDates(dates);
  }, []);
  
  // Horários disponíveis (exemplo)
  const availableTimes = [
    '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];
  
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };
  
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };
  
  const handleSchedule = () => {
    if (selectedDate && selectedTime) {
      alert(`Agendamento para ${serviceName} confirmado para ${selectedDate} às ${selectedTime}`);
      onClose();
    } else {
      alert('Por favor, selecione uma data e horário');
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-pink-700">Agendar {serviceName}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg font-medium text-pink-600 mb-2">Selecione uma data:</h3>
          <div className="grid grid-cols-1 gap-2">
            {availableDates.map((date, index) => (
              <button
                key={index}
                onClick={() => handleDateSelect(date)}
                className={`p-2 rounded-md border ${
                  selectedDate === date 
                    ? 'bg-pink-100 border-pink-500 text-pink-700' 
                    : 'border-gray-300 hover:border-pink-300 hover:bg-pink-50'
                }`}
              >
                {date}
              </button>
            ))}
          </div>
        </div>
        
        {selectedDate && (
          <div className="mb-4">
            <h3 className="text-lg font-medium text-pink-600 mb-2">Selecione um horário:</h3>
            <div className="grid grid-cols-4 gap-2">
              {availableTimes.map((time, index) => (
                <button
                  key={index}
                  onClick={() => handleTimeSelect(time)}
                  className={`p-2 rounded-md border ${
                    selectedTime === time 
                      ? 'bg-pink-100 border-pink-500 text-pink-700' 
                      : 'border-gray-300 hover:border-pink-300 hover:bg-pink-50'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <button
          onClick={handleSchedule}
          disabled={!selectedDate || !selectedTime}
          className={`w-full py-2 px-4 rounded-md transition-colors duration-300 ${
            selectedDate && selectedTime
              ? 'bg-pink-500 text-white hover:bg-pink-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Confirmar Agendamento
        </button>
      </div>
    </div>
  );
};

export default DateModal;
