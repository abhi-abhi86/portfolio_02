import React, { useState, useEffect } from 'react';

interface TypewriterProps {
  words: string[];
  delay?: number;
  infinite?: boolean;
}

const Typewriter: React.FC<TypewriterProps> = ({ words, delay = 100, infinite = true }) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(delay);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const handleTyping = () => {
      const i = loopNum % words.length;
      const fullText = words[i];

      setCurrentText(isDeleting 
        ? fullText.substring(0, currentText.length - 1) 
        : fullText.substring(0, currentText.length + 1)
      );

      setTypingSpeed(isDeleting ? delay / 2 : delay);

      if (!isDeleting && currentText === fullText) {
        timer = setTimeout(() => setIsDeleting(true), 1500); // Pause at end
      } else if (isDeleting && currentText === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      } else {
        timer = setTimeout(handleTyping, typingSpeed);
      }
    };

    timer = setTimeout(handleTyping, typingSpeed);

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, loopNum, words, delay, typingSpeed]);

  return (
    <span className="border-r-2 border-brand-accent animate-pulse pr-1">
      {currentText}
    </span>
  );
};

export default Typewriter;