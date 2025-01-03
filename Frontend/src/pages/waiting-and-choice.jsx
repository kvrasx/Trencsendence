import { Button } from '@/components/ui/button';
import { RiWifiOffLine } from "react-icons/ri";
import { GiPerspectiveDiceSixFacesRandom } from "react-icons/gi";
import { GiTabletopPlayers } from "react-icons/gi";

export default function Error404() {
    return (
        <div className="flex flex-col items-center justify-center max-h-screen overflow-hidden text-foreground">
            <div className='border-y-2 border-white bg-white bg-opacity-10 border-opacity-40 rounded-lg w-full flex items-center justify-center space-x-20 h-[70vh]'>
                <div className='inline space-y-4'>
                    <div className='border-y-2 border-white border-opacity-40 rounded-lg white w-72 h-80 flex justify-center items-center'>
                        <RiWifiOffLine className='size-44 animate-pulse'/>
                    </div>
                    <div className='flex justify-center items-center'>
                        <button className='border-y-4 border-red-700 w-48 h-14 rounded-lg text-2xl hover:border-y-4 hover:border-blue-600 '>
                                local mode
                        </button>
                    </div>
                </div>
                <div className='inline space-y-4'>
                    <div className='border-y-2 p-3 flex space-x-3 justify-center items-center border-white border-opacity-40 rounded-lg white w-72 h-80'>
                            <div className='w-28 h-full flex justify-center items-center'><GiPerspectiveDiceSixFacesRandom className='size-28 hover:animate-spin'/></div>
                            <div className='border border-white h-full rounded-lg border-opacity-55'></div>
                            <div className='w-28 h-full flex justify-center items-center'><GiTabletopPlayers className='size-28'/></div>
                    </div>
                    <div className='flex justify-center items-center space-x-7'>
                        <button className='border-y-4 border-green-700 w-32 h-14 rounded-lg text-lg hover:border-y-4 hover:border-blue-600 '>
                                random match
                        </button>
                        <button className='border-y-4 border-green-700 w-32 h-14 rounded-lg text-lg hover:border-y-4 hover:border-blue-600 '>
                                vs friend
                        </button>
                    </div>
                </div>
            </div>
            {/* <h1 className="text-6xl font-bold text-primary">404</h1>
            <p className="mt-4 text-xl text-muted-foreground">Page Not Found</p>
            <Button className="mt-6" onClick={() => window.location.href = '/'}>
                Go Home
            </Button> */}
        </div>
    );
}