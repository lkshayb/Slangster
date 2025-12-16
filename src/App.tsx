import { useRef, useState ,useEffect} from 'react'
import Markdown from 'react-markdown';
import {ImageUp, Send, X} from 'lucide-react';
import './App.css'
import { GoogleGenAI } from "@google/genai";
import { SyncLoader } from 'react-spinners';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const prompt = import.meta.env.VITE_PROMPT

function App() {

  interface Message { 
    msg: string;
    type: string;
  } 

  const [messages,setmessages] = useState<Message[]>([])
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isload,setisload] = useState(false);
  const chatref = useRef<HTMLInputElement>(null)
  const ai = new GoogleGenAI({ apiKey: apiKey });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => (messagesEndRef.current as HTMLDivElement).scrollIntoView({ behavior: 'smooth' }), [messages]);

  useEffect(() => {
    const len = messages.length;
    if(len > 0){
      if(messages[len-1]["type"] == "red") setisload(true)
      if(messages[len-1]["type"] == "#ffffff") setisload(false)
    }
  },[messages])

  async function sendreq(message : string,selectedImage:any){
    if(selectedImage && message){
      const base64 = await convertToBase64(selectedImage);
      const conversationHistory = messages.map(m => m.msg).join("\n");
      const personality = prompt
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          {
            role:"model",
            text: `${personality}\n${conversationHistory}`
          },
          {
            role:"user",
            parts : [
              {
                text : message
              },
              {
                inlineData : {
                  mimeType : selectedImage.type,
                  data : base64,
                }
              }
            ]
            
          }
        ] as any ,
      });
      const content = response.text;

      setmessages((e) => [...e, { msg: content ?? ' ', type: "#ffffff" }])
    }

    else if(selectedImage){
      const base64 = await convertToBase64(selectedImage);
      const conversationHistory = messages.map(m => m.msg).join("\n");
      const personality = prompt
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: [
            {
              role:"model",
              text: `${personality}\n${conversationHistory}`
            },
            {
              role:"user",
              parts : [
                {
                  inlineData : {
                    mimeType : selectedImage.type,
                    data : base64,
                  }
                }
              ]
              
            }
          ] as any ,
        });
        const content = response.text;
        setmessages((e) => [...e, { msg: content ?? ' ', type: "#ffffff" }])
      }catch (err:any){
        if(err.status === 404){
          setisload(false);
          alert("Server is Overloaded , Please try Later")
        }
      }
      
      
    }
    else{
      const conversationHistory = messages.map(m => m.msg).join("\n");
      const personality = prompt
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents :  [
          {
            role:"model",
            text: `${personality}\n${conversationHistory}`
          },
          {
            role:"user",
            text: `${message}`
          }
        ]
      });
      const content = response.text;

      setmessages((e) => [...e, { msg: content ?? ' ', type: "#ffffff" }])
    }
    

  }

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };

      reader.onerror = () => {
        reject(new Error("Failed to convert blob to base64"));
      };

      reader.readAsDataURL(file);
    });
  };
  function MainPage(){
    const handleSubmit = () => {
      const message = chatref.current?.value;
      if (!message && !selectedImage) {
        alert("Please enter a valid message");
        return;
      }
      setmessages((e) => [...e, { msg: message || "[image sent]", type: "red" }]);
      sendreq(message || "",selectedImage);
      if (chatref.current) chatref.current.value = '';
      setSelectedImage(null);
    };

    const SendOnEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    };

    function Header(){
      return <div className="sticky top-0 z-50 bg-gradient-to-r from-[#c94b4b] to-[#4b134f] p-4 shadow-lg animate-gradient">
      <div className="max-w-4xl mx-auto" >
        <h1 className="text-3xl font-bold text-white flex items-center gap-2 cursor-pointerx ">
          <a href="/">Slangster</a>
        </h1>
        <p className="text-white/80 text-sm">Your Chat buddy</p>
      </div>
    </div>
    }

    function MainPart(){
      function shiftenter(e: React.KeyboardEvent<HTMLInputElement>){
        if (e.shiftKey && e.code === 'Enter') {
          e.preventDefault();
          if (chatref.current) {
            chatref.current.focus();
          }
        } 
      }
      return <div className=' p-4 pb-24 ' tabIndex={0} onKeyDown={shiftenter}>
        <div className="max-w-4xl mx-auto space-y-4 flex-1 overflow-y-auto scrollbar-hide">
        
        {messages.length === 0 && (
          <div className='flex justify-center items-center h-[66vh] w-full'>
            <div className="text-center ">
              <p className="text-3xl font-semibold  font-black font-sans">Hi! I'm Slangster</p>
              <p className="text-lg text-gray-500 font-medium  font-black font-sans">I can chat in Hinglish, crack jokes, and more!</p>
            </div>
          </div>
          
        )}

        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.type === "red" ? "justify-end" : "justify-start"}`}>
            <div className={` rounded-2xl px-4 py-2 ${message.type === "red" ? "bg-blue-500 text-white rounded-br-none shadow-md shadow-blue-500" : "bg-white  rounded-bl-none"}`}>
              {message.type === "red" ? message.msg : <Markdown>{message.msg}</Markdown>}
            </div>
          </div>
        ))}
        {isload ? (<div className='mt-[50px]'>
          <SyncLoader
            color="#ef1d6a"
            margin={3}
            size={10}
            speedMultiplier={0.3}
          />
        </div>) : null}
       
      </div>
       <div className="mt-[50px]" ref={messagesEndRef}></div>
    </div>
    }

    function Input(){
      const handleImageChange = (e:any) =>  {if(e.target.files?.[0]) setSelectedImage(e.target.files?.[0])}
    
      return <div className='fixed bottom-0 w-full bg-white border-t border-gray-200 p-4 shadow-lg duration-300'>
        
      <div className='max-w-4xl mx-auto flex gap-3  items-center'>
        
        <input ref={chatref} type="text" placeholder='Type your message' onKeyDown={SendOnEnter} className='flex-1 px-4 py-2 rounded-xl outline-none   transition-all bg-black/10 placeholder-gray-400  text-gray-600 text-thin  text-md'/>
        <button onClick={handleSubmit} disabled={isload} className={` group ${isload ? "cursor-not-allowed" : "cursor-pointer"} px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 shadow-lg shadow-blue-500/50 `}>
          <span className='sm:block hidden'>Send</span>
          <Send className='h-5 w-5 group-hover:rotate-[20deg] duration-500 '/>
        </button> 

        {selectedImage && (
          <div className='group relative w-[50px] h-[50px]  duration-300 transition-all cursor-pointer'>
            <img src={URL.createObjectURL(selectedImage)} className='w-full h-full object-cover rounded-md' />
 
            <div onClick={() => setSelectedImage(null)} className="group-hover:flex hidden absolute inset-0 bg-red-600/80 items-center justify-center rounded-md duration-300">
              <X className='text-white'/>
            </div>
          </div>
          
        )}
        <label  htmlFor="file-upload">
          <ImageUp className='cursor-pointer h-7 mr-5 w-7 text-gray-500 hover:text-blue-600 items-center'/>
        </label>
        <input accept="image/*" id="file-upload" onChange={handleImageChange} type="file" className="hidden" />
      </div>
    </div>
    }

    return(
      <div className="h-full min-h-screen flex flex-col bg-gradient-to-b from-orange-50 to-blue-50">
        <Header/>
        <MainPart/>
        <Input/>
      </div>
    )
  }

  return <MainPage/>
}

export default App
