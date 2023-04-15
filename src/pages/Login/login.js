import React, { useState } from "react";
import * as Components from './Components';
import { createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from "firebase/auth";
import { auth, storage, db } from "../../firebase/config";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import Add from "../../image/addAvatar.png"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './style.css';
import { useEffect } from "react";



const Login = () => {

  const [signIn, toggle] = React.useState(true);
  const [user, setUser] = React.useState({
    email: '',
    password: ''
  });
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  function setParams(e) {
    if (e.target.name === 'email') {
      setUser({ ...user, email: e.target.value });
    }
    if (e.target.name === 'password') {
      setUser({ ...user, password: e.target.value });
    }
  }

  const [register, setRegister] = useState({
    name: '',
    email: '',
    password: '',
    file: ''
  })

  useEffect(() => {
    console.log(register);

  }, [register])

  useEffect(() => {
    console.log(user);
  }, [user])

  const generateKeywords = (displayName) => {
    // liet ke tat cac hoan vi. vd: name = ["David", "Van", "Teo"]
    // => ["David", "Van", "Teo"], ["David", "Teo", "Van"], ["Teo", "David", "Van"],...
    const name = displayName.split(' ').filter((word) => word);

    const length = name.length;
    let flagArray = [];
    let result = [];
    let stringArray = [];

    /**
     * khoi tao mang flag false
     * dung de danh dau xem gia tri
     * tai vi tri nay da duoc su dung
     * hay chua
     **/
    for (let i = 0; i < length; i++) {
      flagArray[i] = false;
    }

    const createKeywords = (name) => {
      const arrName = [];
      let curName = '';
      name.split('').forEach((letter) => {
        curName += letter;
        arrName.push(curName);
      });
      return arrName;
    };

    function findPermutation(k) {
      for (let i = 0; i < length; i++) {
        if (!flagArray[i]) {
          flagArray[i] = true;
          result[k] = name[i];

          if (k === length - 1) {
            stringArray.push(result.join(' '));
          }

          findPermutation(k + 1);
          flagArray[i] = false;
        }
      }
    }

    findPermutation(0);

    const keywords = stringArray.reduce((acc, cur) => {
      const words = createKeywords(cur);
      return [...acc, ...words];
    }, []);

    return keywords;
  };


  const submitFormLogin = async (e) => {
    e.preventDefault()
    const email = user.email
    const password = user.password

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login successfully!')
      navigate("/")
    } catch (err) {
      setErr(true);
    }

  }

  const submitFormRegist = async (e) => {
    e.preventDefault()
    const displayName = register.name
    const email = register.email
    const password = register.password
    const file = register.file

    try {
      //Create user
      const res = await createUserWithEmailAndPassword(auth, email, password);

      //Create a unique image name
      const date = new Date().getTime();
      const storageRef = ref(storage, `${displayName + date}`);

      await uploadBytesResumable(storageRef, file).then(() => {
        getDownloadURL(storageRef).then(async (downloadURL) => {
          try {
            //Update profile
            await updateProfile(res.user, {
              displayName,
              photoURL: downloadURL,
            });
            //create user on firestore
            await setDoc(doc(db, "users", res.user.uid), {
              uid: res.user.uid,
              displayName,
              email,
              photoURL: downloadURL,
              keywords: generateKeywords(displayName),
              photoAuth: false,
              balance: '',
              numbercard: '',
            });

            //create empty user chats on firestore
            await setDoc(doc(db, "userChats", res.user.uid), {});
            navigate("/");
          } catch (err) {
            console.log(err);
            setErr(true);
            setLoading(false);
          }
        });
      });
    } catch (err) {
      setErr(true);
      setLoading(false);
    }
  }

  return (
    <div className="login-body">
      <Components.Container >
        <Components.SignUpContainer signinIn={signIn}>
          <Components.Form
            onSubmit={submitFormRegist}
          >
            <Components.Title>Create Account</Components.Title>
            <Components.Input type='text' name="name" placeholder='Name' required onChange={(e) => { setRegister({ ...register, name: e.target.value }) }} />
            <Components.Input type='email' name="email" placeholder='Email' required onChange={(e) => { setRegister({ ...register, email: e.target.value }) }} />
            <Components.Input type='password' name="password" placeholder='Password' required onChange={(e) => { setRegister({ ...register, password: e.target.value }) }} />
            <input required style={{ display: "none" }} type="file" id="file" onChange={(e) => { setRegister({ ...register, file: e.target.files[0] }) }} />
            <label htmlFor="file" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '10px 0' }}>
              <img src={Add} alt="" style={{ width: '30px', height: '30px' }} />
              <span style={{ color: 'rgb(98, 132, 255)' }}>Add an avatar</span>
            </label>
            <Components.Button
              disabled={loading}
            >Sign Up</Components.Button>
            {loading && "Uploading and compressing the image please wait..."}
            {err && <span>Something went wrong</span>}

          </Components.Form>
        </Components.SignUpContainer>

        <Components.SignInContainer signinIn={signIn}>
          <Components.Form
            onSubmit={submitFormLogin}

          >
            <Components.Title>Sign in</Components.Title>
            <Components.Input type='email' name="email" placeholder='mail' onChange={setParams} />
            <Components.Input type='password' name="password" placeholder='Password' onChange={setParams} />
            <Components.Anchor href='#'>Forgot your password?</Components.Anchor>
            <Components.Button
            >Sigin In</Components.Button>
            {err && <span>Something went wrong</span>}
          </Components.Form>
        </Components.SignInContainer>

        <Components.OverlayContainer signinIn={signIn}>
          <Components.Overlay signinIn={signIn}>

            <Components.LeftOverlayPanel signinIn={signIn}>
              <Components.Title>Welcome Back!</Components.Title>
              <Components.Paragraph>
                To keep connected with your friends please login with your personal info
              </Components.Paragraph>
              <Components.GhostButton onClick={() => toggle(true)}>
                Sign In
              </Components.GhostButton>
            </Components.LeftOverlayPanel>

            <Components.RightOverlayPanel signinIn={signIn}>
              <Components.Title>Hello, Friend!</Components.Title>
              <Components.Paragraph>
                Enter Your personal details and start chatting with your friends
              </Components.Paragraph>
              <Components.GhostButton onClick={() => toggle(false)}>
                Sigin Up
              </Components.GhostButton>
            </Components.RightOverlayPanel>

          </Components.Overlay>
        </Components.OverlayContainer>
      </Components.Container>

    </div>
  )
}


export default Login