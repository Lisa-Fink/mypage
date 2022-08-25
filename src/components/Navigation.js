import {
  doc,
  onSnapshot,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from './firebaseConfig';

import '../styles/navigation.css';
import getFriendInfo from './FriendInfo';

const Navigation = () => {
  const updatingNew = useRef();

  const [error, setError] = useState('');
  const [photo, setPhoto] = useState('');
  const [name, setName] = useState('');

  // list of the id's and new bool of frs from firstore
  const [fRequests, setFRequests] = useState([]);
  // list of the id's names and photos
  const [fRInfo, setFRInfo] = useState([]);
  // amount of unviewed friend requests
  const [fRAlert, setFRAlert] = useState(0);
  const [fRError, setFRError] = useState('');

  const [showMenu, setShowMenu] = useState(false);
  const [showFRMenu, setShowFRMenu] = useState(false);

  const { currentUser, logout } = useAuth();

  const navigate = useNavigate();

  const handleLogout = async () => {
    setError('');
    try {
      await logout();
      navigate('/login');
    } catch {
      setError('Failed to log out');
    }
  };

  const acceptFr = async (e) => {
    const id = e.target.getAttribute('data-id');
    try {
      error && setError('');

      const docRef = doc(db, 'users', currentUser.uid);
      // add friend to current user
      updateDoc(docRef, {
        friends: arrayUnion(id),
      });
      // remove the fr from current user
      updateDoc(docRef, {
        requests: arrayRemove({ id: id, new: false }),
      });
      const friendRef = doc(db, 'users', id);
      // add current user as a friend to user of the fr
      updateDoc(friendRef, {
        friends: arrayUnion(currentUser.uid),
      });
    } catch {
      setError('Failed to add friend');
    }
  };

  const rejectFr = (e) => {
    const id = e.target.getAttribute('data-id');
    try {
      error && setError('');

      const docRef = doc(db, 'users', currentUser.uid);
      // remove the fr from current user
      updateDoc(docRef, {
        requests: arrayRemove({ id: id, new: false }),
      });
    } catch {
      setError('Failed to remove friend');
    }
  };

  const viewFRMenu = async () => {
    setShowFRMenu(true);
    // set all friend requests to viewed
    if (fRAlert > 0 && !updatingNew.current) {
      updatingNew.current = true;
      const viewed = [...fRequests];
      viewed.forEach((fr) => (fr.new = false));
      try {
        await setDoc(
          doc(db, 'users', currentUser.uid),
          { requests: viewed },
          { merge: true }
        );
        setFRAlert(0);
      } catch {
        setError('Failed to update friend requests');
      }
      updatingNew.current = false;
    }
  };

  useEffect(() => {
    currentUser &&
      onSnapshot(doc(db, 'users', currentUser.uid), (doc) => {
        setPhoto(doc.data().profilePic);
        const first = doc.data().first;
        const last = doc.data().last;
        setName(`${first} ${last}`);
        setFRequests(doc.data().requests);
      });
  }, []);

  useEffect(() => {
    if (Object.keys(fRequests).length) {
      const processFrs = async () => {
        let frData = [];
        let newFr = 0;
        for (const fr of fRequests) {
          let id = fr.id;
          // get the name and photo for the fr id
          const finfo = await getFriendInfo(id);
          if (finfo === 'error') {
            setError('error retrieving friend requests');
            break;
          }

          let name = finfo.name;
          let photo = finfo.photo;
          frData.push({ name, photo, id });

          if (fr.new) {
            newFr += 1;
          }
        }
        return { frData, newFr };
      };
      processFrs().then((data) => {
        data.newFr && setFRAlert(data.newFr);
        setFRInfo(data.frData);
      });
    } else if (Object.keys(fRInfo).length) {
      setFRInfo({});
    }
  }, [fRequests]);

  const fReqMenu = (
    <div id="fr-menu">
      {Object.keys(fRInfo).length ? (
        fRInfo.map((fr) => {
          return (
            <div className="fr-div" key={fr.id}>
              <div>
                <img
                  className="photo-thumb"
                  src={fr.photo}
                  alt="friend thumbnail"
                />
              </div>
              <div className="fr-main">
                <div className="fr-info">
                  <Link to={`/profile/${fr.id}`}>{fr.name}</Link>
                </div>
                <div className="fr-actions">
                  <button className="fr-btn" data-id={fr.id} onClick={acceptFr}>
                    Accept
                  </button>
                  <button className="fr-btn" data-id={fr.id} onClick={rejectFr}>
                    Reject
                  </button>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="fr-div">No friend requests</div>
      )}
    </div>
  );

  const userMenu = (
    <div id="user-menu">
      <div>
        <Link to="/update-account">Update Account</Link>
      </div>
      <div>
        <button onClick={handleLogout}>Log Out</button>
      </div>
    </div>
  );

  const userDiv = currentUser && (
    <>
      <Link to={`/profile/${currentUser.uid}`}>Profile</Link>
      <div>Friends</div>
      <div
        id="fr"
        onMouseOver={viewFRMenu}
        onMouseLeave={() => setShowFRMenu(false)}
      >
        <div className="fr-nav">
          <div className="fr-nav-text">Friend Requests</div>
          {fRAlert > 0 && <div className="new-fr-alert">{fRAlert}</div>}
        </div>
        {showFRMenu && fReqMenu}
      </div>
      <div
        className="user-info"
        onClick={() => {
          setShowMenu(!showMenu);
        }}
        onMouseOver={() => setShowMenu(true)}
        onMouseLeave={() => setShowMenu(false)}
      >
        <div id="user-info-nav">
          {currentUser && (
            <img className="profile-pic" src={photo} alt="profile" />
          )}
          {currentUser && name}
        </div>
        {showMenu && userMenu}
      </div>
      {error && <div>error</div>}
    </>
  );
  return (
    <nav>
      <div id="logo">
        <h2>MyPage</h2>
      </div>

      <div id="user-div">{currentUser && userDiv}</div>
    </nav>
  );
};

export default Navigation;
