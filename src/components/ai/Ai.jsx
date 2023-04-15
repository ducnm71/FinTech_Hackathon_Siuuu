import React, { useContext, useEffect, useState, useRef } from "react";
import SideBarAI from "./sideBarAI";
import './ai.scss'
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/config";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import { useNavigate } from "react-router-dom";
import { TransactionContext } from '../../context/TransactionContext'
import { shortenAddress } from '../../utils/shortenAddress'
import { IoMdSend } from "react-icons/io";
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
  const { currentUser } = useContext(AuthContext);
  const { data, dispatch } = useContext(ChatContext);
  const { transactions } = useContext(TransactionContext);
  console.log(transactions)
  const scrollRef = useRef();
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
    if (text === '/') setOption(true)
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
  //xử lý chuyển tiền
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
          {chats !== undefined && Object.entries(chats)?.sort((a, b) => b[1].date - a[1].date).map(chat => {
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
  //xử lí lịch sử giao dịch
  const handleHistory = () => {
    setMessages([...messages, {
      message: 'Lịch sử',
      sender: "user",
    }])

    setText('')
    let messGpT = (
      <>
        <ul>
          <li>Lịch sử giao dịch</li>
          {chats !== undefined && Object.entries(chats)?.sort((a, b) => b[1].date - a[1].date).map(chat => {

            return (
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th scope="col">Địa chỉ nhận</th>
                    <th scope="col">Địa chỉ gửi</th>
                    <th scope="col">Số tiền</th>
                    <th scope="col">Tin nhắn</th>
                    <th scope="col">Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction, i) => {
                    return (
                      <tr>
                        <th scope="row">{shortenAddress(transaction.addressTo)}</th>
                        <td>{shortenAddress(transaction.addressFrom)}</td>
                        <td>{transaction.amount}</td>
                        <td>{transaction.message}</td>
                        <td>{transaction.timestamp}</td>
                      </tr>
                    )
                  })
                  }
                </tbody>
              </table>
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
    <div className="my-container">
      <div className="chat_container">
        <SideBarAI />
        <div className="chatcontainer">
          <div className="chat-header">
            <div className="user-details">
              <div className="avatar">
              <img
                    src="https://connectme-html.themeyn.com/images/avatar/bot-1.jpg"
                    className="avtBot"
                    alt=""
                  />
              </div>
              <div className="username">
                Assistant
              </div>
            </div>
          </div>
          <div className="chat-messages">
            {messages.map((message, index) => {
              return (
                <div ref={scrollRef} key={index}>
                  <div className={`message ${message.sender == "user" ? "sended" : "recieved"}`}>
                    <div className='content'>
                      <p>{message.message}</p>
                    </div>
                  </div>
                </div>
              )
            })}
            <div>
              {isTyping ? "The assistant is typing..." : ""}
            </div>
          </div>
          <div className="input_container">
            <div className="button-container">
              <div className="emoji">

              </div>
            </div>

            <div className="form_container">
              <input type="text" placeholder="Nhắn tin..."
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKey}
                value={text}
              ></input>
              <button className="submit">
                <IoMdSend></IoMdSend>
              </button>
            </div>
          </div>
          {option &&
            <ul className="send-option">
              <li onClick={handlePay}>Gửi tiền</li>
              <li onClick={handleHistory}>Lịch sử giao dịch</li>
              {/* <li></li>
            <li></li>
            <li></li> */}
            </ul>
          }
        </div>

      </div>

    </div>
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