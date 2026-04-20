import React from 'react';

const FilesTab = () => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-[#202223]">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h14a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <h1 className="text-xl font-bold">Files</h1>
                </div>
                <button className="px-3 py-1.5 bg-[#1a1c23] border border-[#1a1c23] rounded-lg text-sm font-semibold text-white hover:bg-black transition-all shadow-sm active:scale-95">
                    Upload files
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px] flex flex-col items-center justify-center p-8 text-center gap-4">
                <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-2">
                     <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                </div>
                <h2 className="text-lg font-bold text-[#202223]">Upload and manage your files</h2>
                <p className="text-sm text-[#5c5f62] max-w-sm">
                    Keep all your product images, videos, and documents in one place to easily share across your store.
                </p>
                <div className="pt-4">
                    <button className="bg-[#1a1c23] text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-black transition-all shadow-sm active:scale-95">
                        Upload files
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FilesTab;
