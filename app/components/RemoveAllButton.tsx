"use client";

import React, { useState } from 'react'

type RemoveAllButtonProps = {
  onRemoveAll: () => void;
}

export const RemoveAllButton = ({ onRemoveAll }: RemoveAllButtonProps) => {
  const [confirming, setConfirming] = useState(false);

  const handleClick = () => {
    if (confirming) {
      onRemoveAll();
      setConfirming(false);
    } else {
      setConfirming(true);
    }
  };

  return (
    <div className='flex-col sm:flex-row place-items-center my-4'>
        <button
            type="button"
            onClick={handleClick}
            className={`w-full mb-2 sm:mb-0 sm:w-auto sm:mr-4 px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-150 cursor-pointer
                ${confirming
                    ? 'bg-red-600 hover:bg-red-500 text-white'
                    : 'bg-transparent border border-red-700 text-red-400 hover:bg-red-700 hover:text-white'
                }`}
        >
            {confirming ? 'Are you sure?' : 'Remove all Pokémon'}
        </button>
        {confirming && (
            <button
                type="button"
                onClick={() => setConfirming(false)}
                className="w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-150 cursor-pointer bg-transparent border border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white"            
            >
                Cancel
            </button>
        )}
    </div>

  );
}