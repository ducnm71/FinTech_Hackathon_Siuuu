import React, { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from '../../context/ChatContext';

const Message = ({mess}) => {
  const {currentUser } = useContext(AuthContext)
  const {data} = useContext(ChatContext)
  return (
    <div className={`chat__body-reply-item incoming ${mess.senderId === currentUser.uid ? "outcoming" : "incoming"}`}>
            {mess.senderId !== currentUser.uid &&
            <div className="image">
              <img src={data?.user.photoURL} alt="" />
            </div>
            }
            <div className="content" style={{ display:'flex', flexDirection: 'column' }}>
              {mess.call !== undefined &&
                <div className="content-call">
                <div className="icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-video3" viewBox="0 0 16 16">
                                                        <path d="M14 9.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm-6 5.7c0 .8.8.8.8.8h6.4s.8 0 .8-.8-.8-3.2-4-3.2-4 2.4-4 3.2Z"></path>
                                                        <path d="M2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h5.243c.122-.326.295-.668.526-1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v7.81c.353.23.656.496.91.783.059-.187.09-.386.09-.593V4a2 2 0 0 0-2-2H2Z"></path>
                                                    </svg>
                </div>
                <div className="text">
                  <h6>Outgoing Audio Call</h6>
                  <span>03:29 PM</span>
                </div>
              </div>
              }
              {mess.text !== undefined && mess.text !== '' &&
                <div className="content-text">
                  {mess.text}
                </div>
              }
              
              {mess.media !== undefined &&
                <div className="content-media">
                <a href="" className='thumb' onClick={e => e.preventDefault()}>
                  <img src={mess.media} alt="" />
                </a>
                {/* <a href="" className='thumb'>
                  <img src="https://connectme-html.themeyn.com/images/gallery/chat/1.jpg" alt="" />
                </a>
                <a href="" className='thumb'>
                  <img src="https://connectme-html.themeyn.com/images/gallery/chat/1.jpg" alt="" />
                </a>
                <a href="" className='thumb'>
                  <img src="https://connectme-html.themeyn.com/images/gallery/chat/1.jpg" alt="" />
                </a> */}
              </div>
            }
            {mess.bill !== undefined && 
              <div className='content-bill'>
                <table class="table table-striped table-dark" style={{borderRadius: '10px', overflow: 'hidden'}}>
                <tbody>
                    <tr>
                      <th scope="row">Bill Code</th>
                      <td style={{wordWrap: 'break-word'}}>{mess.bill.hash}</td>
                    </tr>
                    <tr>
                      <th scope="row">Date</th>
                      <td>{new Date((mess.date.seconds)*1000).toLocaleString()}</td>
                    </tr>
                    <tr>
                      <th scope="row">Amount</th>
                      <td>{mess.bill.amout*28400000} VND</td>
                    </tr>
                    <tr>
                      <th scope="row">Content Transfer</th>
                      <td>{mess.bill.message}</td>
                    </tr>
                </tbody>

                </table>
              </div>
            }
              <div className="content-tool"></div>
            </div>
    </div>
  )
}

export default Message