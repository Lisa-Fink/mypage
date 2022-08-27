import React, { useState, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc, arrayUnion } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

import { storage } from './firebaseConfig';
import { ref, uploadBytes } from 'firebase/storage';

import '../styles/profile.css';

const EditProfile = () => {
  const original = useRef({});

  const onLoad = useRef(true);

  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [work, setWork] = useState({ title: '', company: '' });
  const [location, setLocation] = useState({ city: '', state: '' });
  const [status, setStatus] = useState('');
  const [photo, setPhoto] = useState('');
  const [wall, setWall] = useState({});

  const [imageUpload, setImageUpload] = useState(null);
  const [photoStatus, setPhotoStatus] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { currentUser } = useAuth();

  const navigate = useNavigate();

  const getUserData = async () => {
    const docRef = doc(db, 'users', currentUser.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setError('');
      const firstName = docSnap.data().first;
      const lastName = docSnap.data().last;
      setFirst(firstName);
      setLast(lastName);
      const title =
        docSnap.data().work && docSnap.data().work.title
          ? docSnap.data().work.title
          : '';
      const company =
        docSnap.data().work && docSnap.data().work.company
          ? docSnap.data().work.company
          : '';
      setWork({ title: title, company: company });
      const city =
        docSnap.data().location && docSnap.data().location.city
          ? docSnap.data().location.city
          : '';
      const state =
        docSnap.data().location && docSnap.data().location.state
          ? docSnap.data().location.state
          : '';
      setLocation({ city: city, state: state });
      const statusStr = docSnap.data().status ? docSnap.data().status : '';
      setStatus(statusStr);
      setPhoto(docSnap.data().profilePic);
      setWall(docSnap.data().wall);
      if (onLoad.current) {
        onLoad.current = false;
        // store the original values
        original.current = {
          first: firstName,
          last: lastName,
          work: { title: title, company: company },
          location: { city: city, state: state },
          status: statusStr,
        };
      }
    } else {
      setError('Error retrieving profile');
    }
  };

  const date = new Date();
  const [month, day, year] = [
    date.getMonth(),
    date.getDate(),
    date.getFullYear(),
  ];
  const formattedDate = `${month + 1}-${day}-${year}`;

  useEffect(() => {
    getUserData();
  }, [currentUser.uid]);

  const handleSubmit = async (e) => {
    setLoading(true);
    // TODO: update wall. on load save each variable, on submit check if changed
    // and update wall feed if changed
    e.preventDefault();
    let newInfo = { work: {}, location: {} };

    // adding any changes to newInfo
    if (first !== original.current.first) {
      newInfo.first = first;
      newInfo.first_lower = first.toLowerCase();
    }
    if (last !== original.current.last) {
      newInfo.last = last;
      newInfo.last_lower = last.toLowerCase();
    }
    if (work.title !== original.current.work.title) {
      newInfo.work.title = work.title;
    }
    if (work.company !== original.current.work.company) {
      newInfo.work.company = work.company;
    }
    if (location.city !== original.current.location.city) {
      newInfo.location.city = location.city;
    }
    if (location.state !== original.current.location.state) {
      newInfo.location.state = location.state;
    }
    if (status !== original.current.status) {
      newInfo.status = status;
    }
    if (!newInfo.work) {
      delete newInfo.work;
    }

    // checks if location and work changed
    if (!Object.keys(newInfo.location).length) {
      delete newInfo.location;
    }
    if (!Object.keys(newInfo.work).length) {
      delete newInfo.work;
    }

    // checks if any changes were made
    if (!Object.keys(newInfo).length) {
      navigate(`/profile/${currentUser.uid}`);
    }

    // updates wall with changes

    let updatedName = false;
    for (const key of Object.keys(newInfo)) {
      let str = null;
      if (!updatedName) {
        if ((key === 'first') | (key === 'last')) {
          str = `Changed name to ${first} ${last}`;
          updatedName = true;
        } else if (key === 'work') {
          str = `Changed job to ${work.title} at ${work.company}`;
        } else if (key === 'location') {
          str = `Changed location to ${location.city}, ${location.state}`;
        } else if (key === 'status') {
          str = `Changed status to ${status}`;
        }
        if (wall[formattedDate]) {
          wall[formattedDate].push(str);
        } else {
          wall[formattedDate] = [str];
        }
      }
      newInfo.wall = wall;

      try {
        error && setError('');

        await setDoc(doc(db, 'users', currentUser.uid), newInfo, {
          merge: true,
        });
        navigate(`/profile/${currentUser.uid}`);
      } catch {
        setError('Failed to update Profile');
      }
      setLoading(false);
    }
  };

  const resetForm = (e) => {
    e.preventDefault();
    getUserData();
  };

  const cancelForm = (e) => {
    e.preventDefault();
    navigate(`/profile/${currentUser.uid}`);
  };

  const uploadImage = async () => {
    if (imageUpload === null) {
      return;
    }

    setPhotoStatus('Uploading...');
    const docRef = doc(db, 'users', currentUser.uid);
    const dateStr = Date.now();
    const img = `profile-pics/${currentUser.uid}/${dateStr}`;
    const imageRef = ref(storage, img);
    let imgStr = null;
    try {
      // upload to cloud storage
      await uploadBytes(imageRef, imageUpload);

      // save string of link to image to image in user's firestore
      const fullImg =
        'https://firebasestorage.googleapis.com/v0/b/mypage-15a7a.appspot.com/o/profile-pics%2F' +
        currentUser.uid +
        '%2F' +
        dateStr +
        '?alt=media&token=1914e966-c1ee-4b7b-96f0-4f34da2b4bc8';
      // stores the image address to access after try / catch completes
      imgStr = fullImg;

      await setDoc(
        docRef,
        { profilePic: fullImg },
        {
          merge: true,
        }
      );

      setPhoto(fullImg);

      setPhotoStatus('Successfully changed profile picture');
    } catch {
      setPhotoStatus('Failed to upload photo');
    }

    // create a wall post with new photo
    const wallAddition = {};
    wallAddition[formattedDate] = arrayUnion({
      type: 'profile-pic',
      photo: imgStr,
      string: 'Changed profile picture',
    });

    setDoc(docRef, { wall: wallAddition }, { merge: true });
  };

  return (
    <div>
      <h1 id="profile-h1">Edit Profile</h1>{' '}
      <div className="profile-container">
        <div className="profile-left">
          <div id="pic-div">
            <img id="pic-img" src={photo} alt="profile" />
          </div>
          <div id="edit-photo">
            <h4>Change Profile Pic</h4>
            {photoStatus}
            <div className="change-photo-div">
              <input
                className="photo-input"
                type="file"
                onChange={(e) => {
                  setImageUpload(e.target.files[0]);
                }}
              />
            </div>
            <div>
              <button
                className="profile-btn edit-photo-btn"
                onClick={uploadImage}
              >
                Change Profile Pic
              </button>
            </div>
          </div>
        </div>
        <div className="profile-middle">
          {error && error}
          <form id="user-info" onSubmit={handleSubmit}>
            <div className="edit">
              <div>
                <label>
                  First Name*:{' '}
                  <input
                    required
                    value={first}
                    onChange={(e) => setFirst(e.target.value)}
                  />
                </label>
              </div>
              <div>
                <label>
                  Last Name*:{' '}
                  <input
                    required
                    value={last}
                    onChange={(e) => setLast(e.target.value)}
                  />
                </label>
              </div>
            </div>

            <div className="edit">
              <div>
                <label>
                  City:{' '}
                  <input
                    value={location.city}
                    onChange={(e) =>
                      setLocation({
                        state: location.state,
                        city: e.target.value,
                      })
                    }
                  />
                </label>
              </div>
              <div>
                <label>
                  {/* TODO change input to drop-down menu */}
                  State:
                  <input
                    maxLength={2}
                    value={location.state}
                    onChange={(e) =>
                      setLocation({
                        city: location.city,
                        state: e.target.value,
                      })
                    }
                  />
                </label>
              </div>
            </div>

            <div className="edit">
              <div>
                <label>
                  Job Title:
                  <input
                    value={work.title}
                    onChange={(e) =>
                      setWork({ company: work.company, title: e.target.value })
                    }
                  />
                </label>
              </div>{' '}
              <div>
                <label>
                  at{' '}
                  <input
                    value={work.company}
                    onChange={(e) =>
                      setWork({ title: work.title, company: e.target.value })
                    }
                  />
                </label>
              </div>
            </div>

            <div className="edit">
              <div>
                <label>
                  Status (140 characters max):{' '}
                  <textarea
                    id="status"
                    required
                    maxLength={140}
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value);
                    }}
                  />
                </label>
              </div>
            </div>
            <div className="edit-btns">
              <button
                disabled={loading}
                id="submit-edit"
                className="profile-btn"
              >
                Save
              </button>
              <button
                id="reset-edit"
                className="profile-btn"
                onClick={resetForm}
              >
                Reset
              </button>
              <button
                id="cancel-edit"
                className="profile-btn"
                onClick={cancelForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
