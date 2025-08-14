import React from 'react';
import './RichTextDisplay.css';

const RichTextDisplay = ({ content, className = '' }) => {
    if (!content) {
        return null;
    }

    // Sanitize HTML content - In a real app, use DOMPurify
    const createMarkup = () => {
        return { __html: content };
    };

    return (
        <div 
            className={`rich-text-display ${className}`}
            dangerouslySetInnerHTML={createMarkup()}
        />
    );
};

export default RichTextDisplay;