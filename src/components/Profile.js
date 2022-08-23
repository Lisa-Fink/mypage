import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { useParams } from 'react-router-dom';

import '../styles/profile.css';

const Profile = () => {
  let { id } = useParams();

  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [work, setWork] = useState('');
  const [status, setStatus] = useState('');
  const [photo, setPhoto] = useState('');
  const [wall, setWall] = useState([]);
  const [error, setError] = useState('');
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const docFunc = async () => {
      const docRef = doc(db, 'users', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setError('');
        setFirst(docSnap.data().first);
        setLast(docSnap.data().last);
        setWork(docSnap.data().work);
        setStatus(docSnap.data().status);
        setPhoto(docSnap.data().profilePic);
        docSnap.data().wall && setWall(docSnap.data().wall);
        docSnap.data().friends && setFriends(docSnap.data().friends);
      } else {
        setError('Error retrieving profile');
      }
    };
    docFunc();
  }, [id]);

  const wallDiv = !wall.length ? (
    <div className="wall-activity">Nothing here....</div>
  ) : (
    wall.map((activity, index) => (
      <div key={index}>
        <div className="wall-date">{activity.date}</div>
        <div className="wall-activity">{activity.activity}</div>
      </div>
    ))
  );

  return (
    <div>
      <div className="profile-container">
        <div className="profile-left">
          <div id="pic-div">
            <img id="pic-img" src={photo} alt="profile" />
          </div>
        </div>
        <div className="profile-middle">
          {error && error}
          <div id="user-info">
            <div id="name">
              {first} {last}
            </div>
            {work && <div className="work-div">{work}</div>}
            {status && <div className="status-div">Status: {status}</div>}
          </div>
        </div>
        <div id="actions">
          {/* if profile is your profile show edit button */}
          <button>Add as friend</button>
          <button>Poke</button>
        </div>
      </div>
      <div className="profile-container">
        <div id="friend-div">
          <div>{friends.length} Friends</div>
          <div>Friends in Common</div>
          <button>View All Friends</button>
          <button>Add as Friends</button>
        </div>
        <div className="wall">
          <div id="wall-name">{first}'s Wall</div>
          {wallDiv}
        </div>
      </div>
    </div>
  );
};

export default Profile;
