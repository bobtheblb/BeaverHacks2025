import { useEffect } from 'react';
import { useNavigate } from 'react-router';

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleSpace = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        navigate('/rhythm');
      }
    };

    window.addEventListener('keydown', handleSpace);
    return () => window.removeEventListener('keydown', handleSpace);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 overflow-hidden">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-0 font-borel">
            deus.mu
        </h1>
        
        <p className="text-xl mb-4">
            Unlock Your Inner Maestro.
        </p>


      <button
        className="btn btn-neutral px-6 py-3 text-lg transition-transform duration-200 hover:scale-105 hover:bg-neutral-focus"
        onClick={() => navigate('/rhythm')}
        >
            Press space to start
        </button>

    </div>
  );
};

export default Home;