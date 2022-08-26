import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

import '../styles/search.css';

const Search = () => {
  let { searchQuery } = useParams();

  const [searchResults, setSearchResults] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (searchQuery) {
      const searchQuerySplit = searchQuery.split('+');
      const searchQueryLower = searchQuerySplit.map((word) => {
        return (word = word.toLowerCase());
      });
      const resultsObj = {};
      const results = [];
      const userSearch = async () => {
        const exact =
          searchQueryLower.length > 1
            ? query(
                collection(db, 'users'),
                where('first_lower', '==', searchQueryLower[0]),
                where('last_lower', '==', searchQueryLower[1])
              )
            : query(
                collection(db, 'users'),
                where('first_lower', '==', searchQueryLower[0])
              );
        const first = query(
          collection(db, 'users'),
          where('first_lower', 'in', searchQueryLower)
        );
        const last = query(
          collection(db, 'users'),
          where('last_lower', 'in', searchQueryLower)
        );

        const querySnapshot = await getDocs(exact);
        querySnapshot.forEach((doc) => {
          const data = { id: doc.id, ...doc.data() };
          resultsObj[doc.id] = data;
          results.push(data);
        });
        const querySnapshotFirst = await getDocs(first);
        querySnapshotFirst.forEach((doc) => {
          if (!resultsObj.hasOwnProperty(doc.id)) {
            const data = { id: doc.id, ...doc.data() };
            resultsObj[doc.id] = { data };
            results.push(data);
          }
        });

        const querySnapshotLast = await getDocs(last);
        querySnapshotLast.forEach((doc) => {
          if (!resultsObj.hasOwnProperty(doc.id)) {
            results.push({ id: doc.id, ...doc.data() });
          }
        });
        setSearchResults(results);
      };
      userSearch();
    }
  }, [searchQuery]);

  return (
    <div>
      <h1>Search Results</h1>
      <div className="search-div">
        {searchResults && searchResults.length > 0
          ? searchResults.map((user) => {
              return (
                <div
                  key={user.id}
                  className="search-card"
                  onClick={() => navigate(`/profile/${user.id}`)}
                >
                  <img
                    className="search-thumbnail"
                    src={user.profilePic}
                    alt="thumbnail"
                  />
                  <div className="search-text">
                    {user.first} {user.last}
                  </div>
                </div>
              );
            })
          : 'No results :-('}
      </div>
    </div>
  );
};

export default Search;
