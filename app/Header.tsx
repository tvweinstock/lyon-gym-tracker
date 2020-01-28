import React, { useEffect } from 'react';
import { useLocalStorage } from 'react-use';

const Header = () => {
  const currentTime = new Date();
  const dateString = currentTime.toDateString();
  const timeString = currentTime.toLocaleTimeString();
  const [visitedTime, setVisitedTime] = useLocalStorage(
    'time-visited',
    `${dateString} at ${timeString}`
  );
  useEffect(() => {
    setVisitedTime(`${dateString} at ${timeString}`);
  }, []);
  return (
    <header>
      <h1>Last Visited at: {visitedTime}</h1>
    </header>
  );
};

export default Header;
