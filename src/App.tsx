import { useRef, useState } from 'react'
import './App.css'
import { GoogleGenAI } from "@google/genai";

function App() {
  interface Message {
    msg: string;
    type: string;
  } 
  const [messages,setmessages] = useState<Message[]>([])

  const [mails,setmails] = useState<string[]>([])
  const [login,setlogin] = useState<boolean>(false)
  
  const mailref = useRef<HTMLInputElement>(null)
  const chatref = useRef<HTMLInputElement>(null)
  const ai = new GoogleGenAI({ apiKey: "AIzaSyAUOMKTtMI6zeHTnoK9xj0WGK6JUSgxIC4" });

  async function sendreq(message : string){
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: "Talk like a Delhi guy who uses a lot of Hindi slang. Keep responses short, casual, and conversational. Write in English but use Hindi words in slang style. Don't mention that you're from Delhi! "+message,
    });
    setmessages((e) => [...e, { msg: response.text ?? '', type: "#ffffff" }])

  }


  function LoginPage(){
    return(
      <div className='flex bg-blue-200 p-20 '>
        <input ref={mailref} type="text" placeholder='Email' />
        <button onClick={() => {
          const mailid = mailref.current?.value;
          if (!mailid) return alert("enter a vaild mail id ");
          else{
            setmails([...mails,mailid])
            setlogin(true)
          }
          
        }} className='bg-black text-white p-2'>Login</button>
      </div>
    )
  }

  function MainPage(){
    return(
      <div>
        <div className='h-[80vh] bg-blue-200'>
          <ul>
            {
              messages.map((message,index) => (
                <li className='border rounded' style={{backgroundColor:message.type}} key={index}>{message.msg}</li>
              ))
            }
          </ul>
        </div>
        <div className=' bg-red-300 h-[20vh]'>
          <input ref={chatref} type="text" placeholder='Write Your Prompt' />
          <button onClick={() => {
            const message = chatref.current?.value;
            if (!message) return alert("enter a vaild message ");
            else{
              setmessages((prev) => [...prev, { msg: message, type: "red" }])
              
              sendreq(message)
            }
          }} className='bg-black text-white'>Submit</button>
        </div>
      </div>
    )
  }

  return (
    <>
      {login ? <MainPage/> : <LoginPage/>}
    </>
  )
}

export default App
