'use client';

import { useState, useRef, useEffect } from 'react';

interface User {
  uid: string;
  username: string;
  aura: number;
}

interface AutocompleteProps {
  items: User[];
  selectedItem?: string;
  onSelect: (item: User) => void;
  onSearch: (query: string) => void;
}

export default function Autocomplete({ 
  items, 
  selectedItem, 
  onSelect, 
  onSearch 
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && listRef.current) {
      const highlighted = listRef.current.querySelector('[data-highlighted=true]');
      if (highlighted) {
        highlighted.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(i => 
          i < items.length - 1 ? i + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(i => 
          i > 0 ? i - 1 : items.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (items[highlightedIndex]) {
          onSelect(items[highlightedIndex]);
          setIsOpen(false);
          setQuery(items[highlightedIndex].username);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
    setIsOpen(true);
    setHighlightedIndex(0);
  };

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="block w-full pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
          placeholder="Search by username..."
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="users-listbox"
          aria-autocomplete="list"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              onSearch('');
              inputRef.current?.focus();
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 transition-colors"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {isOpen && (
        <div 
          ref={listRef}
          className="absolute z-10 mt-1 w-full max-h-[300px] overflow-auto bg-white border border-gray-200 rounded-md shadow-lg"
          role="listbox"
          id="users-listbox"
        >
          {items.length > 0 ? (
            items.map((item, index) => (
              <div
                key={item.uid}
                role="option"
                aria-selected={selectedItem === item.uid}
                data-highlighted={index === highlightedIndex}
                className={`px-4 py-3 cursor-pointer transition-colors ${
                  index === highlightedIndex ? 'bg-indigo-50' : 'hover:bg-gray-50'
                } ${selectedItem === item.uid ? 'bg-indigo-50' : ''}`}
                onClick={() => {
                  onSelect(item);
                  setIsOpen(false);
                  setQuery(item.username);
                }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{item.username}</span>
                    {selectedItem === item.uid && (
                      <span className="text-xs text-indigo-600">Selected</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      Current Aura:
                    </span>
                    <span className={`font-medium ${
                      item.aura > 0 ? 'text-green-600' : 
                      item.aura < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {item.aura}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-8 text-center">
              <svg 
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                />
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
                />
              </svg>
              <p className="mt-4 text-sm text-gray-500">
                No users found matching "{query}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 