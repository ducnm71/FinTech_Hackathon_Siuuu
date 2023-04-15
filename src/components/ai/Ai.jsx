import React, { useContext, useEffect, useState } from "react";
import SideBarAI from "./sideBarAI";
import styled from "styled-components";
import code1 from "../../image/chat-bot/code1.png";
import code2 from "../../image/chat-bot/code2.png";
import code3 from "../../image/chat-bot/code3.png";
import code4 from "../../image/chat-bot/code4.png";
import code5 from "../../image/chat-bot/code5.png";
import code6 from "../../image/chat-bot/code6.png";
import { set } from "lodash";
import { message } from "antd";
const API_KEY = "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"
const systemMessage = {
  //  Explain things like you're talking to a software professional with 5 years of experience.
  role: "system",
  content:
    "Explain things like you're talking to a software professional with 2 years of experience.",
};
const Ai = () => {
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm your assistant! Ask me anything!",
      sentTime: "just now",
      sender: "ChatGPT",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [text, setText] = useState("");
  const [option, setOption] = useState(false)
  const [chats, setChats] = useState([])
  const { currentUser} = useContext(AuthContext);
  const { data, dispatch } = useContext(ChatContext);
  console.log(currentUser);
  useEffect(() => {
    const getChats = () => {
      // console.log(currentUser + 'haha');
      const unsub = onSnapshot(doc(db, "userChats", currentUser.uid), (doc) => {
        console.log(doc.data())
        setChats(doc.data())
      })

      return () => {
        unsub();
      }
    }
    
    currentUser.uid && getChats()
    
  }, [currentUser.uid])

  useEffect(() => {
    if(text === '/') setOption(true)
    else setOption(false)
  }, [text])

  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: "outgoing",
      sender: "user",
    };

    const newMessages = [...messages, newMessage];

    setMessages(newMessages);

    // Initial system message to determine ChatGPT functionality
    // How it responds, how it talks, etc.
    setIsTyping(true);
    await processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages) {
    // messages is an array of messages
    // Format messages for chatGPT API
    // API is expecting objects in format of { role: "user" or "assistant", "content": "message here"}
    // So we need to reformat

    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message };
    });

    // Get the request body set up with the model we plan to use
    // and the messages which we formatted above. We add a system message in the front to'
    // determine how we want chatGPT to act.
    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [
        systemMessage, // The system message DEFINES the logic of our chatGPT
        ...apiMessages, // The messages from our chat with ChatGPT
      ],
    };

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiRequestBody),
    })
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        console.log(data);
        setMessages([
          ...chatMessages,
          {
            message: data.choices[0].message.content,
            sender: "ChatGPT",
          },
        ]);
        setIsTyping(false);
      });
  }

  const handleChangeUser = (u) => {
    dispatch({ type: "CHANGE_USER_PAYMENT", payload: u })
  };


  const handleKey = (e) => {
    e.code === "Enter" && handleSend(text);
    console.log(messages);
  };
  const [copy, setCopy] = useState(false);

  const handlePay = () => {
    setMessages([...messages, {
      message: 'Chuyển tiền',
      sender: "user",
    }])

    setText('')

    let messGpT = (
      <>
        <ul>
          <li>Người dùng trong danh bạ</li>
        { chats !== undefined && Object.entries(chats)?.sort((a, b) => b[1].date - a[1].date).map(chat => {
                return (
                  <li className="aside__item" onClick={() => handleNavigate(chat[1].userInfo)}>
                    <img src={chat[1].userInfo?.photoURL} alt="" />
                    <p>{chat[1].userInfo?.displayName}</p>
                  </li>
                )
              })}
        </ul>
      </>
    )

    setMessages([...messages, {
      message: messGpT,
      sender: 'ChatGPT'
    }])
  }

  const handleCopy = () => {
    setTimeout(() => {
      setCopy(true);
    }, 1000);
  };
  const navigate = useNavigate()
  const handleNavigate = (user) => {
    handleChangeUser(user)
    navigate('/')
  }

  return (
    <SAi>
      <SideBarAI />

      <div className="content">
        {messages.map((message) => {
          return (
            <div className="qa2">
              {message.sender === "user" &&
                <div className="question">
                  <img
                    src="https://connectme-html.themeyn.com/images/avatar/1.jpg"
                    className="avt"
                    alt=""
                  />
                  <p>
                    {message.message}
                  </p>
                </div>
              }
              {message.sender === "ChatGPT" &&
                <div className="answer">
                  <img
                    src="https://connectme-html.themeyn.com/images/avatar/bot-1.jpg"
                    className="avtBot"
                    alt=""
                  />
                  <div className="content_answer">
                    <p>
                      {message.message}
                    </p>
                  </div>
                </div>
              }
            </div>
          );
        })}
        {option && 
          <ul className="send-option">
            <li onClick={handlePay}>Gửi tiền</li>
            <li>Lịch sử giao dịch</li>
            {/* <li></li>
            <li></li>
            <li></li> */}
          </ul>
        }
        <div className="send">
          {/* <form onSubmit={handleSend}> */}

          <input
            type="text"
            required
            value={text}
            placeholder="Search here"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKey}
          />
          <button>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path d="m21.426 11.095-17-8A.999.999 0 0 0 3.03 4.242L4.969 12 3.03 19.758a.998.998 0 0 0 1.396 1.147l17-8a1 1 0 0 0 0-1.81zM5.481 18.197l.839-3.357L12 12 6.32 9.16l-.839-3.357L18.651 12l-13.17 6.197z"></path>
            </svg>
          </button>
          {/* </form> */}
        </div>
      </div>
    </SAi>
  );
};

