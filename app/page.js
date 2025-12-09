'use client';
import React, { useState, useEffect } from 'react';
import { MessageCircle, ArrowLeft } from 'lucide-react';

export default function ChatBot() {
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: 'Hello! I am PlotBot, your Q&A assistant. Please select a category below to get started.' }
  ]);
  const [currentMenuKey, setCurrentMenuKey] = useState('MAIN');
  const [mainMenu, setMainMenu] = useState({});
  const [subMenus, setSubMenus] = useState({});
  const [qaData, setQaData] = useState([]);
  const [loading, setLoading] = useState(true);

  const csvData = [
    { subject: "Legal & Financing Questions", question: "What is the total all-inclusive cost for a plot, including stamp duty and registration?", answer: "Please contact our sales team for detailed pricing information including stamp duty and registration charges." },
    { subject: "Legal & Financing Questions", question: "Is the land clear of all encumbrances and litigation?", answer: "Yes, all our plots are free from encumbrances and litigation. We provide clear title documents." },
    { subject: "Legal & Financing Questions", question: "Can I see a copy of the Approved Layout Plan?", answer: "Yes, the approved layout plan is available for review at our sales office." },
    { subject: "Legal & Financing Questions", question: "What documents will I receive immediately upon booking?", answer: "Upon booking, you will receive: Allotment Letter, Payment Receipt, and Booking Agreement." },
    { subject: "Legal & Financing Questions", question: "What are the permissible FSI (Floor Space Index) for these plots?", answer: "The FSI varies by plot size and location. Please consult with our team for specific FSI details for your chosen plot." },
    { subject: "Legal & Financing Questions", question: "What is the penalty for delayed payment installments?", answer: "Delayed payments attract a penalty of 18% per annum. Please refer to your agreement for complete terms." },
    { subject: "General Project & Amenities", question: "Is there provision for underground electrical wiring and drainage?", answer: "Yes, the project features underground electrical wiring and a modern drainage system." },
    { subject: "General Project & Amenities", question: "What is the source of water supply for the project?", answer: "Water supply is provided through borewell and municipal water connection with overhead tanks." },
    { subject: "General Project & Amenities", question: "What is the width of the internal roads in the layout?", answer: "Internal roads range from 30 feet to 40 feet in width, ensuring easy vehicle movement." },
    { subject: "General Project & Amenities", question: "Is there 24/7 security or CCTV surveillance?", answer: "Yes, the project has 24/7 security personnel and CCTV surveillance at all entry/exit points." },
    { subject: "General Project & Amenities", question: "Are there any common amenities like a park or clubhouse?", answer: "Yes, the layout includes a children's park, landscaped gardens, and a community hall." },
    { subject: "General Project & Amenities", question: "What are the annual maintenance charges?", answer: "Annual maintenance charges are approximately ₹2-3 per sq.ft. Details will be provided in your agreement." },
    { subject: "General Project & Amenities", question: "Are the plots Vastu-compliant?", answer: "Yes, all plots are designed with Vastu principles in mind, with proper orientation and directions." },
    { subject: "General Project & Amenities", question: "What is the proximity to the nearest school or hospital?", answer: "The nearest school is 2 km away and hospital is 3 km away. Multiple educational and healthcare facilities are nearby." },
    { subject: "General Project & Amenities", question: "When will the infrastructure (roads, water, electricity) be fully completed?", answer: "All basic infrastructure will be completed within 6 months from the project launch date." }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const mainMenuData = {};
    const subMenusData = {};
    
    const grouped = csvData.reduce((acc, row) => {
      if (!acc[row.subject]) acc[row.subject] = [];
      acc[row.subject].push(row);
      return acc;
    }, {});

    let mainIndex = 1;
    Object.keys(grouped).forEach(subject => {
      mainMenuData[mainIndex] = subject;
      const subMenu = {};
      grouped[subject].forEach((item, idx) => {
        subMenu[idx + 1] = item.question;
      });
      subMenusData[subject] = subMenu;
      mainIndex++;
    });

    setMainMenu(mainMenuData);
    setSubMenus(subMenusData);
    setQaData(csvData);
    setLoading(false);
  };

  const getAnswer = (question) => {
    const answer = qaData.find(item => item.question === question);
    return answer ? answer.answer : "I'm sorry, I could not find a specific answer for that question.";
  };

  const handleSelection = (value) => {
    if (Object.values(mainMenu).includes(value)) {
      setCurrentMenuKey(value);
    } else {
      setChatHistory(prev => [
        ...prev,
        { role: 'assistant', content: `**Question:** ${value}` },
        { role: 'assistant', content: `**Answer:** ${getAnswer(value)}` },
        { role: 'assistant', content: '✅ Got it! Ready for your next question.' }
      ]);
      setCurrentMenuKey('MAIN');
    }
  };

  const MenuButtons = ({ menu }) => {
    const entries = Object.entries(menu);
    return (
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">Choose an Option:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {entries.map(([key, value]) => (
            <button
              key={`${currentMenuKey}-${key}`}
              onClick={() => handleSelection(value)}
              className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 font-medium text-left"
            >
              {value}
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-green-400 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <div className="max-w-5xl mx-auto p-4">
        <div className="flex items-center gap-3 mb-6 py-4">
          <MessageCircle className="text-green-500" size={32} />
          <h1 className="text-3xl font-bold text-white">Plot Q&A Bot 🏡</h1>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6 min-h-[400px] max-h-[500px] overflow-y-auto">
          {chatHistory.map((message, index) => (
            <div key={index} className="mb-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={18} />
                </div>
                <div className="flex-1 bg-gray-700 rounded-lg p-4">
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: message.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n/g, '<br/>')
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          {currentMenuKey === 'MAIN' ? (
            <MenuButtons menu={mainMenu} />
          ) : (
            <>
              <button
                onClick={() => setCurrentMenuKey('MAIN')}
                className="mb-4 flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
                Go Back to Main Menu
              </button>
              <MenuButtons menu={subMenus[currentMenuKey] || {}} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}