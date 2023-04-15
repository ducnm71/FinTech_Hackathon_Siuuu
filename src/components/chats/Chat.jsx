import React, { useContext, useEffect, useRef, useState } from 'react'
import './chat.scss'
import Message from '../message/Message'
import { ChatContext } from '../../context/ChatContext'
import { Timestamp, arrayUnion, doc, getDoc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db, storage } from '../../firebase/config'
import { AuthContext } from '../../context/AuthContext'
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'
import { v4 as uuid } from 'uuid';
import Camera from '../camera/Camera'
import Canvas from '../canvas/Canvas'
import { TransactionContext } from '../../context/TransactionContext'
import axios from 'axios'
import { set } from 'lodash'

const Chat = () => {
  const { data } = useContext(ChatContext)
  console.log(data);
  const { currentUser } = useContext(AuthContext)
  // console.log(currentUser);
  const [card, setCard] = useState('')
  const [cardUser, setCardUser] = useState('')
  useEffect(() => {
    const getUser = async () => {
        const res = await getDoc(doc(db, "users", currentUser.uid));
        console.log('hehe');
        setCard(res._document.data.value.mapValue.fields.numbercard.mapValue?.fields.cardNumber.stringValue);
    }

    currentAccount && getUser()
}, [])

  
  useEffect(()=> {
    const getUser = async () => {
      const res = await getDoc(doc(db, "users", data.user.uid));
      console.log('hehe');
      setCardUser(res._document.data.value.mapValue.fields.numbercard.mapValue?.fields.cardNumber.stringValue);
  }

  currentAccount && getUser()
  },[data])
  const [text, setText] = useState('')
  const [img, setImg] = useState(null)
  const [messages, setMessages] = useState([]);
  const [Result, setResult] = useState(false)
  const [link, setLink] = useState(false)
  const [show, setShow] = useState(data.payment)
  const [image, setImage] = useState(null);
  const [confirm, setConfirm] = useState(false)
  const [newImage, setNewImage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const { connectWallet, currentAccount, sendTransaction } = useContext(TransactionContext)
  const [values, setValues] = useState({
    addressTo: '',
    amount: '',
    message: ''
  })
  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
    console.log(values)
  }
  const handleSubmit = (e) => {

    e.preventDefault();
    console.log(values)
    setValues({...values, addressTo: cardUser})
    if (!values.addressTo || !values.amount || !values.message) return;

    sendTransaction({values, setIsLoading});

  }
  const handleCapture = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const context = canvas.getContext('2d');
    context.drawImage(document.querySelector('video'), 0, 0, canvas.width, canvas.height);
    console.log(canvas.toDataURL('image/png', 0.5));
    setImage(canvas);

    setNewImage(canvas.toDataURL())
    // setImage(null)
  };
  const handleFaceIO = async () => {
    const fileInput = document.getElementById('hehe'); 
    const data = {image: newImage}
    console.log(newImage);

    fetch('http://localhost:5000/api/init_face', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => console.log(data));
    setImage(null)
    setLink(!link)
  }

  console.log(newImage);
  const fileSelect = useRef()
  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", data.chatId), (doc) => {
      doc.exists() && setMessages(doc.data().messages);
    });

    return () => {
      unSub();
    };
  }, [data.chatId]);
  const handleSend = async () => {
    axios.get(`http://localhost:3001/api/findclassifier/${text}`)
    .then((res) => {
      const result = res.data.includes("transfer")
      if(result){
        setResult(!Result)

      }
    })
    if (img) {
      const storageRef = ref(storage, uuid());
      console.log('hehe');
      const uploadTask = uploadBytesResumable(storageRef, img);

      uploadTask.on(
        (error) => {
          //TODO:Handle Error
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
            await updateDoc(doc(db, "chats", data.chatId), {
              messages: arrayUnion({
                id: uuid(),
                text,
                senderId: currentUser.uid,
                date: Timestamp.now(),
                media: downloadURL,
              }),
            });
          });
          console.log('sucees');
        }
      );
    } else {
      await updateDoc(doc(db, "chats", data.chatId), {
        messages: arrayUnion({
          id: uuid(),
          text,
          senderId: currentUser.uid,
          date: Timestamp.now(),
        }),
      });
    }

    await updateDoc(doc(db, "userChats", currentUser.uid), {
      [data.chatId + ".lastMessage"]: {
        text,
        date: Timestamp.now(),
      },
      [data.chatId + ".date"]: serverTimestamp(),
    });

    await updateDoc(doc(db, "userChats", data.user.uid), {
      [data.chatId + ".lastMessage"]: {
        text,
        date: Timestamp.now(),
      },
      [data.chatId + ".date"]: serverTimestamp(),
    });

    setText("");
    setImg(null);
  };
  console.log(img);
  return (
    <div className='chat'>
      <div className="chat__top">
        <div className='icon-prev'></div>
        <div className="chat__top-left">
          <div className="image">
            <img src={data.user?.photoURL} alt="" srcset="" />
          </div>
          <div className="content">
            <h6>{data.user?.displayName}</h6>
            <span>Active</span>
          </div>
        </div>
        <ul className="chat__top-right">
          <li>
            <button>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-telephone-fill" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"></path>
              </svg>
            </button>
          </li>
          <li>
            <button>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-camera-video-fill" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5z"></path>
              </svg>
            </button>
          </li>
          <li>
            <button>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"></path>
              </svg>
            </button>
          </li>
          <li>
            <button>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-layout-sidebar-inset-reverse" viewBox="0 0 16 16">
                <path d="M2 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H2zm12-1a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h12z"></path>
                <path d="M13 4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V4z"></path>
              </svg>
            </button>
          </li>
        </ul>
      </div>
      <div className="chat__body">
        <div className="chat__body-reply">
          {messages.map(m => (
            <Message key={m.id} mess={m} />
          ))}

        </div>
      </div>

      <div className="chat__bottom">
          {
            Result&& 
            <div className='hoichuyentien'>
              <p>You want to transfer amount?</p>
              <div className='hoi'>
                <button type="button" class="btn btn-secondary" onClick={() => setResult(!Result)}>No</button>
                <button type="button" class="btn btn-primary" onClick={() => {
                  setResult(!Result)
                  setShow(!show)
                }}>Yes</button>
              </div>
            </div>
          }
        <ul className="chat__bottom-left">
          <li>
            <button onClick={() => setShow(!show)} className='threeButton' type="button" class="btn btn-primary" id="primary" data-toggle="modal" data-target="#exampleModalCenter">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 576 512"><path d="M64 64C28.7 64 0 92.7 0 128V384c0 35.3 28.7 64 64 64H512c35.3 0 64-28.7 64-64V128c0-35.3-28.7-64-64-64H64zm48 160H272c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16zM96 336c0-8.8 7.2-16 16-16H464c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16zM376 160h80c13.3 0 24 10.7 24 24v48c0 13.3-10.7 24-24 24H376c-13.3 0-24-10.7-24-24V184c0-13.3 10.7-24 24-24z" /></svg>
            </button>

            {

              show &&
              <div class="modal fade" style={{ display: 'block' }} id="exampleModalCenter" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered" role="document">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title" id="exampleModalLongTitle">Transfer Acount</h5>
                      <button onClick={() => setShow(!show)} type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>
                    {
                      link ?
                        <>
                          {
                            !confirm ?
                              <>

                                <div class="modal-body">

                                  <div className='remainder'>
                                    <h5>
                                      Remainder:
                                    </h5>
                                    <p>1.000.000 VND</p>
                                  </div>

                                  <div className="item">
                                    <input placeholder='Amount' name="amount" min='0.0001' type='text' required onChange={(e) => handleChange(e)} />
                                    <textarea placeholder='Transfer Content' name="message" onChange={(e) => handleChange(e)} />
                                  </div>

                                </div>
                                <div class="modal-footer">
                                  <button onClick={() => {
                                    setLink(!link)
                                    setShow(!show)
                                  }} type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                                  <button type="button"  onClick={handleSubmit} class="btn btn-primary" id="upload"
                                  >Transfer</button>
                                </div>
                              </>
                              :
                              <>
                                <div class="modal-body">

                                  <div className='remainder'>

                                  </div>

                                  <table className='table table-striped'>

                                    <tbody>
                                      <tr>
                                        <th scope="row">Source account</th>
                                        <td>0012030000</td>
                                      </tr>
                                      <tr>
                                        <th scope="row">Target account</th>
                                        <td>1222224249</td>
                                      </tr>
                                      <tr>
                                        <th scope="row">Beneficiary</th>
                                        <td>Anh Hoang</td>
                                      </tr>
                                      <tr>
                                        <th scope="row">Amount</th>
                                        <td>100.000</td>
                                      </tr>
                                      <tr>
                                        <th scope="row">Fee transfer</th>
                                        <td>0</td>
                                      </tr>
                                      <tr>
                                        <th scope="row">Content</th>
                                        <td>Hehe</td>
                                      </tr>
                                    </tbody>


                                  </table>

                                </div>
                                <div class="modal-footer">
                                  <div className='total'>
                                    <p>Total</p>
                                    <p>100.000</p>
                                  </div>
                                  <button onClick={() => {
                                    setConfirm(!confirm)
                                  }} type="button" class="btn btn-secondary">Back</button>
                                  <button type="button" class="btn btn-primary" id="upload"
                                  >Confirm</button>
                                </div>
                              </>
                          }

                        </>
                        :
                        <>
                          <div class="modal-body">
                          {
                            !currentAccount?<h5 style={{color: 'red'}}>You have not linked your Viettel Money account!</h5>
                              : <h5 style={{color: 'green'}}>Link your Viettel Money account succussfully!</h5>
                          }  
                          
                            <div className="item">
                              {!currentAccount &&
                                (
                                  <button type="button" class="btn btn-primary" id="login-button" onClick={() => {
                                    connectWallet({
                                      currentUser, card
                                    })
                                    }}>
                                    Connect wallet
                                  </button>
                                )
                              }
                              <Camera />
                              <button type="button" class="btn btn-primary" style={{ width: '160px', height: '40px', border: 'none', borderRadius: '5px', backgroundColor: '#007bff', color: 'white' }} onClick={handleCapture}>Take Register Photo</button>
                              {
                                image&&<img  src={newImage} alt='' />
                              }
                              


                            </div>
                          </div>
                          <div class="modal-footer">
                            <button onClick={() => {
                              setImage(null)
                              setShow(!show)
                            }} type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" id="upload"
                              onClick={handleFaceIO}
                            >Register</button>
                          </div>
                        </>
                    }

                  </div>
                </div>
              </div>
            }
          </li>


          <li>

            <button className='threeButton' onClick={() => fileSelect.current.click()}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-card-image" viewBox="0 0 16 16">
                <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"></path>
                <path d="M1.5 2A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13zm13 1a.5.5 0 0 1 .5.5v6l-3.775-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12v.54A.505.505 0 0 1 1 12.5v-9a.5.5 0 0 1 .5-.5h13z"></path>
              </svg>
            </button>

          </li>
          <li>
            <button className='threeButton'>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-card-image" viewBox="0 0 16 16">
                <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"></path>
                <path d="M1.5 2A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13zm13 1a.5.5 0 0 1 .5.5v6l-3.775-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12v.54A.505.505 0 0 1 1 12.5v-9a.5.5 0 0 1 .5-.5h13z"></path>
              </svg>
            </button>

          </li>
          
        </ul>
       
        <div className="chat__bottom-right">
          <input type="text" value={text} onChange={(e) => setText(e.target.value)} />
          <input type="file" id='file' ref={fileSelect} onChange={(e) => setImg(e.target.files[0])} style={{ display: 'none' }} />
          <ul>
            <li>
              <button>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-mic-fill" viewBox="0 0 16 16">
                  <path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0V3z"></path>
                  <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"></path>
                </svg>
              </button>
            </li>
            <li>
              <button onClick={handleSend}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-send-fill" viewBox="0 0 16 16">
                  <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z"></path>
                </svg>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Chat