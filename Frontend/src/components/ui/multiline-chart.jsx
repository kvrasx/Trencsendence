import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { subDays, parseISO, isAfter, format } from 'date-fns';

const MultiLineChart = ({ matches, user }) => {
  console.log(matches);

  // getting the date 7 days ago
  const oneWeekAgo = subDays(new Date(), 7);

  // filtering matches for the latest week
  const latestWeekMatches = matches.filter(match => 
    isAfter(parseISO(match.match_date), oneWeekAgo)
  );

  // initializing wins object for each day of the week
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const winsByDay = daysOfWeek.reduce((acc, day) => {
    acc[day] = { pingPong: 0, ticTacToe: 0 };
    return acc;
  }, {});

  // counting wins for each game type by day
  latestWeekMatches.forEach(match => {
    const day = format(parseISO(match.match_date), 'EEE'); // Get the day of the week where the match was played (in the same format as daysOfWeek)
    if (match.game_type === 1 && match.winner === user.id) {
      winsByDay[day].pingPong += 1;
    } else if (match.game_type === 2 && match.winner === user.id) {
      winsByDay[day].ticTacToe += 1;
    }
  });

  // preparing data for the chart (eg: [{ name: 'Sun', pingPong: 2, ticTacToe: 1 }, ...])
  const data = daysOfWeek.map(day => ({
    name: day,
    pingPong: winsByDay[day].pingPong,
    ticTacToe: winsByDay[day].ticTacToe,
  }));

  return (
    <div className="flex-1 w-full h-full p-4 -ml-12">

    <ResponsiveContainer width="100%" height={"100%"}>
      <LineChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="pingPong" stroke="#8884d8" activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="ticTacToe" stroke="#82ca9d" />
      </LineChart>
    </ResponsiveContainer>
    </div>
  );
};

export default MultiLineChart;