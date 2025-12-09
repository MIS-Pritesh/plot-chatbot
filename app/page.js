import React, { useState, useEffect } from 'react';
import { MessageCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function ChatBot() {
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: 'Hello! I am PlotBot, your Q&A assistant. Please select a category below to get started.' }
  ]);
  const [currentMenuKey, setCurrentMenuKey] = useState('MAIN');
  const [mainMenu, setMainMenu] = useState({});
  const [subMenus, setSubMenus] = useState({});
  const [qaData, setQaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // REPLACE THIS URL WITH YOUR GOOGLE SHEETS CSV EXPORT URL
  const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1MwjXNH6sx8sFsccv3krgpC5BhKfZ9GxnMLS590FZik4/export?format=csv&gid=0';

  useEffect(() => {
    loadDataFromGoogleSheets();
  }, []);

  const loadDataFromGoogleSheets = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(GOOGLE_SHEET_URL);
      
      if (!response.ok) {
        throw new Error('Failed to fetch data from Google Sheets');
      }
      
      const csvText = await response.text();
      const lines = csvText.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const parsedData = [];
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;
        
        const values = parseCSVLine(lines[i]);
        if (values.length >= 3) {
          parsedData.push({
            subject: values[0].trim(),
            question: values[1].trim(),
            answer: values[2].trim()
          });
        }
      }

      if (parsedData.length === 0) {
        throw new Error('No data found in Google Sheets');
      }

      processData(parsedData);
      
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data from Google Sheets. Please check the URL and sheet permissions.');
      setLoading(false);
    }
  };

  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    
    return result.map(item => item.replace(/^"|"$/g, ''));
  };

  const processData = (data) => {
    const mainMenuData = {};
    const subMenusData = {};
    
    const grouped = data.reduce((acc, row) => {
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
    setQaData(data);
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

  const handleRefresh = () => {
    setChatHistory([
      { role: 'assistant', content: 'Hello! I am PlotBot, your Q&A assistant. Please select a category below to get started.' }
    ]);
    setCurrentMenuKey('MAIN');
    loadDataFromGoogleSheets();
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
        <div className="text-green-400 text-xl flex items-center gap-3">
          <RefreshCw className="animate-spin" size={24} />
          Loading data from Google Sheets...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-red-900 border-l-4 border-red-500 text-red-100 p-6 rounded-lg max-w-2xl">
          <h3 className="text-xl font-bold mb-2">Error Loading Data</h3>
          <p className="mb-4">{error}</p>
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <div className="max-w-5xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6 py-4">
          <div className="flex items-center gap-3">
            <MessageCircle className="text-green-500" size={32} />
            <h1 className="text-3xl font-bold text-white">Plot Q&A Bot 🏡</h1>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            title="Refresh data from Google Sheets"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
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

        <div className="mt-4 text-center text-gray-500 text-sm">
          <p>💡 Data is loaded from Google Sheets. Click refresh to get latest updates.</p>
        </div>
      </div>
    </div>
  );
}
