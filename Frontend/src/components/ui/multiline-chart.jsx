import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';


const MultiLineChart = ({matches}) => {

  const data = [
    { name: 'Mon', pingPong: 2, ticTacToe: 2 },
    { name: 'Tue', pingPong: 3, ticTacToe: 6 },
    { name: 'Wed', pingPong: 8, ticTacToe: 2 },
    { name: 'Thu', pingPong: 3, ticTacToe: 3 },
    { name: 'Fri', pingPong: 3, ticTacToe: 8 },
    { name: 'Sat', pingPong: 7, ticTacToe: 10 },
    { name: 'Sun', pingPong: 12, ticTacToe: 9 },
  ];

  return (

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="pingPong" stroke="#8884d8" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="ticTacToe" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>

  );
};

export default MultiLineChart;