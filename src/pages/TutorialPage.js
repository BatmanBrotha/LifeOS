import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// Custom hook for Lucide icons
const useLucide = (...dependencies) => {
  useEffect(() => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies]);
};

// The script for our tutorial conversation
const tutorialScript = [
  { type: 'bot', text: 'Welcome to the app! I am here to guide you.' },
  { type: 'bot', text: 'This app helps you organize your life into categories. You can create notes, tasks, and track your progress for each one.' },
  { type: 'user-choice', options: ['How do I create a category?', 'What can I do inside a category?'] },
  // Branch for "How do I create a category?"
  { 
    type: 'bot', 
    text: 'Great question! You can use the AI Assistant. Click the robot icon in the top-right corner to open the chat.',
    branch: 'create' 
  },
  { 
    type: 'bot', 
    text: 'Just type in a topic like "Fitness" or "Learn React", and I will generate a list of relevant categories for you to choose from.',
    branch: 'create' 
  },
  // Branch for "What can I do inside a category?"
  { 
    type: 'bot', 
    text: 'Once you click on a category, you will land on its dedicated page. There, you will find a notepad to write down your thoughts.',
    branch: 'inside'
  },
  { 
    type: 'bot', 
    text: 'You will also see a "+" button in the bottom-right corner. Clicking it will open a menu to add new elements like tasks or progress bars to your page.',
    branch: 'inside'
  },
  // Common ending
  { type: 'bot', text: 'Feel free to explore and organize your life. Enjoy using the app!' },
  { type: 'end' }
];

const TutorialPage = () => {
  const [conversation, setConversation] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showChoices, setShowChoices] = useState(false);
  const messagesEndRef = useRef(null);

  useLucide(conversation);

  useEffect(() => {
    const processStep = () => {
      if (currentStep >= tutorialScript.length) return;

      const step = tutorialScript[currentStep];

      if (step.type === 'bot') {
        setTimeout(() => {
          setConversation(prev => [...prev, step]);
          setCurrentStep(prev => prev + 1);
        }, 800);
      } else if (step.type === 'user-choice') {
        setTimeout(() => {
          setShowChoices(true);
        }, 800);
      } else if (step.type === 'end') {
        // End of tutorial
      }
    };

    processStep();
  }, [currentStep]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const handleChoice = (choiceText) => {
    const userMessage = { type: 'user', text: choiceText };
    setConversation(prev => [...prev, userMessage]);
    setShowChoices(false);

    // Find the next step based on the choice
    if (choiceText.includes('create')) {
      setCurrentStep(tutorialScript.findIndex(step => step.branch === 'create'));
    } else {
      setCurrentStep(tutorialScript.findIndex(step => step.branch === 'inside'));
    }
  };

  return (
    <div className="flex-1 bg-white p-6 flex flex-col h-screen">
      <header className="mb-4">
        <Link to="/" className="text-blue-500 hover:underline flex items-center gap-2 mb-2">
          <i data-lucide="arrow-left"></i>
          Skip Tutorial & Go to App
        </Link>
        <h1 className="text-3xl font-bold">App Tutorial</h1>
      </header>
      
      <div className="flex-1 overflow-y-auto pr-4 space-y-6">
        {conversation.map((msg, index) => (
          <div 
            key={index} 
            className={`flex items-start gap-3 animate-fade-in-up ${msg.type === 'user' ? 'justify-end' : ''}`}
          >
            {msg.type === 'bot' && (
              <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                <i data-lucide="bot" className="w-6 h-6"></i>
              </div>
            )}
            <div className={`p-3 rounded-lg max-w-md ${msg.type === 'bot' ? 'bg-gray-100' : 'bg-blue-500 text-white'}`}>
              <p className="text-sm">{msg.text}</p>
            </div>
            {msg.type === 'user' && (
              <div className="w-10 h-10 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                <i data-lucide="user" className="w-6 h-6"></i>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {showChoices && (
        <div className="py-4 flex flex-col sm:flex-row gap-3 justify-center animate-fade-in-up">
          {tutorialScript[currentStep].options.map((option, i) => (
            <button
              key={i}
              onClick={() => handleChoice(option)}
              className="bg-white border border-blue-500 text-blue-500 px-4 py-2 rounded-full hover:bg-blue-50 transition-colors"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TutorialPage;
