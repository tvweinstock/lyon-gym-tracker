import React, { useState, useEffect } from 'react';

const Header = () => {
  const [lastVisitedTime, setLastVisitedTime] = useState();
  // on initial load - do not bother keeping local storage up to date during a session, just record once at the start
  useEffect(() => {
    const lastVisitedTime = localStorage.getItem('time-visited');
    setLastVisitedTime(lastVisitedTime ? new Date(lastVisitedTime) : null);
    localStorage.setItem('time-visited', new Date().toISOString());
  }, []);
  return (
    <header>
      <h1>
        Last Visited at:{' '}
        {lastVisitedTime ? lastVisitedTime.toString() : "You're new, welcome!"}
      </h1>
    </header>
  );
};

export default Header;
