import React, { useState } from "react";
import SideBarAI from "./sideBarAI";
import styled from "styled-components";


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
  const handleChange = (e) => {
    setText(e.target.value)
  }
  const handleSubmit = (e) => {
    e.preventDefault()
    handleSend(text)
    if (text.length > 0) {
      setText("")
    }
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

        <div className="send">
          <form onSubmit={(e) => handleSubmit(e)}>

            <input
              type="text"
              required
              value={text}
              placeholder="Search here"
              onChange={(e) => handleChange(e)}
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
          </form>
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
