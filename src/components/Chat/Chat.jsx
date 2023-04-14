import React from 'react'

const Chat = ({user, handleSelect, lastMesage, time}) => {
  const convertTime = (time) => {
    const date = new Date(time)
    const minutes = date.getMinutes();
    const hour = date.getHours();
    return hour.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0');

  }
  return (
    <div className="aside__item-group" onClick={handleSelect}>
      <div className="image">
        <img
          src={user?.photoURL}
          alt={user?.displayName}
        />
      </div>
      <div className="content col">
        <div className="content-name row">
          <h6>{user?.displayName}</h6>
          {/* <span>typing...</span> */}
        </div>
        <div className="content-text row">
          <p>{lastMesage}</p>
          <span>{convertTime(time)}</span>
        </div>
      </div>
      <div className="option">
        <ul>
          <li className="dropdown">
            <button>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-three-dots"
                viewBox="0 0 16 16"
              >
                <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"></path>
              </svg>
            </button>
            {/* <div></div> */}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Chat