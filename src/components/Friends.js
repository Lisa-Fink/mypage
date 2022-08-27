import React from 'react';
import { getDoc, doc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { useParams, useNavigate } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import getFriendInfo from './FriendInfo';

import '../styles/friends.css';

const Friends = () => {
  // const { userData } = useAuth();
  const navigate = useNavigate();

  const { id } = useParams();

  const [idName, setIDName] = useState('');
  const [flData, setFLData] = useState([]);

  useEffect(() => {
    const getFLInfo = async () => {
      // get id's name and friend list
      const docRef = doc(db, 'users', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        // get and store the id's name
        const first = docSnap.data().first;
        const last = docSnap.data().last;
        const nameStr = `${first} ${last}`;
        setIDName(nameStr);

        // get and store the name and pic for each friend
        const friendIDs = docSnap.data().friends ? docSnap.data().friends : [];

        const getInfo = async () => {
          const fIDinfo = [];
          for (const fID of friendIDs) {
            const info = await getFriendInfo(fID);
            info.id = fID;
            info !== 'error' && fIDinfo.push(info);
          }
          return fIDinfo;
        };
        const flInfo = await getInfo();
        setFLData(flInfo);
      }
    };
    getFLInfo();
    return () => {};
  }, [id]);

  return (
    <div>
      <h1>Friends of {idName}</h1>
      <div className="friend-div">
        {flData && flData.length
          ? flData.map((fObj) => {
              return (
                <div
                  onClick={() => {
                    navigate(`/profile/${fObj.id}`);
                  }}
                  className="friend-card"
                  key={fObj.id}
                >
                  <img
                    className="friends-thumbnail"
                    src={fObj.photo}
                    alt="thumbnail"
                  />
                  {fObj.name}
                </div>
              );
            })
          : 'Nothing here...'}
      </div>
    </div>
  );
};

export default Friends;