export default Ai;

const SAi = styled.div`
  background-color: #dbeafe;
  display: flex;
  overflow: hidden;
  /* flex: 2; */
  height: calc(100vh - 80px);
  .content {
    flex: 3;
    overflow: hidden;
    overflow-y: scroll;
    scroll-behavior: inherit;
    /* height: 740px; */
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    /* position: relative; */
    p {
      font-size: 17px;
      color: #475569;
      ul {
        li {
          display: flex;
          align-items: center;
          gap: 10px;
          img {
            width: 48px;

          }
        }
      }
    
    }
    .avt {
      width: 35px;
      height: 35px;
      border-radius: 10px;
    }
    .avtBot {
      width: 35px;
      height: 35px;
      border-radius: 10px;
      margin-top: 10px;
    }

    .question {
      display: flex;
      align-items: center;
      gap: 1rem;
      background-color: #eff6ff;
      padding: 10px 20px;
    }
    .answer {
      display: flex;
      gap: 1rem;
      padding: 10px 20px;
      background-color: white;
      ol {
        margin-left: -20px;
        li {
          font-size: 17px;
          color: #475569;
        }
      }
    }
    .qa1 {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
    }
    .qa2 {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
    }
    .qa3 {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
      .answer {
        .content_answer {
          dl {
            li {
              color: #475569;
            }
          }

          .code {
            .title {
              display: flex;
              align-items: center;
              gap: 75%;
              background-color: #1e293b;
              height: 40px;
              h3 {
                margin-left: 10px;
                font-size: 15px;
                color: white;
              }
              p {
                color: #dbeafe;
              }
            }
          }
        }
      }
    }
  }
  .send-option {
    position: absolute;
    background-color: #eff6ff;
    width: 40%;
    bottom: 15%;
    left: 44%;
    li {
      padding: 10px;

      &:nth-child(odd) {
       background-color: #ffffff;
      }
    }

  }
  .send {
    width: 40%;
    position: absolute;
    bottom: 5%;
    left: 44%;
    /* left: 0; */
    display: flex;
    align-items: center;
    input {
      padding: 20px;
      width: 100%;
      height: 70px;
      border: 0;
      border-radius: 10px;
      font-size: 20px;
    }
    button{
      border: 0;
      background-color: white;
      margin-left: -50px;
  }
  }
`;
