import Header from './components/Header';
import Sidebar from './components/Sidebar';

export default function App () {
  return (
    <div className="relative w-full mx-auto h-[1080px] bg-white">
      <Header />
      <Sidebar />
    </div>
  );
}