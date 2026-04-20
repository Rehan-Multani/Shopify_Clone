import React from 'react';

const CSVImportModal = ({ isOpen, onClose, title = "Import products by CSV", buttonText = "Upload and preview" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#202223]">{title}</h2>
            <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-8">
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 flex flex-col items-center justify-center bg-[#fbfcff] group hover:border-black/20 hover:bg-black/[0.01] transition-all cursor-pointer">
            <input type="file" className="hidden" id="csv-upload" accept=".csv" />
            <label htmlFor="csv-upload" className="flex flex-col items-center cursor-pointer">
              <div className="bg-white px-4 py-1.5 rounded-lg border border-gray-300 shadow-sm text-sm font-bold text-[#202223] flex items-center gap-2 hover:bg-gray-50 transition-all active:scale-95">
                Add files
              </div>
              <p className="mt-3 text-sm text-gray-500">Accepts .csv</p>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
          <button className="text-sm font-medium text-[#005bd3] hover:underline">
            Download a sample CSV
          </button>
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-[#202223] hover:bg-gray-100 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button 
              disabled
              className="px-4 py-2 text-sm font-bold text-white bg-[#d1d1d1] rounded-lg cursor-not-allowed transition-all"
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSVImportModal;
