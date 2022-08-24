import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import '../styles/profile.css';

const Profile = () => {
  let { id } = useParams();

  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [work, setWork] = useState([]);
  const [location, setLocation] = useState({});
  const [status, setStatus] = useState('');
  const [photo, setPhoto] = useState('');
  const [wall, setWall] = useState({});
  const [error, setError] = useState('');
  const [friends, setFriends] = useState([]);

  const { currentUser } = useAuth();

  useEffect(() => {
    const docFunc = async () => {
      const docRef = doc(db, 'users', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setError('');
        setFirst(docSnap.data().first);
        setLast(docSnap.data().last);
        setWork(docSnap.data().work);
        setLocation(docSnap.data().location);
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

  const actionDiv = (
    <div id="actions">
      {currentUser.uid !== id ? (
        <>
          <button className="profile-btn">Add as friend</button>
          <button className="profile-btn">Poke</button>
        </>
      ) : (
        <Link to="/edit-profile">
          <div className="profile-btn">Edit Profile</div>
        </Link>
      )}
    </div>
  );

  const dates = Object.keys(wall);
  // sort dates
  const parseDate = (str) => {
    return parseInt(str.split('-').reduce((a, b) => a + b));
  };
  dates.sort((a, b) => parseDate(b) - parseDate(a));

  const wallDiv = !dates.length ? (
    <div className="wall-activity">Nothing here....</div>
  ) : (
    dates.map((date, index) => (
      <div key={index}>
        <div className="wall-date">{date}</div>
        {/* Create a shallow copy and reverse to preserve chronological order */}
        {wall[date]
          .slice(0)
          .reverse()
          .map((activity, index2) => (
            <div key={`${index}-${index2}`} className="wall-activity">
              {activity}
            </div>
          ))}
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
          <div id="friend-div">
            <div>{friends.length} Friends</div>
            {currentUser.uid !== id && <div>Friends in Common</div>}
            <button className="profile-btn">View Friends</button>
            {actionDiv}
          </div>
        </div>
        <div className="profile-middle">
          {error && error}
          <div id="user-info">
            <div id="name">
              {first} {last}
            </div>
            {location && (
              <div className="location-div">
                {location.city}, {location.state}
              </div>
            )}
            {work && (
              <div className="work-div">
                {work.title} at {work.company}
              </div>
            )}
            {status && <div className="status-div">{status}</div>}
            <div className="wall">
              <div id="wall-name">{first}'s Wall</div>
              {wallDiv}
            </div>
          </div>
        </div>
        {actionDiv}
      </div>
      {/* <div className="profile-container"></div> */}
    </div>
  );
};

export default Profile;
