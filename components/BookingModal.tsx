import React, { useState } from 'react';
import { X, Calendar, Clock, FileText, Check, Loader2 } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  serviceTitle: string;
  price: number;
  onClose: () => void;
  onConfirm: (date: string, time: string, notes: string) => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, serviceTitle, price, onClose, onConfirm }) => {
  const [step, setStep] = useState<'DETAILS' | 'REVIEW' | 'SUCCESS'>('DETAILS');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 'DETAILS' && date && time) {
      setStep('REVIEW');
    } else if (step === 'REVIEW') {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
        setStep('SUCCESS');
        setTimeout(() => {
          onConfirm(date, time, notes);
          // Reset for next time
          setStep('DETAILS');
          setDate('');
          setTime('');
          setNotes('');
        }, 1500);
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {step === 'DETAILS' && 'Book Service'}
            {step === 'REVIEW' && 'Confirm Booking'}
            {step === 'SUCCESS' && 'Booking Confirmed'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          
          {/* Step 1: Details */}
          {step === 'DETAILS' && (
            <div className="space-y-4">
              <div className="bg-rose-50 p-4 rounded-xl mb-4">
                 <h3 className="font-semibold text-rose-900">{serviceTitle}</h3>
                 <p className="text-rose-700 text-sm">Est. Total: ${price}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <div className="relative">
                  <input 
                    type="date" 
                    required
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 outline-none"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                  />
                  <Calendar size={18} className="absolute left-3 top-2.5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <div className="relative">
                  <input 
                    type="time" 
                    required
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 outline-none"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                  />
                  <Clock size={18} className="absolute left-3 top-2.5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
                <div className="relative">
                  <textarea 
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 outline-none resize-none"
                    rows={3}
                    placeholder="Allergies, preferences, etc..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />
                  <FileText size={18} className="absolute left-3 top-2.5 text-gray-400" />
                </div>
              </div>

              <button 
                onClick={handleNext}
                disabled={!date || !time}
                className="w-full mt-2 bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Review Booking
              </button>
            </div>
          )}

          {/* Step 2: Review */}
          {step === 'REVIEW' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500">Service</span>
                  <span className="font-medium text-right">{serviceTitle}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500">Date</span>
                  <span className="font-medium">{date}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500">Time</span>
                  <span className="font-medium">{time}</span>
                </div>
                 <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500">Price</span>
                  <span className="font-medium">${price}</span>
                </div>
                {notes && (
                  <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 italic">
                    "{notes}"
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setStep('DETAILS')}
                  className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button 
                  onClick={handleNext}
                  disabled={loading}
                  className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-xl transition-colors flex justify-center items-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'Confirm'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 'SUCCESS' && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                <Check size={32} strokeWidth={3} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
              <p className="text-gray-500">Your service has been successfully scheduled.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default BookingModal;