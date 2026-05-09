import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Trophy, Coins, Play, RefreshCcw, Clock, User as UserIcon, Timer, Brain, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useUserProfile } from '../hooks/queries/useUsers';

const BIKE_SIZE = 50;
const PACKAGE_SIZE = 40;
const OBSTACLE_SIZE = 60;
const GAME_DURATION = 60; // 60 seconds

const Games = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { user: authUser } = useAuth();
    const { data: userProfile } = useUserProfile();
    const user = userProfile?.data || authUser;

    const [gameState, setGameState] = useState('loading'); // 'loading' | 'menu' | 'playing' | 'gameOver'
    const [status, setStatus] = useState({ isLive: false, startTime: '', endTime: '', leaderboard: [] });
    
    // Game States
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [bikeX, setBikeX] = useState(175); // Centered in 400px container
    const [packages, setPackages] = useState([]);
    const [obstacles, setObstacles] = useState([]);
    const [bgOffset, setBgOffset] = useState(0);

    const gameLoopRef = useRef();
    const containerRef = useRef();
    const lastSpawnRef = useRef(0);

    // Fetch Game Status
    const fetchStatus = useCallback(async () => {
        try {
            const res = await apiService.getGameStatus();
            if (res && res.success) {
                setStatus(res.data);
                setGameState('menu');
            } else {
                 setGameState('menu'); // Fallback even if successful response lacks 'success' flag
            }
        } catch (err) {
            console.error('Failed to fetch game status:', err);
            setGameState('menu');
        }
    }, []);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    const startNewGame = () => {
        if (!status.isLive) return;
        setScore(0);
        setTimeLeft(GAME_DURATION);
        setBikeX(175);
        setPackages([]);
        setObstacles([]);
        setGameState('playing');
        lastSpawnRef.current = Date.now();
    };

    const submitGameScore = async (finalScore) => {
        try {
            await apiService.submitGameScore(finalScore);
            fetchStatus(); // Refresh leaderboard
        } catch (err) {
            console.error('Failed to submit score:', err);
        }
    };

    const handleGameOver = useCallback(() => {
        setGameState('gameOver');
        submitGameScore(score);
    }, [score]);

    useEffect(() => {
        if (gameState !== 'playing') return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleGameOver();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameState, handleGameOver]);

    useEffect(() => {
        if (gameState !== 'playing') return;

        const update = () => {
            setBgOffset(prev => (prev + 5) % 1000);

            // Spawn Logic
            const now = Date.now();
            if (now - lastSpawnRef.current > 1000) {
                const type = Math.random() > 0.3 ? 'package' : 'obstacle';
                const x = Math.random() * 300 + 50;
                if (type === 'package') {
                    setPackages(prev => [...prev, { id: now, x, y: -50 }]);
                } else {
                    setObstacles(prev => [...prev, { id: now, x, y: -50 }]);
                }
                lastSpawnRef.current = now;
            }

            // Move & Collision
            setPackages(prev => {
                return prev.map(p => ({ ...p, y: p.y + 5 }))
                    .filter(p => {
                        const caught = Math.abs(p.x - bikeX) < 40 && Math.abs(p.y - 450) < 40;
                        if (caught) setScore(s => s + 10);
                        return !caught && p.y < 600;
                    });
            });

            setObstacles(prev => {
                return prev.map(o => ({ ...o, y: o.y + 7 }))
                    .filter(o => {
                        const hit = Math.abs(o.x - bikeX) < 45 && Math.abs(o.y - 450) < 45;
                        if (hit) {
                            setScore(s => Math.max(0, s - 5));
                            return false;
                        }
                        return o.y < 600;
                    });
            });

            gameLoopRef.current = requestAnimationFrame(update);
        };

        gameLoopRef.current = requestAnimationFrame(update);
        return () => cancelAnimationFrame(gameLoopRef.current);
    }, [gameState, bikeX]);

    const handleMove = (e) => {
        if (gameState !== 'playing') return;
        const rect = containerRef.current.getBoundingClientRect();
        const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
        const x = clientX - rect.left;
        setBikeX(Math.max(50, Math.min(350, x)));
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-900 flex flex-col transition-colors duration-200">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-[#CBF9B2] dark:bg-[#1a381a] rounded-b-[2.5rem] px-6 pt-4 pb-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-sm">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex flex-col items-center">
                        <h1 className="text-[16px] font-black text-gray-900 dark:text-white uppercase tracking-tighter">Homly Dash</h1>
                        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Daily Challenge</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-sm">
                        <Coins size={14} className="text-yellow-500" />
                        <span className="text-xs font-black text-gray-900 dark:text-white">{user?.coins || 0}</span>
                    </div>
                </div>
            </div>

            <div className="pt-24 px-6 flex-1 flex flex-col items-center">
                {gameState === 'loading' ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-[#2E5A2E] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : gameState === 'menu' ? (
                    <div className="w-full max-w-md space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-8 duration-500">
                        {/* Hero Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-gray-700 text-center relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                 <Timer size={120} />
                             </div>
                             <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 ${status.isLive ? 'bg-green-50 text-green-600 dark:bg-green-900/20' : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20'}`}>
                                 <div className={`w-2 h-2 rounded-full ${status.isLive ? 'bg-green-500 animate-pulse' : 'bg-rose-500'}`} />
                                 <span className="text-[10px] font-black uppercase tracking-widest">
                                     {status.isLive ? t('Challenge Live Now') : t('Challenge Starts At') + ' ' + (status.startTime || '18:00')}
                                 </span>
                             </div>
                             <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 leading-none">Deliver & Win!</h2>
                             <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Highest score at {status.endTime || '21:00'} wins 1 Coin.</p>
                             
                             <button 
                                 onClick={startNewGame}
                                 disabled={!status.isLive}
                                 className={`w-full py-5 rounded-[2rem] font-black text-lg shadow-xl flex items-center justify-center gap-3 transition-all ${status.isLive ? 'bg-[#2E5A2E] text-white shadow-[#2E5A2E]/20 active:scale-95' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                             >
                                 <Play fill="currentColor" size={24} />
                                 {t('START CHALLENGE')}
                             </button>
                        </div>

                        {/* Leaderboard */}
                        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                             <div className="flex items-center justify-between mb-6 px-2">
                                 <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
                                     <Trophy size={18} className="text-yellow-500" />
                                     {t('Leaderboard')}
                                 </h3>
                                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('Today')}</span>
                             </div>
                             <div className="space-y-3">
                                 {status.leaderboard && status.leaderboard.length > 0 ? status.leaderboard.map((entry, i) => (
                                     <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50">
                                         <div className="flex items-center gap-4">
                                             <span className={`w-6 text-xs font-black ${i === 0 ? 'text-yellow-500' : 'text-gray-400'}`}>{i + 1}</span>
                                             <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                                 {entry.user?.avatar ? <img src={entry.user.avatar} className="w-full h-full object-cover" /> : <UserIcon size={20} className="text-gray-400" />}
                                             </div>
                                             <span className="font-bold text-gray-900 dark:text-white truncate max-w-[120px]">{entry.user?.name || 'Unknown'}</span>
                                         </div>
                                         <span className="font-black text-[#2E5A2E] dark:text-[#8bc910]">{entry.score}</span>
                                     </div>
                                 )) : (
                                     <div className="text-center py-8 opacity-40">
                                         <Brain size={40} className="mx-auto mb-2" />
                                         <p className="text-xs font-bold uppercase">{t('No scores yet today')}</p>
                                     </div>
                                 )}
                             </div>
                        </div>
                    </div>
                ) : gameState === 'playing' ? (
                    <div className="w-full h-full max-w-md flex flex-col animate-in fade-in duration-500">
                        {/* Game HUD */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-2 shadow-sm flex items-center gap-3">
                                <Clock size={16} className="text-[#2E5A2E]" />
                                <span className={`text-xl font-black ${timeLeft <= 10 ? 'text-rose-500 animate-pulse' : 'text-gray-900 dark:text-white'}`}>{timeLeft}s</span>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-2 shadow-sm text-center">
                                <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Score</p>
                                <p className="text-xl font-black text-[#2E5A2E] dark:text-[#8bc910] leading-none">{score}</p>
                            </div>
                        </div>

                        {/* Game Stage */}
                        <div 
                            ref={containerRef}
                            onMouseMove={handleMove}
                            onTouchMove={handleMove}
                            className="relative flex-1 bg-[#F1F5F9] rounded-[3rem] overflow-hidden shadow-inner cursor-none"
                            style={{
                                backgroundImage: "url('/assets/games/road.png')",
                                backgroundPosition: `0 ${bgOffset}px`,
                                backgroundSize: '100% auto'
                            }}
                        >
                            {/* Player Bike */}
                            <div 
                                className="absolute bottom-20 transition-all duration-75"
                                style={{ 
                                    left: bikeX - BIKE_SIZE/2, 
                                    width: BIKE_SIZE, 
                                    height: BIKE_SIZE,
                                    backgroundImage: "url('/assets/games/bike.png')",
                                    backgroundSize: 'contain',
                                    backgroundRepeat: 'no-repeat',
                                    zIndex: 10
                                }}
                            />

                            {/* Collectibles (Packages) */}
                            {packages.map(p => (
                                <div 
                                    key={p.id}
                                    className="absolute"
                                    style={{ 
                                        left: p.x - PACKAGE_SIZE/2, 
                                        top: p.y, 
                                        width: PACKAGE_SIZE, 
                                        height: PACKAGE_SIZE,
                                        backgroundImage: "url('/assets/games/package.png')",
                                        backgroundSize: 'contain',
                                        backgroundRepeat: 'no-repeat'
                                    }}
                                />
                            ))}

                            {/* Obstacles (Traffic/Holes) */}
                            {obstacles.map(o => (
                                <div 
                                    key={o.id}
                                    className="absolute bg-rose-500/20 border-2 border-rose-500/40 rounded-full flex items-center justify-center"
                                    style={{ 
                                        left: o.x - OBSTACLE_SIZE/2, 
                                        top: o.y, 
                                        width: OBSTACLE_SIZE, 
                                        height: OBSTACLE_SIZE
                                    }}
                                >
                                    <X size={24} className="text-rose-500 opacity-50" />
                                </div>
                            ))}
                        </div>
                        <p className="py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Slide to move bike • Catch boxes!</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-center py-12 animate-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-[#CBF9B2] rounded-[2.5rem] flex items-center justify-center text-[#2E5A2E] mb-8 shadow-xl">
                             <Trophy size={48} />
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">Tour Finished!</h1>
                        <p className="text-gray-500 dark:text-gray-400 mb-12">Total Deliveries: <span className="text-[#2E5A2E] dark:text-[#8bc910] font-black">{score}</span></p>
                        
                        <div className="w-full space-y-4">
                            <button 
                                onClick={startNewGame}
                                className="w-full bg-[#2E5A2E] text-white py-5 rounded-[2rem] font-black text-lg shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                                <RefreshCcw size={22} />
                                {t('TRY AGAIN')}
                            </button>
                            <button 
                                onClick={() => setGameState('menu')}
                                className="w-full bg-white dark:bg-gray-800 text-gray-600 dark:text-white py-5 rounded-[2rem] font-black border border-gray-100 dark:border-gray-700 active:scale-95 transition-all"
                            >
                                {t('BACK TO MENU')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Games;
