import React, { useState, useRef } from 'react';

const CATALOG_API_URL = import.meta.env.VITE_CATALOG_API_URL;
const API_URL = CATALOG_API_URL;

const CSVImportModal = ({ 
  isOpen, 
  onClose, 
  title = "Import products by CSV", 
  buttonText = "Upload and preview", 
  type = "products",
  onImportSuccess
}) => {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDownloadSample = () => {
    let csvContent = "";
    let fileName = "";

    if (type === "customers") {
      csvContent = "Name,Email,Phone Number,Profile Image URL\nJane Doe,jane.doe@example.com,+919876543210,\nJohn Smith,john.smith@example.com,+918888888888,";
      fileName = "customers_sample.csv";
    } else {
      csvContent = "Name,Description,Brand Name,SKU,Actual Price,Selling Price,Stock,Weight,Tags\nSample Wireless Headphones,Premium high-fidelity audio,BrandX,SKU-HEAD-01,2000,1500,50,300g,audio\\,electronics\nSample Smart Watch,Fitness tracking and notifications,BrandY,SKU-WATCH-02,5000,3999,30,150g,watch\\,wearables";
      fileName = "products_sample.csv";
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please select a valid CSV file');
      return;
    }

    setError('');
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split(/\r?\n/);
        if (lines.length < 2) {
          setError('CSV file is empty or missing headers');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const data = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          // Simple comma splitter that handles backslash escaped commas
          const values = line.split(/(?<!\\),/).map(v => v.trim().replace(/\\,/g, ','));
          
          if (type === "customers") {
            // Expected headers: Name, Email, Phone Number, Profile Image URL
            const nameIdx = headers.indexOf('name');
            const emailIdx = headers.indexOf('email');
            const phoneIdx = headers.indexOf('phone number') !== -1 ? headers.indexOf('phone number') : headers.indexOf('number');
            const imageIdx = headers.indexOf('profile image url') !== -1 ? headers.indexOf('profile image url') : headers.indexOf('image');

            const name = nameIdx !== -1 ? values[nameIdx] : '';
            const email = emailIdx !== -1 ? values[emailIdx] : '';
            const number = phoneIdx !== -1 ? values[phoneIdx] : '';
            const image = imageIdx !== -1 ? values[imageIdx] : '';

            if (name && email && number) {
              data.push({ name, email, number, image });
            }
          } else {
            // Expected headers: Name, Description, Brand Name, SKU, Actual Price, Selling Price, Stock, Weight, Tags
            const name = values[headers.indexOf('name')] || '';
            const description = values[headers.indexOf('description')] || '';
            const brandName = values[headers.indexOf('brand name')] || '';
            const sku = values[headers.indexOf('sku')] || '';
            const actualPrice = Number(values[headers.indexOf('actual price')]) || 0;
            const sellingPrice = Number(values[headers.indexOf('selling price')]) || 0;
            const stock = Number(values[headers.indexOf('stock')]) || 0;
            const weight = values[headers.indexOf('weight')] || '';
            const tags = values[headers.indexOf('tags')] ? values[headers.indexOf('tags')].split(';').map(t => t.trim()).filter(Boolean) : [];

            if (name && actualPrice && sellingPrice) {
              data.push({ name, description, brandName, sku, actualPrice, sellingPrice, stock, weight, tags });
            }
          }
        }

        if (data.length === 0) {
          setError('No valid rows found in CSV');
        } else {
          setParsedData(data);
        }
      } catch (err) {
        console.error(err);
        setError('Error parsing CSV file');
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleUpload = async () => {
    if (parsedData.length === 0) return;

    setUploading(true);
    setError('');

    try {
      const token = localStorage.getItem('merchantToken');
      const storeId = localStorage.getItem('activeStoreId') || '';

      if (type === "customers") {
        const res = await fetch(`${API_URL}/customers/import`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}`,
            'x-store-id': storeId
          },
          body: JSON.stringify({ customers: parsedData })
        });
        const resData = await res.json();
        if (res.ok) {
          if (onImportSuccess) onImportSuccess();
          onClose();
        } else {
          setError(resData.message || 'Failed to import customers');
        }
      } else {
        // Fallback or generic placeholder import for products
        setError('Product import backend integration not implemented yet.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during upload');
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const fileInput = fileInputRef.current;
      if (fileInput) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(droppedFile);
        fileInput.files = dataTransfer.files;
        handleFileChange({ target: fileInput });
      }
    }
  };

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
        <div className="p-8 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-xl p-12 flex flex-col items-center justify-center bg-[#fbfcff] group hover:border-black/20 hover:bg-black/[0.01] transition-all cursor-pointer"
          >
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv" 
            />
            <div className="flex flex-col items-center cursor-pointer">
              <div className="bg-white px-4 py-2 rounded-lg border border-gray-300 shadow-sm text-sm font-bold text-[#202223] flex items-center gap-2 hover:bg-gray-50 transition-all active:scale-95">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                {file ? 'Change file' : 'Select CSV file'}
              </div>
              <p className="mt-3 text-xs text-gray-400">
                {file ? `Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)` : 'Accepts only .csv files'}
              </p>
              {parsedData.length > 0 && (
                <p className="mt-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  Valid rows parsed: {parsedData.length}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
          <button 
            onClick={handleDownloadSample}
            type="button" 
            className="text-xs font-bold text-[#005bd3] hover:underline flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download sample format
          </button>
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              type="button"
              className="px-4 py-2 text-sm font-bold text-[#202223] hover:bg-gray-100 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleUpload}
              disabled={parsedData.length === 0 || uploading}
              type="button"
              className={`px-5 py-2 text-sm font-bold text-white rounded-lg transition-all flex items-center gap-2 ${
                parsedData.length === 0 || uploading
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-[#1a1c23] hover:bg-black active:scale-95 shadow-md'
              }`}
            >
              {uploading && (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSVImportModal;
