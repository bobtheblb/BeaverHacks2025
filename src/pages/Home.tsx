import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import QuarterNotes from '../components/QuarterNotes';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-screen overflow-hidden">
  {/* Background Quarter Notes */}
  <div className="absolute inset-0 z-0 pointer-events-auto">
    <QuarterNotes />
  </div>

  {/* Main Content */}
  <motion.div
    className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4 space-y-8 pointer-events-none"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.8 }}
  >
    <motion.h1
      className="text-6xl md:text-8xl font-extrabold h-10 font-borel pointer-events-auto"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1.5 }}
    >
      deus
    </motion.h1>

    <motion.p
      className="text-2xl mb-4 pointer-events-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.6 }}
    >
      Unlock Your Inner Musician.
    </motion.p>

    <motion.button
      className="btn btn-neutral px-6 py-3 text-lg pointer-events-auto transition-transform duration-200 hover:scale-105 hover:bg-neutral-focus"
      onClick={() => navigate('/rhythm')}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.7, duration: 0.4 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      Get Started
    </motion.button>
  </motion.div>
</div>
  );
};

export default Home;