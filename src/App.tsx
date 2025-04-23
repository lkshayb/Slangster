import { useRef, useState ,useEffect} from 'react'
import './App.css'
import { GoogleGenAI } from "@google/genai";
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const prompt = import.meta.env.VITE_PROMPT

function App() {
  interface Message { 
    msg: string;
    type: string;
  } 
  const [messages,setmessages] = useState<Message[]>([])
  const chatref = useRef<HTMLInputElement>(null)
  const ai = new GoogleGenAI({ apiKey: apiKey });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => (messagesEndRef.current as HTMLDivElement).scrollIntoView({ behavior: 'smooth' }), [messages]);

  async function sendreq(message : string){
    const conversationHistory = messages.map(m => m.msg).join("\n");
    const personality = prompt
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: personality + "\n" + conversationHistory + "\n" + message,
    });
    setmessages((e) => [...e, { msg: response.text ?? '', type: "#ffffff" }])

  }

  function MainPage(){
    const handleSubmit = () => {
      const message = chatref.current?.value;
      if (!message) return alert("Please enter a valid message");
      setmessages((e) => [...e, { msg: message, type: "red" }]);
      sendreq(message);
      if (chatref.current) chatref.current.value = '';
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    };

    function Header(){
      return <div className="bg-gradient-to-r from-orange-500 to-blue-500 p-4 shadow-lg">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          Slangster
        </h1>
        <p className="text-white/80 text-sm">Your Chat buddy</p>
      </div>
    </div>
    }

    function MainPart(){
      return <div className='flex-1 overflow-y-auto p-4 pb-24'>
      <div className="max-w-4xl mx-auto space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg">...Namaste...</p>
            <p className="text-sm">Start the conversation with your buddy!</p>
          </div>
        )}
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex ${message.type === "red" ? "justify-end" : "justify-start"}`}
          >
            <div 
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                message.type === "red" 
                  ? "bg-blue-500 text-white rounded-br-none" 
                  : "bg-white shadow-md rounded-bl-none"
              }`}
            >
              {message.msg}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>
    </div>
    }

    function Input(){
      return <div className='fixed bottom-0 w-full bg-white border-t border-gray-200 p-4 shadow-lg'>
      <div className='max-w-4xl mx-auto flex gap-3'>
        <input 
          ref={chatref} 
          type="text" 
          placeholder='Type your message...' 
          onKeyDown={handleKeyDown}
          className='flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all'
        />
        <button 
          onClick={handleSubmit} 
          className='px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2'
        >
          Send
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </div>
    </div>
    }

    return(
      <div className="h-screen flex flex-col bg-gradient-to-b from-orange-50 to-blue-50">
        <Header/>
        <MainPart/>
        <Input/>
      </div>
    )
  }

  return <MainPage/>
}

export default App
