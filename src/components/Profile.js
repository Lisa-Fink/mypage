import React, { useState, useEffect } from 'react';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
} from 'firebase/firestore';
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
  const [mutualFriends, setMutualFriends] = useState(0);
  const [friendsWith, setFriendsWith] = useState(false);

  const { currentUser, userData } = useAuth();

  useEffect(() => {
    if (currentUser.uid === id && Object.keys(userData).length) {
      setError('');
      setFirst(userData.first);
      setLast(userData.last);
      setWork(userData.work);
      setLocation(userData.location);
      setStatus(userData.status);
      setPhoto(userData.profilePic);
      userData.wall && setWall(userData.wall);
      userData.friends && setFriends(userData.friends);
    } else {
      const docFunc = () => {
        onSnapshot(doc(db, 'users', id), (docSnap) => {
          if (docSnap.exists()) {
            setError('');
            setFirst(docSnap.data().first);
            setLast(docSnap.data().last);
            setWork(docSnap.data().work);
            setLocation(docSnap.data().location);
            setStatus(docSnap.data().status);
            setPhoto(docSnap.data().profilePic);
            docSnap.data().wall && setWall(docSnap.data().wall);
            const friendList = docSnap.data().friends;
            friendList && setFriends(friendList);

            if (Object.keys(userData).length) {
              const compare = compareFriends(friendList, id, userData.friends);
              compare.both.length && setMutualFriends(compare.both.length);
              compare.areFriends && setFriendsWith(true);
            }
          } else {
            setError('Error retrieving profile');
          }
        });
      };
      docFunc();
    }
  }, [id]);

  const compareFriends = (profileFL, profileid, userFL) => {
    let userFLdict = {};
    let both = [];
    let areFriends = false;

    for (let i = 0; i < userFL.length; i++) {
      userFLdict[userFL[i]] = true;
      if (userFL[i] === profileid) {
        areFriends = true;
      }
    }
    for (let j = 0; j < profileFL.length; j++) {
      userFLdict.hasOwnProperty(profileFL[j]) && both.push(profileFL[j]);
    }
    return { both, areFriends };
  };

  const removeFriend = () => {
    try {
      const docRef = doc(db, 'users', currentUser.uid);
      const friendRef = doc(db, 'users', id);

      // remove profile id current users friends
      updateDoc(docRef, {
        friends: arrayRemove(id),
      });

      //remove current user from profiles friends
      updateDoc(friendRef, {
        friends: arrayRemove(currentUser.uid),
      });
      updateFriends();
      setFriendsWith(false);
    } catch {
      setError('Failed to remove friend');
    }
  };

  const addFriend = () => {
    try {
      // creates date for wall
      const date = new Date();
      const [month, day, year] = [
        date.getMonth(),
        date.getDate(),
        date.getFullYear(),
      ];
      const formattedDate = `${month + 1}-${day}-${year}`;
      const wallAddition = {};
      wallAddition[formattedDate] = arrayUnion(
        `${userData.first} ${userData.last} and ${first} ${last} are friends!`
      );

      const docRef = doc(db, 'users', currentUser.uid);
      const friendRef = doc(db, 'users', id);
      // if already have a fr, accept fr, add as friends to user and profile
      const userFRIDs = userData.requests.map((obj) => {
        return obj.id;
      });
      const hasFR = userFRIDs.includes(id);
      if (hasFR) {
        // add friend to current user
        updateDoc(docRef, {
          friends: arrayUnion(id),
        });
        // update wall of current user
        setDoc(
          docRef,
          {
            wall: wallAddition,
          },
          { merge: true }
        );
        // remove the fr from current user
        updateDoc(docRef, {
          requests: arrayRemove({ id: id, new: false }),
        });
        updateDoc(docRef, {
          requests: arrayRemove({ id: id, new: true }),
        });

        // add current user as a friend to user of the fr
        updateDoc(friendRef, {
          friends: arrayUnion(currentUser.uid),
        });
        // update wall of friend added
        wallAddition[formattedDate] = arrayUnion(
          `${first} ${last} and ${userData.first} ${userData.last} are friends!`
        );
        setDoc(
          friendRef,
          {
            wall: wallAddition,
          },
          { merge: true }
        );

        updateFriends();
        setFriendsWith(true);
      }
      // else add current user id as a new fr
      else {
        updateDoc(friendRef, {
          requests: arrayUnion({ id: currentUser.uid, new: true }),
        });
      }
    } catch {
      setError('Failed to add friend');
    }
  };

  const updateFriends = async () => {
    try {
      // get the profile id's friends list
      const docRef = doc(db, 'users', id);
      const docSnap = await getDoc(docRef);
      // update the state
      setFriends(docSnap.data().friends);
    } catch {
      setError('Failed to retrieve friend list');
    }
  };

  const actionDiv = (
    <div id="actions">
      {currentUser.uid !== id ? (
        <>
          {friendsWith ? (
            <button onClick={removeFriend} className="profile-btn">
              Remove as friend
            </button>
          ) : (
            <button onClick={addFriend} className="profile-btn">
              Add as friend
            </button>
          )}
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
            <div>
              {friends.length} {friends.length === 1 ? 'Friend' : 'Friends'}
            </div>
            {currentUser.uid !== id && (
              <div>
                {mutualFriends}{' '}
                {mutualFriends.length === 1 ? 'Friend' : 'Friends'} in Common
              </div>
            )}
            <Link to={`/friends/${id}`}>
              <button className="profile-btn">View Friends</button>
            </Link>
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
