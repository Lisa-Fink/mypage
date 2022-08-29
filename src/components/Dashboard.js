import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from './firebaseConfig';
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { Link } from 'react-router-dom';

import '../styles/dashboard.css';

const Dashboard = () => {
  const { currentUser, userData } = useAuth();

  const [error, setError] = useState('');
  const [activityLoad, setActivityLoad] = useState('');
  const [activityFeed, setActivityFeed] = useState({});
  const [nameLookUp, setNameLookup] = useState({});
  const [pokes, setPokes] = useState([]);

  useEffect(() => {
    // get user's pokes
    const pokes = userData.pokes;
    pokes && pokes.length && setPokes(pokes);

    const getFriendsData = async () => {
      try {
        setError('');
        setActivityLoad('');
        // get friends ids
        const friendsIDs = userData.friends;
        // get each friend's wall
        if (friendsIDs) {
          const tempActivity = {};
          const tempNameLookup = {};
          for (const friendID of friendsIDs) {
            const friendRef = doc(db, 'users', friendID);
            const friendSnap = await getDoc(friendRef);
            const friendWall = friendSnap.data().wall;
            const name = `${friendSnap.data().first} ${friendSnap.data().last}`;
            tempNameLookup[friendID] = name;

            for (let date in friendWall) {
              for (let index in friendWall[date]) {
                if (typeof friendWall[date][index] === 'string') {
                  friendWall[date][index] = {
                    type: 'string',
                    string: friendWall[date][index],
                  };
                }
                friendWall[date][index].userID = friendID;
              }
              if (tempActivity.hasOwnProperty(date)) {
                tempActivity[date] = [
                  ...tempActivity[date],
                  ...friendWall[date],
                ];
              } else {
                tempActivity[date] = friendWall[date];
              }
            }
          }
          setActivityFeed(tempActivity);
          setNameLookup(tempNameLookup);
        } else {
          setActivityFeed(false);
        }
      } catch {
        setError('Failed to retrieve data');
      }
    };

    Object.keys(userData).length
      ? getFriendsData()
      : setActivityLoad('Loading...');
  }, [userData]);

  const handleDismiss = (poke) => {
    const docRef = doc(db, 'users', currentUser.uid);
    // remove the poke from the current user
    try {
      error && setError('');
      updateDoc(docRef, {
        pokes: arrayRemove(poke),
      });
      let copy = pokes.filter((p) => p.id !== poke.id);
      setPokes(copy);
    } catch {
      setError('failed to remove poke');
    }
  };

  const handlePokeBack = (poke) => {
    // poke user
    const pokeRef = doc(db, 'users', poke.id);
    updateDoc(pokeRef, {
      pokes: arrayUnion({
        id: currentUser.uid,
        name: `${userData.first} ${userData.last}`,
      }),
    });
    // remove poke
    handleDismiss(poke);
  };

  // wall obj type: friend, post, string, profile-pic
  // friend: user1 is a name -userID, user2 is a name-friendID
  // post: name, string, user:the one who posted, userID
  // string: string, userID. output: userID activity: string

  const dates =
    Object.keys(activityFeed).length && Object.keys(activityFeed).length > 100
      ? Object.keys(activityFeed).slice(100)
      : Object.keys(activityFeed);
  // sort dates
  const parseDate = (str) => {
    return parseInt(str.split('-').reduce((a, b) => a + b));
  };
  dates.sort((a, b) => parseDate(b) - parseDate(a));

  const activity =
    !activityFeed | !Object.keys(activityFeed).length ? (
      <div>nothing here...</div>
    ) : (
      <div className="activity-inner-container">
        {dates.map((date, index) => (
          <div key={index}>
            <div className="activity-date">{date}</div>
            {activityFeed[date].map((obj, index2) => (
              <div className="activity" key={index - index2}>
                {obj.type === 'friend' ? (
                  <div>
                    <Link to={`/profile/${obj.userID}`}>{obj.user1}</Link> is
                    now friends with{' '}
                    <Link to={`/profile/${obj.friendID}`}>{obj.user2}</Link>!!
                  </div>
                ) : obj.type === 'post' ? (
                  <div>
                    <Link to={`/profile/${obj.user}`}>{obj.name}</Link> posted
                    on{' '}
                    <Link to={`/profile/${obj.userID}`}>
                      {nameLookUp[obj.userID]}'
                      {nameLookUp[obj.userID].slice(-1) !== 's' && 's'}
                    </Link>{' '}
                    wall:
                    <div className="activity-wall-post">{obj.string}</div>
                  </div>
                ) : obj.type === 'profile-pic' ? (
                  <div className="dashboard-profile-pic-div">
                    <div>
                      <Link to={`/profile/${obj.userID}`}>
                        {nameLookUp[obj.userID]}
                      </Link>{' '}
                      {obj.string}
                    </div>
                    <img
                      src={obj.photo}
                      className="dashboard-photo-thumbnail"
                      alt="profile thumbnail"
                    />
                  </div>
                ) : (
                  <div>
                    <Link to={`/profile/${obj.userID}`}>
                      {nameLookUp[obj.userID]}
                    </Link>{' '}
                    activity: {obj.string}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}{' '}
      </div>
    );

  const pokeInfo = !pokes.length ? (
    <div className="poke-box poke-text empty">No Pokes</div>
  ) : (
    pokes.map((poke) => (
      <div className="poke-box" key={poke.id}>
        <div className="poke-text">
          <Link to={`/profile/${poke.id}`}>{poke.name}</Link> has poked you!!
        </div>
        <div className="poke-btns">
          <button
            className="poke-btn"
            onClick={() => {
              handlePokeBack(poke);
            }}
          >
            Poke Back
          </button>
          <button
            className="poke-btn"
            onClick={() => {
              handleDismiss(poke);
            }}
          >
            Dismiss
          </button>
        </div>
      </div>
    ))
  );

  const showPokes = () => {
    const pokes = document.getElementById('poke');
    const activity = document.getElementById('activity');

    pokes.style.display = 'block';
    activity.style.display = 'none';
  };

  const showActivity = () => {
    const pokes = document.getElementById('poke');
    const activity = document.getElementById('activity');

    pokes.style.display = 'none';
    activity.style.display = 'block';
  };

  const pokeOption = (
    <div className="poke-option">
      <h3>
        You've been poked!{' '}
        <button onClick={showPokes} className="poke-btn">
          view pokes
        </button>
      </h3>
    </div>
  );

  const activityOption = (
    <div className="activity-option">
      <h3>
        <button className="poke-btn activity-btn" onClick={showActivity}>
          Show Activity Feed
        </button>
      </h3>
    </div>
  );

  return (
    <div>
      <h2>Dashboard</h2>
      {error && error}
      <div className="dashboard-container">
        <div className="left-dashboard">
          <h2>MyPage News and Updates:</h2>
          <div>Thanks for using MyPage!</div>
          <div>Check back daily to see what your friends are up to!</div>
        </div>
        <div className="center-dashboard" id="activity">
          <div>
            {pokes.length > 0 && pokeOption}
            <h3>Activity Feed</h3>

            <div className="activity-container">
              {activityLoad ? activityLoad : activity}
            </div>
          </div>
        </div>
        <div className="right-dashboard" id="poke">
          <div className="poke-container">
            {activityOption}
            <h3>Pokes</h3>
            <div>{pokeInfo}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
