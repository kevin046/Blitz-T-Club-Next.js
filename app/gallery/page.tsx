
'use client';

import { useEffect, useState } from 'react';
import { FaPlayCircle, FaCalendar, FaClock, FaYoutube, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import styles from './gallery.module.css';

interface Video {
    id: string;
    category: 'shows' | 'meetups';
    date: string;
    title?: string;
    duration?: string;
    thumbnail?: string;
    isEmbeddable?: boolean;
    loading?: boolean;
    error?: boolean;
}

const INITIAL_VIDEOS: Video[] = [
    { id: 'z53Q5buS3Bs', category: 'shows', date: '2024-10-04' },
    { id: 'cFuH-K8muxE', category: 'shows', date: '2024-12-07' },
    { id: '1qXbnV3pRZ8', category: 'meetups', date: '2024-10-19' },
    { id: 'lA4tmeWR308', category: 'shows', date: '2025-01-25' },
];

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || 'AIzaSyDcJjWNyZQ9LSflpercckQrAMYKRyKx-3I';

export default function GalleryPage() {
    const [videos, setVideos] = useState<Video[]>(INITIAL_VIDEOS.map(v => ({ ...v, loading: true })));
    const [filter, setFilter] = useState<'all' | 'shows' | 'meetups'>('all');
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

    useEffect(() => {
        const fetchVideoDetails = async () => {
            const updatedVideos = [...videos];

            for (let i = 0; i < updatedVideos.length; i++) {
                const video = updatedVideos[i];
                try {
                    const response = await fetch(
                        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,status&id=${video.id}&key=${YOUTUBE_API_KEY}`
                    );
                    const data = await response.json();

                    if (data.items && data.items.length > 0) {
                        const item = data.items[0];
                        updatedVideos[i] = {
                            ...video,
                            title: item.snippet.title,
                            duration: parseDuration(item.contentDetails.duration),
                            thumbnail: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.high?.url,
                            isEmbeddable: item.status.embeddable,
                            loading: false,
                        };
                    } else {
                        updatedVideos[i] = { ...video, loading: false, error: true };
                    }
                } catch (error) {
                    console.error(`Error fetching video ${video.id}:`, error);
                    updatedVideos[i] = { ...video, loading: false, error: true };
                }
            }
            setVideos(updatedVideos);
        };

        fetchVideoDetails();
    }, []);

    const parseDuration = (duration: string) => {
        const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
        if (!match) return '0:00';
        const hours = (match[1] || '').replace('H', '');
        const minutes = (match[2] || '').replace('M', '');
        const seconds = (match[3] || '').replace('S', '');

        let result = '';
        if (hours) result += `${hours}:`;
        if (minutes) result += `${minutes.padStart(2, '0')}:`;
        else result += '0:';
        if (seconds) result += seconds.padStart(2, '0');
        else result += '00';
        return result;
    };

    const filteredVideos = (filter === 'all' ? videos : videos.filter(v => v.category === filter))
        .filter(v => !v.error); // Remove unavailable videos

    return (
        <div className={styles.galleryPage}>
            <header className={styles.header}>
                <h1>Club Gallery</h1>
                <p>Memories from Our Past Events</p>
                <a href="https://www.youtube.com/@BlitzTClub-Toronto/videos" target="_blank" rel="noopener noreferrer" className={styles.youtubeLink}>
                    <FaYoutube /> View More Videos on YouTube
                </a>
            </header>

            <div className={styles.filters}>
                <button
                    className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All
                </button>
                <button
                    className={`${styles.filterBtn} ${filter === 'meetups' ? styles.active : ''}`}
                    onClick={() => setFilter('meetups')}
                >
                    Meetups
                </button>
                <button
                    className={`${styles.filterBtn} ${filter === 'shows' ? styles.active : ''}`}
                    onClick={() => setFilter('shows')}
                >
                    Car Shows
                </button>
            </div>

            <div className={styles.galleryGrid}>
                {filteredVideos.map(video => (
                    <div
                        key={video.id}
                        className={`${styles.galleryItem} ${video.loading ? styles.loading : ''} ${video.error ? styles.error : ''}`}
                        onClick={() => !video.error && !video.loading && setSelectedVideo(video)}
                    >
                        <img
                            src={video.thumbnail || `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
                            alt={video.title || 'Loading...'}
                            className={styles.thumbnail}
                        />
                        <div className={styles.overlay}>
                            <h3>{video.loading ? 'Loading...' : (video.title || 'Video Unavailable')}</h3>
                            <p className={styles.meta}>
                                <span suppressHydrationWarning><FaCalendar /> {new Date(video.date).toLocaleDateString()}</span>
                                <span><FaClock /> {video.duration || '--:--'}</span>
                            </p>
                            {video.error ? (
                                <div className={styles.errorMsg}>
                                    <FaExclamationTriangle /> Unavailable
                                </div>
                            ) : (
                                <button className={styles.playBtn}>
                                    <FaPlayCircle />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {selectedVideo && (
                <div className={styles.modal} onClick={() => setSelectedVideo(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <button className={styles.closeBtn} onClick={() => setSelectedVideo(null)}>
                            <FaTimes />
                        </button>
                        {selectedVideo.isEmbeddable === false ? (
                            <div className={styles.embedError}>
                                <FaExclamationTriangle size={48} color="#ff4444" />
                                <h3>Video Not Embeddable</h3>
                                <p>This video cannot be played here due to YouTube restrictions.</p>
                                <a
                                    href={`https://www.youtube.com/watch?v=${selectedVideo.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.youtubeLink}
                                >
                                    Watch on YouTube
                                </a>
                            </div>
                        ) : (
                            <iframe
                                src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1&rel=0`}
                                title={selectedVideo.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
