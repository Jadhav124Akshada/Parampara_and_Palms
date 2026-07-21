import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Chatbot.css";


const Chatbot = () => {

    const navigate = useNavigate();


    const [isOpen, setIsOpen] = useState(false);


    const [messages, setMessages] = useState([

        {
            sender:"bot",
            text:
            "👋 Welcome to Parampara & Palms!\n\nI can help you with menu, cart, wishlist, orders and tracking."
        }

    ]);



    const [input,setInput] = useState("");

    const [isLoading,setIsLoading] = useState(false);


    const messagesEndRef = useRef(null);





    useEffect(()=>{

        messagesEndRef.current?.scrollIntoView({
            behavior:"smooth"
        });

    },[messages,isLoading]);








    // Redirect Pages

    const handleRedirect = (page)=>{


        switch(page){


            case "menu":

                navigate("/food-menu");

                break;



            case "cart":

                navigate("/cart");

                break;




            case "wishlist":

                navigate("/wishlist");

                break;




            case "orders":

                navigate("/my-orders");

                break;




            case "track":

                navigate("/track-order");

                break;



            default:

                break;

        }


    };








    // Send Message

    const handleSendMessage = async(text)=>{


        const message = text || input;


        if(!message.trim())
            return;




        setMessages(prev=>[

            ...prev,

            {
                sender:"user",
                text:message
            }

        ]);



        setInput("");

        setIsLoading(true);





        try{


            const response = await fetch(

                "http://localhost:8000/api/chatbot/",

                {

                    method:"POST",


                    headers:{

                        "Content-Type":"application/json"

                    },


                    body:JSON.stringify({

                        message:message

                    })

                }

            );




            const data = await response.json();





            setMessages(prev=>[

                ...prev,


                {

                    sender:"bot",

                    text:data.reply,

                    redirect:data.redirect || null

                }


            ]);




        }

        catch(error){


            setMessages(prev=>[

                ...prev,


                {

                    sender:"bot",

                    text:
                    "❌ Unable to connect with server."

                }

            ]);


        }



        finally{

            setIsLoading(false);

        }



    };









    return (


        <div className="chatbot-container">





            {
            isOpen &&


            <div className="chat-window">





                <div className="chat-header">


                    <div className="chat-header-info">


                        <div className="chat-avatar">

                            🍽️

                        </div>



                        <div>


                            <h4>

                                Parampara Assistant

                            </h4>


                            <span>

                                Online

                            </span>


                        </div>



                    </div>





                    <button

                        className="close-btn"

                        onClick={()=>setIsOpen(false)}

                    >

                        ✕

                    </button>



                </div>









                <div className="chat-messages">



                    {

                    messages.map((msg,index)=>(


                        <div

                            key={index}

                            className={

                                msg.sender==="user"

                                ?

                                "chat-msg user-msg"

                                :

                                "chat-msg bot-msg"

                            }

                        >



                            <div className="chat-msg-bubble">


                                {msg.text}




                                {
                                msg.redirect &&


                                <button

                                    className="redirect-btn"

                                    onClick={()=>handleRedirect(msg.redirect)}

                                >


                                    {

                                    msg.redirect==="menu"

                                    ?

                                    "🍽️ View Full Menu"

                                    :

                                    msg.redirect==="cart"

                                    ?

                                    "🛒 Open Cart"

                                    :

                                    msg.redirect==="wishlist"

                                    ?

                                    "❤️ Open Wishlist"

                                    :

                                    msg.redirect==="orders"

                                    ?

                                    "📦 View Orders"

                                    :

                                    "🚚 Track Order"

                                    }


                                </button>


                                }



                            </div>



                        </div>


                    ))

                    }






                    {
                    isLoading &&


                    <div className="chat-msg bot-msg">


                        <div className="chat-msg-bubble typing">


                            <span></span>

                            <span></span>

                            <span></span>


                        </div>


                    </div>

                    }




                    <div ref={messagesEndRef}/>



                </div>









                <div className="quick-replies">



                    <button

                    onClick={()=>handleSendMessage("menu")}

                    >

                        🍽 Menu

                    </button>




                    <button

                    onClick={()=>handleSendMessage("cart")}

                    >

                        🛒 Cart

                    </button>





                    <button

                    onClick={()=>handleSendMessage("wishlist")}

                    >

                        ❤️ Wishlist

                    </button>





                    <button

                    onClick={()=>handleSendMessage("orders")}

                    >

                        📦 Orders

                    </button>






                </div>









                <div className="chat-input-area">



                    <input

                    value={input}

                    onChange={(e)=>setInput(e.target.value)}

                    onKeyDown={(e)=>{

                        if(e.key==="Enter")
                            handleSendMessage();

                    }}

                    placeholder="Ask me anything..."

                    />




                    <button

                    onClick={()=>handleSendMessage()}

                    >

                        Send

                    </button>



                </div>







            </div>

            }








<div
    className="chat-launcher"
    onClick={() => setIsOpen(!isOpen)}
>
    {
        isOpen ?

        <span className="close-icon">✕</span>

        :

        <img
            src="/images/chatbot.png"
            alt="Chatbot"
            className="chatbot-image"
        />

    }

</div>

        </div>


    );

};



export default Chatbot;