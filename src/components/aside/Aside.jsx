import React, { useContext, useEffect, useMemo, useState } from "react";
import "./aside.scss";
import { db } from "../../firebase/config";
import { collection, doc, getDoc, getDocs, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { set } from "lodash";
import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from "../../context/ChatContext";
import Chat from "../Chat/Chat";
const Aside = () => {
  const [name, setName] = useState("");
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const { data, dispatch } = useContext(ChatContext);
  const { currentUser } = useContext(AuthContext);
  const {messages, setMessages} = useState('');
  const handleSearch = async () => {
    const q = query(collection(db, "users"), where("keywords", "array-contains", name));
    let searchUsers = []
    try {
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((element) => {
        searchUsers.push(element.data())
        console.log(searchUsers);
      });
      setUsers(searchUsers)
    } catch (error) {
      console.log(error + 'error');
    }
  };

  const handleKey = (e) => {
    if (e.code === "Enter") {
      handleSearch()
    }
  };

  const handleSelected = async (user) => {
    //check whether the group(chats in firestore) exists, if not create
    const combinedId =
      currentUser.uid > user.uid
        ? currentUser.uid + user.uid
        : user.uid + currentUser.uid;
    try {
      const res = await getDoc(doc(db, "chats", combinedId));

      if (!res.exists()) {
        //create a chat in chats collection
        await setDoc(doc(db, "chats", combinedId), { messages: [] });

        //create user chats
        await updateDoc(doc(db, "userChats", currentUser.uid), {
          [combinedId + ".userInfo"]: {
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL,
          },
          [combinedId + ".date"]: serverTimestamp(),
        });

        await updateDoc(doc(db, "userChats", user.uid), {
          [combinedId + ".userInfo"]: {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
          },
          [combinedId + ".date"]: serverTimestamp(),
        });
      }
    } catch (err) {}
    // console.log('2');
    setName('')
    setUsers(null)
  };


// console.log(currentUser);
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
  

  const handleChangeUser = (u) => {
    dispatch({ type: "CHANGE_USER", payload: u })
  };

  return (
    <div className="aside">
      <div className="aside__top">
        <div className="aside__top-text">
          <h3 className="title">Chats</h3>
        </div>
        <div className="aside__top-tools">
          <ul>
            <li>
              <button className="link-group">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  class="bi bi-plus"
                  viewBox="0 0 16 16"
                >
                  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"></path>
                </svg>
                <span>New</span>
              </button>
            </li>
            <li>
              <button className="link-group">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  class="bi bi-filter"
                  viewBox="0 0 16 16"
                >
                  <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"></path>
                </svg>
                <span>New</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div className="aside__bottom">
        <div className="wrap">
          <div className="aside__bottom-search">
            <div className="form-group">
              <div className="icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  class="bi bi-search"
                  viewBox="0 0 16 16"
                >
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"></path>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search contact / chat"
                onKeyDown={handleKey}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
          <div className="aside__bottom-content">
            <ul className="aside__list">
              {users?.map(user => {
                return (
                  <li className="aside__item">
                    <Chat user= {user} handleSelect = {()=>handleSelected(user)} />
                  </li>
                )
              })}
            </ul>
            <ul className="aside__list">
              {Object.entries(chats)?.sort((a, b) => b[1].date - a[1].date).map(chat => {
                return (
                  <li className="aside__item">
                    <Chat user={chat[1].userInfo} handleSelect = {()=> handleChangeUser(chat[1].userInfo)} lastMesage = {chat[1].lastMessage?.text} time= {chat[1].lastMessage?.date?.seconds} />
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Aside;
