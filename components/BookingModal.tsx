import React, { useState } from 'react';
import { X, Calendar, Clock, CheckCircle, ChevronRight, ArrowLeft, CreditCard } from 'lucide-react';
import { ServiceItem, Booking } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceItem | null;
  onConfirm: (bookingData: Omit<Booking, 'id' | 'status' | 'timestamp'>) => void;
}

type Step = 'FORM' | 'REVIEW' | 'SUCCESS';

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, service, onConfirm }) => {
  const [step, setStep] = useState<Step>('FORM');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen || !service) return null;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('REVIEW');
  };

  const handleConfirm = () => {
    onConfirm({
      serviceId: service.id,
      serviceTitle: service.title,
      providerName: service.providerName,
      date,
      time,
      notes,
      totalPrice: service.price,
    });
    setStep('SUCCESS');
  };

  const resetAndClose = () => {
    setStep('FORM');
    setDate('');
    setTime('');
    setNotes('');
    onClose();
  };

  if (step === 'SUCCESS') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-center p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
             <CheckCircle size={32} strokeWidth={3} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
          <p className="text-gray-500 mb-6">Your request for <span className="font-semibold text-gray-800">{service.title}</span> has been sent to the provider.</p>
          <button 
            onClick={resetAndClose}
            className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl transition-all"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {step === 'REVIEW' && (
                <button onClick={() => setStep('FORM')} className="p-1 hover:bg-gray-100 rounded-full -ml-2 mr-1">
                    <ArrowLeft size={20} className="text-gray-500" />
                </button>
            )}
            <h2 className="text-xl font-bold text-gray-900">
                {step === 'REVIEW' ? 'Review Booking' : 'Book Service'}
            </h2>
          </div>
          <button onClick={resetAndClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
            
            {/* Service Summary Small */}
            <div className="flex gap-4 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <img src={service.image} alt={service.title} className="w-16 h-16 rounded-lg object-cover" />
                <div>
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{service.title}</h3>
                    <p className="text-xs text-gray-500 mb-1">by {service.providerName}</p>
                    <p className="text-sm font-bold text-rose-500">${service.price} <span className="text-gray-400 font-normal">/ {service.priceUnit}</span></p>
                </div>
            </div>

            {step === 'FORM' ? (
                <form id="booking-form" onSubmit={handleNext} className="flex flex-col gap-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                            <Calendar size={16} className="text-gray-400"/> Date
                        </label>
                        <input 
                            required 
                            type="date" 
                            min={new Date().toISOString().split('T')[0]}
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition bg-gray-50"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                            <Clock size={16} className="text-gray-400"/> Preferred Time
                        </label>
                        <input 
                            required 
                            type="time" 
                            value={time}
                            onChange={e => setTime(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition bg-gray-50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Special Requests</label>
                        <textarea 
                            rows={3}
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition bg-gray-50 resize-none"
                            placeholder="Any allergies, preferences, or gate codes?"
                        />
                    </div>
                </form>
            ) : (
                <div className="space-y-4">
                    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Date</span>
                            <span className="font-medium text-gray-900">{new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Time</span>
                            <span className="font-medium text-gray-900">{time}</span>
                        </div>
                        {notes && (
                             <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Notes</span>
                                <span className="font-medium text-gray-900 text-right max-w-[60%] truncate">{notes}</span>
                            </div>
                        )}
                        <div className="h-px bg-gray-100 my-2"></div>
                        <div className="flex justify-between text-base font-bold">
                            <span className="text-gray-900">Total</span>
                            <span className="text-rose-500">${service.price}</span>
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 flex gap-3 items-start">
                        <CreditCard size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-yellow-800">
                            Payment will be charged to your room folio upon completion of the service.
                        </p>
                    </div>
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50">
            {step === 'FORM' ? (
                <button 
                    type="submit" 
                    form="booking-form"
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                    Continue <ChevronRight size={18} />
                </button>
            ) : (
                <button 
                    onClick={handleConfirm}
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-rose-200"
                >
                    Confirm Booking
                </button>
            )}
        </div>

      </div>
    </div>
  );
};

export default BookingModal;