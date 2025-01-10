
import Cookies from 'js-cookie';
import {refreshAuthToken} from './ft_axios';
import { toast } from 'react-toastify';

export default function connect_websocket(url, closeOrError) {

    const token = Cookies.get('access_token');
    const newSocket = new WebSocket(url + `?token=${token}`);
    
    newSocket.onerror = (error) => {
        console.log('WebSocket error:', error);
        closeOrError && closeOrError();
    };

    newSocket.onclose = async (event) => {
        console.log('WebSocket connection closed', event.code);
        if (event.code == 4008) {
            try {
                await refreshAuthToken();
                return connect_websocket(url, closeOrError);
            } catch (e) {
                toast.error("You are not authorized.");
                window.location.href = '/login';
            }
        }
        else if (event.code == 4009) {
            console.log('User already in another game');
        }
        else
            console.log('WebSocket connection closed', event.code);
            closeOrError && closeOrError();
        };

    return newSocket;

};