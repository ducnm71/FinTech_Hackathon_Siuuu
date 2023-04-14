import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './App.scss';

import Login from './pages/Login/login';

import Header from './components/header/Header';
import Aside from './components/aside/Aside';
import Chat from './components/chats/Chat';
import Contacts from './components/contacts/Contacts';
import Home from './pages/home/Home';
import { useContext } from "react";
import { AuthContext } from './context/AuthContext';
import Ai from './components/ai/Ai';



function App() {
  const { currentUser } = useContext(AuthContext);
  console.log(currentUser);
  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/login" />;
    }

    return children
  };
  // const location = useLocation()
  // console.log();
  return (
    <BrowserRouter>
      <Routes>
          <Route path='/' element= {<Header />}>
            <Route path='/' element={
              <>
                <ProtectedRoute>
                    <Home />  
                </ProtectedRoute>
                </>
              }
              >
              <Route path='/' element= {<Chat />}/>
              <Route path='contacts' element= {<Contacts />}/>
            </Route>
            <Route path='chatbot' element = {<Ai />} />
          </Route>
          <Route path="login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
