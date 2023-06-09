import React from 'react'
import './sideBarAi.scss'

const SideBarAI = () => {
    const array = [
        'what can you do for me ?',
        'write me short joke for web development tutor...',
        'top 10 most used css triks.',
        'easy way to join faang',
        'how to learn fornty end web development',
        'Could you write a basic chapter 1 tutorial for...'
    ]
    return (
        <div className='contact_container'>
            <div className='head'>
                <div className='head_text'>
                    <h3>Chat Archive</h3>
                    <p>200+ Conversations</p>
                </div>
                <div className='head_icon'>
                    <h3>+</h3>
                </div>
            </div>

            <div className='body'>
                {
                    array.map((array, index) => {
                        return (
                            <div className='contact'>
                                <div className="avatar">
                                    <svg xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute' }} width="24" height="24" viewBox="0 0 24 24" ><path d="M20 2H4c-1.103 0-2 .894-2 1.992v12.016C2 17.106 2.897 18 4 18h3v4l6.351-4H20c1.103 0 2-.894 2-1.992V3.992A1.998 1.998 0 0 0 20 2zm-6 11H7v-2h7v2zm3-4H7V7h10v2z"></path></svg>
                                </div>
                                <div className="username">
                                    <p>{array}</p>
                                </div>
                            </div>
                        )
                    })
                }

            </div>

            <div className='foot'>
                <div className='foot1'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 8h-2v3h-3v2h3v3h2v-3h3v-2h-3zM4 8a3.91 3.91 0 0 0 4 4 3.91 3.91 0 0 0 4-4 3.91 3.91 0 0 0-4-4 3.91 3.91 0 0 0-4 4zm6 0a1.91 1.91 0 0 1-2 2 1.91 1.91 0 0 1-2-2 1.91 1.91 0 0 1 2-2 1.91 1.91 0 0 1 2 2zM4 18a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v1h2v-1a5 5 0 0 0-5-5H7a5 5 0 0 0-5 5v1h2z"></path></svg>
                    <p>Become Pro</p>
                </div>

                <div className='foot2'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" ><path d="M8.586 18 12 21.414 15.414 18H19c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2H5c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h3.586zM5 4h14v12h-4.414L12 18.586 9.414 16H5V4z"></path><path d="M9.707 13.707 12 11.414l2.293 2.293 1.414-1.414L13.414 10l2.293-2.293-1.414-1.414L12 8.586 9.707 6.293 8.293 7.707 10.586 10l-2.293 2.293z"></path></svg>
                    <p>Clear Archive</p>
                </div>

            </div>
        </div>
    )
}

export default SideBarAI

