import React, { useState, useEffect } from 'react';
import '@google/model-viewer';

const ModelViewer = ({ src, poster, alt }) => {
    const [loading, setLoading] = useState(true);

    return (
        <div className="model-viewer-container" style={{
            width: '100%',
            height: '300px',
            borderRadius: '16px',
            overflow: 'hidden',
            background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
            position: 'relative'
        }}>
            {/* Loading Overlay */}
            {loading && (
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.5)', zIndex: 1
                }}>
                    <div className="spinner"></div>
                </div>
            )}

            <model-viewer
                src={src}
                poster={poster}
                alt={alt}
                shadow-intensity="1"
                camera-controls
                auto-rotate
                touch-action="pan-y"
                style={{ width: '100%', height: '100%' }}
                onLoad={() => setLoading(false)}
            >
                {/* Custom AR Button could go here */}
                <div slot="progress-bar"></div>
            </model-viewer>
        </div>
    );
};

export default ModelViewer;
