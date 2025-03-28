import { useRef, useState } from 'react'
import './App.css'
import { GoogleGenAI } from "@google/genai";

function App() {
  interface Message {
    msg: string;
    type: string;
  } 
  const [messages,setmessages] = useState<Message[]>([])
  const chatref = useRef<HTMLInputElement>(null)
  const ai = new GoogleGenAI({ apiKey: "AIzaSyAUOMKTtMI6zeHTnoK9xj0WGK6JUSgxIC4" });

  async function sendreq(message : string){
    const conversationHistory = messages.map(m => m.msg).join("\n");
    const personality = "Talk like a Delhi guy who uses a lot of Hindi slang. Keep responses short, casual, and conversational. Write in English but use Hindi words in slang style. Don't mention that you're from Delhi!"
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: personality + "\n" + conversationHistory + "\n" + message,
    });
    setmessages((e) => [...e, { msg: response.text ?? '', type: "#ffffff" }])

  }

  function MainPage(){
    return(
      <div>
        <div className='h-[90vh] bg-blue-200'>
          <ul>
            {
              messages.map((message,index) => (
                <li className='border rounded' style={{backgroundColor:message.type}} key={index}>{message.msg}</li>
              ))
            }
          </ul>
        </div>
        <div className=' bg-red-300 h-[10vh]'>
          <input ref={chatref} type="text" placeholder='Write Your Prompt' />
          <button onClick={() => {
            const message = chatref.current?.value;
            if (!message) return alert("enter a vaild message ");
            else{
              setmessages((e) => [...e, { msg: message, type: "red" }])
              
              sendreq(message)
            }
          }} className='bg-black text-white'>Submit</button>
        </div>
      </div>
    )
  }

  return <MainPage/>
}

export default App
