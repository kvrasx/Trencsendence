import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', pingPong: 30, ticTacToe: 20 },
  { name: 'Feb', pingPong: 20, ticTacToe: 25 },
  { name: 'Mar', pingPong: 27, ticTacToe: 22 },
  { name: 'Apr', pingPong: 18, ticTacToe: 28 },
  { name: 'May', pingPong: 23, ticTacToe: 20 },
  { name: 'Jun', pingPong: 34, ticTacToe: 30 },
];

const MultiLineChart = () => {
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